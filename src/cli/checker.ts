import * as chromeLauncher from "chrome-launcher";
import * as dateformat from "dateformat";
import * as fs from "fs";
import * as lighthouseConfig from "lighthouse/lighthouse-core/config/default-config";
import * as tempDir from "temp-dir";
import * as lighthouseIgnore from "../main/lighthouse-ignore";
import { BaselineEntry } from "../main/lighthouse-ignore-config";
import * as logger from "./logger";

export function check(url: string, lighthouseIgnoreConfigPath?: string) {
    const config = lighthouseIgnore.readLighthouseIgnoreConfig(lighthouseIgnoreConfigPath);
    lighthouseIgnore.filterLighthouseConfig(lighthouseConfig, config);
    logger.info("Launching Chrome and running Lighthouse audits\n");
    lighthouseIgnore.launchChromeAndRunLighthouse(
        url,
        config.chromeOptions,
        config.lighthouseOptions,
        lighthouseConfig,
    ).then(results => writeResults(results, config.baseline, config.lighthouseOptions.output));
}

function writeResults(
    results: lighthouseIgnore.Results,
    baselineEntries: BaselineEntry[],
    outputFormat: string,
) {
    const baseline = toMap(baselineEntries);
    let regularSuccessCount = 0;
    const baselineSuccesses: string[] = [];
    const baselineTolerated: string[] = [];
    const failures: string[] = [];

    for (const auditResult of (Object.values(results.lhr.audits) as any[])) {
        const baselineScore = baseline.get(auditResult.id);
        switch (auditResult.scoreDisplayMode) {
            case "binary":
            case "numeric":
                if (baselineScore !== undefined) {
                    if (auditResult.score === 1) {
                        baselineSuccesses.push(toString(auditResult));
                    } else if (auditResult.score >= baselineScore) {
                        baselineTolerated.push(toString(auditResult));
                    } else {
                        failures.push(toString(auditResult));
                    }
                } else {
                    if (auditResult.score === 1) {
                        regularSuccessCount++;
                    } else {
                        failures.push(toString(auditResult));
                    }
                }
                break;
            case "error":
                failures.push(`${toString(auditResult)}: ${auditResult.errorMessage}`);
                break;
            default:
                // Ignore
                break;
        }
    }

    const successCount = regularSuccessCount + baselineSuccesses.length;
    logger.success(`${successCount} audits have been successful.`);
    logger.info();

    if (baselineSuccesses.length > 0) {
        logger.success(
            "This includes the folowing audits from the baseline, "
            + "which you may want to remove from the baseline now:"
        );
        baselineSuccesses.forEach(it => logger.success(`- ${it}`));
        logger.info();
    }

    if (baselineTolerated.length > 0) {
        logger.warning(
            `${baselineTolerated.length} audits where unsuccessful but have fulfilled baseline requirements:`
        );
        baselineTolerated.forEach(it => logger.warning(`- ${it}`));
        logger.info();
    }

    if (failures.length > 0) {
        logger.error(`${failures.length} audits have failed:`);
        failures.forEach(it => logger.error(`- ${it}`));
        logger.info();
    }

    logger.info("See report file for details. (Opens in Chrome)");
    const exitCode = failures.length === 0 ? 0 : 1;
    const reportFilePath = getReportFilePath(results.lhr.requestedUrl, outputFormat);
    fs.writeFileSync(reportFilePath, results.report);
    chromeLauncher.launch({ startingUrl: reportFilePath }).then(() => process.exit(exitCode));
}

function toMap(baselineEntries: BaselineEntry[]): Map<string, number> {
    return baselineEntries.reduce((map, entry) => {
        map.set(entry.auditId, entry.score);
        return map;
    }, new Map());
}

function toString(auditResult: any): string {
    return `${auditResult.id}: ${auditResult.title}`
        + (auditResult.scoreDisplayMode === "numeric" ? `: ${auditResult.score * 100}%` : "");
}

function getReportFilePath(url: string, extension: string): string {
    const dir = tempDir + (tempDir.endsWith("/") ? "" : "/");
    const page = (url.endsWith("/") ? url.substring(0, url.length - 1) : url)
        .replace("http://", "")
        .replace("https://", "")
        .replace(/\//g, "-");
    const date = dateformat(new Date(), "yyyy-mm-dd-HH-MM-ss");
    return `${dir}lighthouse_${page}_${date}.${extension}`;
}
