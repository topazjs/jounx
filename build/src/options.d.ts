export declare type formattingType = string[];
export declare enum fileWriteModeTypes {
    ASYNC = "writeFileAsync",
    STREAM = "writeFileStream"
}
export declare enum multilineTypes {
    ALWAYS = "always",
    AS_NEEDED = "as-needed",
    NEVER = "never"
}
export declare type fileWriterType = (filePath: string, fileText: string) => Promise<string | void>;
export declare enum destinationTypes {
    CONSOLE = "console",
    FILE = "file"
}
export declare enum logTypes {
    INFO = "info",
    ERROR = "error",
    DEBUG = "debug",
    TIMER = "timer"
}
export declare enum formatTypes {
    LABEL = "labelFormat",
    PID = "pidFormat",
    PORT = "portFormat",
    DATE = "dateFormat",
    TIME = "timeFormat",
    TIMER = "timerFormat",
    INFO = "infoMessageFormat",
    INFO2 = "infoSecondaryFormat",
    ERROR = "errorMessageFormat",
    ERROR2 = "errorSecondaryFormat",
    DEBUG = "debugMessageFormat",
    DEBUG2 = "debugSecondaryFormat"
}
export declare type eventInfoType = {
    currentPath: string;
    type: logTypes;
    fileWriteId: bigint;
};
export declare abstract class LoggerOptions {
    dev: boolean;
    /**
     * File option defaults
     */
    enableLogFile: boolean;
    fileWriteMode: fileWriteModeTypes;
    logDirectory: string;
    logFilename: string;
    onFileWriteStart(info: eventInfoType): void | boolean;
    onFileWriteFinish(info: eventInfoType): void | boolean;
    /**
     * Console option defaults
     */
    enableConsole: boolean;
    consoleMaxWidth: number;
    consoleMultiLine: multilineTypes;
    /**
     * Layout option defaults
     */
    prefixWithDateTime: boolean;
    prefixWithMessageType: boolean;
    pidPrefix: string;
    portPrefix: string;
    /**
     * Formatting option defaults
     */
    labelFormat: formattingType;
    pidFormat: formattingType;
    portFormat: formattingType;
    dateFormat: formattingType;
    timeFormat: formattingType;
    timerFormat: formattingType;
    infoMessageFormat: formattingType;
    infoSecondaryFormat: formattingType;
    errorMessageFormat: formattingType;
    errorSecondaryFormat: formattingType;
    debugMessageFormat: formattingType;
    debugSecondaryFormat: formattingType;
    /**
     * Determines which method to use for writing the log to the
     * filesystem.
     *  - fileWriteModeTypes.ASYNC  - async file write using fs.appendFile
     *  - fileWriteModeTypes.STREAM - keep file stream open and pipe new writes on demand
     *
     * @param   {fileWriteModeTypes}    value
     * @returns {fileWriteModeTypes}
     */
    static getFileWriteMode(value: fileWriteModeTypes): fileWriteModeTypes;
    /**
     * Directory to store the log files if `enableLogFile` is `true`
     *
     * - absolute path
     *  "/var/log/www"
     *
     * - relative path
     *  "../../home/my-logs"
     *
     * - empty path will use current working directory
     *  path.resolve("./", ".")
     *  path.resolve("./", "./logs")
     *
     *  default: "./logs"
     */
    static getlogDirectory(value: string): string;
    /**
     * Max amount of text that will attempt to fit on one line before a line break
     * is inserted
     * @returns     {{ size: number, regEx: RegExp }}
     */
    constructor(inputOptions?: LoggerOptions | {});
}
