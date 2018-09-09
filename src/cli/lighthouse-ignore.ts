#!/usr/bin/env node

import * as program from "commander";

import * as packageJson from "../../package.json";
import { defaultConfigPath } from "../main/lighthouse-ignore";
import { check } from "./checker";
import * as logger from "./logger";

const version = (packageJson as any).version;

program
    .usage("<url> [options]")
    .option("--configPath [string]", "path to lighthouse-ignore config file", defaultConfigPath)
    .version(version)
    .parse(process.argv);

if (program.args.length > 0) {
    const url = program.args[0];
    check(url, program.configPath);
} else {
    logger.error(program.helpInformation());
    process.exit(1);
}
