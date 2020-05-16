import path from "path";
import LoggerOptionsError from "./errors/LoggerOptionsError";

export type consoleMaxWidthType = {
    size: number;
    regEx: RegExp;
};

class LoggerOptions {
    dev: boolean = process.env.NODE_ENV === `development`;

    /**
     * File option defaults
     */
    fileWriteMode = `writeFileAsync`;
    logFileDirectory = `./logs`;
    enableLogFiles = true;
    infoFilename = `info`;
    errorFilename = `error`;
    debugFilename = `debug`;
    logFileExtension = `log`;
    logFileSizeLimit = 5000000;

    /**
     * Console option defaults
     */
    enableConsole = true;
    consoleMaxWidth: consoleMaxWidthType = {
        size: process.stdout.columns || 120,
        regEx: new RegExp(`(.{${process.stdout.columns || 120}})`, `g`),
    };
    consoleMultiLine = `always`;

    /**
     * Layout option defaults
     */
    prefixWithDateTime = true;
    prefixWithMessageType = true;
    pidPrefix = String(process.pid);
    portPrefix = ``;

    /**
     * Formatting option defaults
     */
    labelFormat: string[] = [ `bold` ];
    pidFormat: string[] = [ `white` ];
    portFormat: string[] = [ `bold` ];
    dateFormat: string[] = [ `grey` ];
    timeFormat: string[] = [ `yellow` ];
    timerFormat: string[] = [
        `green`,
        `inverse`,
    ];
    infoMessageFormat: string[] = [ `blueBright` ];
    infoSecondaryFormat: string[] = [ `whiteBright` ];
    errorMessageFormat: string[] = [
        `bold`,
        `redBright`,
    ];
    errorSecondaryFormat: string[] = [ `yellowBright` ];
    debugMessageFormat: string[] = [ `cyanBright` ];
    debugSecondaryFormat: string[] = [ `whiteBright` ];

    /**
     * Determines which method to use for writing the log to the
     * filesystem.
     *  - writeFileAsync - async file write using fs.appendFile
     *  - writeFileStream - keep file stream open and pipe new writes on demand
     *
     * @default "writeFileAsync"
     * @param   {string}    value
     * @returns {string}
     */
    private static getFileWriteMode = function getFileWriteMode ( value: string ) {
        const regModes = /^writeFileAsync|writeFileStream$/;

        if ( regModes.test(value) ) {
            return value;
        }

        return `writeFileAsync`;
    };

    /**
     * Directory to store the log files if `enableLogFiles` is `true`
     *
     * - absolute path
     *  "/var/log/www"
     *
     * - relative path
     *  "../../home/my-logs"
     *
     * - empty path will use current working directory
     *  path.join(__dirname, ".")
     *  path.join(__dirname, "./logs")
     *
     *  default: "./logs"
     */
    private static getLogFileDirectory = function getLogFileDirectory ( value: string ) {
        const regDots = /^\.\.?\//;

        /**
         * Just a quick check for `..` or `.` to handle relative paths
         */
        if ( regDots.test(value) ) {
            return path.join(process.env.PWD || __dirname, value);
        }

        return value;
    };

    /**
     * Max amount of text that will attempt to fit on one line before a line break
     * is inserted
     * @returns     {{ size: number, regEx: RegExp }}
     */
    private static getConsoleMaxWidth ( { size }: { size: number } ): consoleMaxWidthType {
        const regEx = new RegExp(`(.{${size}})`, `g`);

        return {
            size,
            regEx,
        };
    }

    // eslint-disable-next-line complexity
    constructor ( inputOptions: LoggerOptions|{}|[]|void ) {
        let options = inputOptions;

        if ( !options || Object.keys(options).length === 0 || typeof options !== `object` ) {
            options = {};
        }

        if ( Array.isArray(options) ) {
            throw new LoggerOptionsError(`Cannot process options provided. Must be an object with key/value pairs`);
        }

        if ( `dev` in options ) {
            this.dev = !!options.dev;
        }

        /**
         * Set provided file options
         */

        if ( `fileWriteMode` in options ) {
            this.fileWriteMode = LoggerOptions.getFileWriteMode(options.fileWriteMode);
        }

        if ( `logFileDirectory` in options ) {
            this.logFileDirectory = LoggerOptions.getLogFileDirectory(options.logFileDirectory);
        }

        if ( `enableLogFiles` in options ) {
            this.enableLogFiles = !!options.enableLogFiles;
        }

        /**
         * @default "info"
         */
        if ( `infoFilename` in options ) {
            this.infoFilename = options.infoFilename;
        }

        /**
         * @default "error"
         */
        if ( `errorFilename` in options ) {
            this.errorFilename = options.errorFilename;
        }

        /**
         * @default "debug"
         */
        if ( `debugFilename` in options ) {
            this.debugFilename = options.debugFilename;
        }

        /**
         * Extension to use at the end of the filename
         */
        if ( `logFileExtension` in options ) {
            this.logFileExtension = options.logFileExtension;
        }

        /**
         * Number of bytes to allow log to reach before renaming and starting a new one
         */
        if ( `logFileSizeLimit` in options ) {
            this.logFileSizeLimit = ~~options.logFileSizeLimit;
        }

        /**
         * Set provided console options
         */

        /**
         * Pretty much the main point of this lib but maybe you don't want
         * words in your terminal so disable here
         */
        if ( `enableConsole` in options ) {
            this.enableConsole = !!options.enableConsole;
        }

        if ( `consoleMaxWidth` in options ) {
            this.consoleMaxWidth = LoggerOptions.getConsoleMaxWidth(options.consoleMaxWidth);
        }

        /**
         * @property {"always"|"as-needed"|"never"}
         * @default "always"
         */
        if ( `consoleMultiLine` in options ) {
            this.consoleMultiLine = options.consoleMultiLine;
        }

        /**
         * Set provided layout options
         */

        /**
         * The message will be prepended with a locale-formatted datetime
         * @default true
         */
        if ( `prefixWithDateTime` in options ) {
            this.prefixWithDateTime = !!options.prefixWithDateTime;
        }

        /**
         * All-caps notifier of what type of message is being logged
         * @example "ERROR:"
         * @default true
         */
        if ( `prefixWithMessageType` in options ) {
            this.prefixWithMessageType = !!options.prefixWithMessageType;
        }

        /**
         * Process ID in system
         * @default process.pid
         */
        if ( `pidPrefix` in options ) {
            this.pidPrefix = String(options.pidPrefix);
        }

        /**
         * Port the server is bound to
         * @default ''
         */
        if ( `portPrefix` in options ) {
            this.portPrefix = String(options.portPrefix);
        }

        /**
         * Set provided formatting options
         */

        /**
         * @type    {string[]}
         */
        if ( `labelFormat` in options ) {
            this.labelFormat = [ ...options.labelFormat ];
        }

        if ( `pidFormat` in options ) {
            this.pidFormat = [ ...options.pidFormat ];
        }

        if ( `portFormat` in options ) {
            this.portFormat = [ ...options.portFormat ];
        }

        if ( `dateFormat` in options ) {
            this.dateFormat = [ ...options.dateFormat ];
        }

        if ( `timeFormat` in options ) {
            this.timeFormat = [ ...options.timeFormat ];
        }

        if ( `timerFormat` in options ) {
            this.timerFormat = [ ...options.timerFormat ];
        }

        if ( `infoMessageFormat` in options ) {
            this.infoMessageFormat = [ ...options.infoMessageFormat ];
        }

        if ( `infoSecondaryFormat` in options ) {
            this.infoSecondaryFormat = [ ...options.infoSecondaryFormat ];
        }

        if ( `errorMessageFormat` in options ) {
            this.errorMessageFormat = [ ...options.errorMessageFormat ];
        }

        if ( `errorSecondaryFormat` in options ) {
            this.errorSecondaryFormat = [ ...options.errorSecondaryFormat ];
        }

        if ( `debugMessageFormat` in options ) {
            this.debugMessageFormat = [ ...options.debugMessageFormat ];
        }

        if ( `debugSecondaryFormat` in options ) {
            this.debugSecondaryFormat = [ ...options.debugSecondaryFormat ];
        }
    }
}

export default LoggerOptions;
