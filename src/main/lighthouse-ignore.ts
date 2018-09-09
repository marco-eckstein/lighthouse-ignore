import * as chromeLauncher from "chrome-launcher";
import { readFileSync } from "fs";
import * as lighthouse from "lighthouse";

import { LighthouseIgnoreConfig } from "./lighthouse-ignore-config";

export const defaultConfigPath = "./lighthouse-ignore-config.json";

export function filterLighthouseConfig(
    lighthouseConfig: any,
    lighthouseIgnoreConfig: LighthouseIgnoreConfig,
) {
    const ignoredAuditIds =
        lighthouseIgnoreConfig.ignored
            .map(entry => entry.auditId)
            .map(auditId => auditId.split("/").pop());

    lighthouseConfig.audits = lighthouseConfig.audits.filter(it => !ignoredAuditIds.includes(getId(it)));

    for (const key of Object.getOwnPropertyNames(lighthouseConfig.categories)) {
        lighthouseConfig.categories[key].auditRefs =
            lighthouseConfig.categories[key].auditRefs.filter(it => !ignoredAuditIds.includes(it.id));
    }
}

function getId(auditFullId: string): string {
    return auditFullId.split("/").reverse()[0];
}

export function readLighthouseIgnoreConfig(path: string = defaultConfigPath): LighthouseIgnoreConfig {
    const config = JSON.parse(readFileSync(path).toString());

    if (!config.chromeOptions) {
        config.chromeOptions = {};
    }

    if (!config.chromeOptions.chromeFlags) {
        config.chromeOptions.chromeFlags = ["--headless"];
    }

    if (!config.lighthouseOptions) {
        config.lighthouseOptions = {};
    }

    if (!config.lighthouseOptions.output) {
        config.lighthouseOptions.output = "html";
    }

    if (!config.ignored) {
        config.ignored = [];
    }

    if (!config.baseline) {
        config.baseline = [];
    }

    return config;
}

export function launchChromeAndRunLighthouse(
    url: string,
    chromeOptions: any,
    lighthouseOptions: any,
    lighthouseConfig: any,
): Promise<Results> {
    return chromeLauncher.launch(chromeOptions).then(chrome => {
        lighthouseOptions.port = chrome.port;
        return lighthouse(url, lighthouseOptions, lighthouseConfig).then(results => {
            return chrome.kill().then(() => results);
        });
    });
}

export interface Results {
    lhr: any;
    report: any;
    artifacts: any;
}
