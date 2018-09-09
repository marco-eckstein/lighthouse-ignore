/**
 * This file specifies the JSON configuration file format.
 *
 * A list of available audit ids can be found in Lighthouse's default configuration at
 * https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/default-config.js.
 * At some places, the default configuration uses long audit ids (e.g. "metrics/first-cpu-idle"),
 * at other places, it uses short audit ids (e.g. "first-cpu-idle").
 * You can use the short or the long version just as you prefer.
 */

export interface LighthouseIgnoreConfig {
    /**
     * Optional Chrome options.
     *
     * These are exactly the same options as used by https://www.npmjs.com/package/chrome-launcher.
     *
     * If you do not specify the option chromeFlags, Lighthouse-Ignore will use chromeFlags = ["--headless"].
     */
    readonly chromeOptions: any;

    /**
     * Optional Lighthouse options.
     *
     * These are exactly the same options you would specify when using Lighthouse programmatically.
     * See https://github.com/GoogleChrome/lighthouse/blob/master/docs/readme.md#using-programmatically.
     *
     * If you specify a port, it will be ignored. Use Chrome options to specify the port.
     * If you do not specify the option output, Lighthouse-Ignore will use output = "html".
     */
    readonly lighthouseOptions: any;

    readonly ignored: IgnoreEntry[];

    readonly baseline: BaselineEntry[];
}

export interface IgnoreEntry {
    /**
     * The id of the audit that must be ignored.
     */
    readonly auditId: string;

    /**
     * An optional justification why it is OK to ignore this audit.
     */
    readonly justification?: string;
}

export interface BaselineEntry {
    /**
     * The id of the audit.
     */
    readonly auditId: string;

    /**
     * The minimum score (inclusive) that the audit must have in order to be tolerated.
     * For binary audits, use 0 (i.e. fail).
     */
    readonly score: number;
}
