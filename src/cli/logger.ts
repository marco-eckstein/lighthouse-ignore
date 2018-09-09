import * as cliColor from "cli-color";

export function info(s: string = "") {
    console.info(s);
}

export function success(s: string = "") {
    console.info(cliColor.greenBright(s));
}

export function warning(s: string = "") {
    console.info(cliColor.yellowBright(s));
}

export function error(s: string = "") {
    console.error(cliColor.redBright(s));
}
