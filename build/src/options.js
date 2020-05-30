"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerOptions = exports.formatTypes = exports.logTypes = exports.destinationTypes = exports.multilineTypes = exports.fileWriteModeTypes = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const LoggerOptionsError_1 = require("./errors/LoggerOptionsError");
var fileWriteModeTypes;
(function (fileWriteModeTypes) {
    fileWriteModeTypes["ASYNC"] = "writeFileAsync";
    fileWriteModeTypes["STREAM"] = "writeFileStream";
})(fileWriteModeTypes = exports.fileWriteModeTypes || (exports.fileWriteModeTypes = {}));
var multilineTypes;
(function (multilineTypes) {
    multilineTypes["ALWAYS"] = "always";
    multilineTypes["AS_NEEDED"] = "as-needed";
    multilineTypes["NEVER"] = "never";
})(multilineTypes = exports.multilineTypes || (exports.multilineTypes = {}));
var destinationTypes;
(function (destinationTypes) {
    destinationTypes["CONSOLE"] = "console";
    destinationTypes["FILE"] = "file";
})(destinationTypes = exports.destinationTypes || (exports.destinationTypes = {}));
var logTypes;
(function (logTypes) {
    logTypes["INFO"] = "info";
    logTypes["ERROR"] = "error";
    logTypes["DEBUG"] = "debug";
    logTypes["TIMER"] = "timer";
})(logTypes = exports.logTypes || (exports.logTypes = {}));
var formatTypes;
(function (formatTypes) {
    formatTypes["LABEL"] = "labelFormat";
    formatTypes["PID"] = "pidFormat";
    formatTypes["PORT"] = "portFormat";
    formatTypes["DATE"] = "dateFormat";
    formatTypes["TIME"] = "timeFormat";
    formatTypes["TIMER"] = "timerFormat";
    formatTypes["INFO"] = "infoMessageFormat";
    formatTypes["INFO2"] = "infoSecondaryFormat";
    formatTypes["ERROR"] = "errorMessageFormat";
    formatTypes["ERROR2"] = "errorSecondaryFormat";
    formatTypes["DEBUG"] = "debugMessageFormat";
    formatTypes["DEBUG2"] = "debugSecondaryFormat";
})(formatTypes = exports.formatTypes || (exports.formatTypes = {}));
class LoggerOptions {
    /**
     * Max amount of text that will attempt to fit on one line before a line break
     * is inserted
     * @returns     {{ size: number, regEx: RegExp }}
     */
    // eslint-disable-next-line complexity
    constructor(inputOptions) {
        this.dev = process.env.NODE_ENV === `development`;
        /**
         * File option defaults
         */
        this.enableLogFile = false;
        this.fileWriteMode = fileWriteModeTypes.ASYNC;
        this.logDirectory = `./logs`;
        this.logFilename = `info.log`;
        // onFileWriteFinish: ( info: eventInfoType ) => void;
        // fileWriter: ( filePath: string, fileText: string ) => Promise<string|void>;
        // onFileWriteStart ( info: eventInfoType ): void {};
        // onFileWriteFinish ( info: eventInfoType ): void {};
        // async fileWriter ( filePath: string, fileText: string ): Promise<string|void> {};
        /**
         * Console option defaults
         */
        this.enableConsole = true;
        this.consoleMaxWidth = process.stdout.columns || 120;
        this.consoleMultiLine = multilineTypes.ALWAYS;
        /**
         * Layout option defaults
         */
        this.prefixWithDateTime = true;
        this.prefixWithMessageType = true;
        this.pidPrefix = String(process.pid);
        this.portPrefix = ``;
        /**
         * Formatting option defaults
         */
        this.labelFormat = [`bold`];
        this.pidFormat = [`white`];
        this.portFormat = [`bold`];
        this.dateFormat = [`grey`];
        this.timeFormat = [`yellow`];
        this.timerFormat = [
            `greenBright`,
            `inverse`,
        ];
        this.infoMessageFormat = [`blueBright`];
        this.infoSecondaryFormat = [`whiteBright`];
        this.errorMessageFormat = [
            `bold`,
            `redBright`,
        ];
        this.errorSecondaryFormat = [`yellowBright`];
        this.debugMessageFormat = [`cyanBright`];
        this.debugSecondaryFormat = [`whiteBright`];
        let options = inputOptions;
        if (!options || Object.keys(options).length === 0 || typeof options !== `object`) {
            options = {};
        }
        if (Array.isArray(options)) {
            throw new LoggerOptionsError_1.LoggerOptionsError(`Cannot process options provided. Must be an object with key/value pairs`);
        }
        if (`dev` in options) {
            this.dev = !!options.dev;
        }
        /**
         * Set provided file options
         */
        if (`enableLogFile` in options) {
            this.enableLogFile = !!options.enableLogFile;
        }
        if (`fileWriteMode` in options) {
            this.fileWriteMode = LoggerOptions.getFileWriteMode(options.fileWriteMode);
        }
        if (`logDirectory` in options) {
            this.logDirectory = LoggerOptions.getlogDirectory(options.logDirectory);
        }
        if (`logFilename` in options) {
            this.logFilename = options.logFilename;
        }
        if (this.dev === true) {
            if (`onFileWriteStart` in options && typeof options.onFileWriteStart === `function`) {
                this.onFileWriteStart = options.onFileWriteStart.bind(this);
            }
            if (`onFileWriteFinish` in options && typeof options.onFileWriteFinish === `function`) {
                this.onFileWriteFinish = options.onFileWriteFinish.bind(this);
            }
        }
        /**
         * Set provided console options
         */
        /**
         * Pretty much the main point of this lib but maybe you don't want
         * words in your terminal so disable here
         */
        if (`enableConsole` in options) {
            this.enableConsole = !!options.enableConsole;
        }
        if (`consoleMaxWidth` in options) {
            this.consoleMaxWidth = ~~options.consoleMaxWidth;
        }
        if (`consoleMultiLine` in options) {
            this.consoleMultiLine = options.consoleMultiLine;
        }
        /**
         * Set provided layout options
         */
        /**
         * The message will be prepended with a locale-formatted datetime
         * @default true
         */
        if (`prefixWithDateTime` in options) {
            this.prefixWithDateTime = !!options.prefixWithDateTime;
        }
        /**
         * All-caps notifier of what type of message is being logged
         * @example "ERROR:"
         * @default true
         */
        if (`prefixWithMessageType` in options) {
            this.prefixWithMessageType = !!options.prefixWithMessageType;
        }
        /**
         * Process ID in system
         * @default process.pid
         */
        if (`pidPrefix` in options) {
            this.pidPrefix = String(options.pidPrefix);
        }
        /**
         * Port the server is bound to
         * @default ''
         */
        if (`portPrefix` in options) {
            this.portPrefix = String(options.portPrefix);
        }
        /**
         * Set provided formatting options
         */
        /**
         * @type    {string[]}
         */
        if (`labelFormat` in options) {
            this.labelFormat = [...options.labelFormat];
        }
        if (`pidFormat` in options) {
            this.pidFormat = [...options.pidFormat];
        }
        if (`portFormat` in options) {
            this.portFormat = [...options.portFormat];
        }
        if (`dateFormat` in options) {
            this.dateFormat = [...options.dateFormat];
        }
        if (`timeFormat` in options) {
            this.timeFormat = [...options.timeFormat];
        }
        if (`timerFormat` in options) {
            this.timerFormat = [...options.timerFormat];
        }
        if (`infoMessageFormat` in options) {
            this.infoMessageFormat = [...options.infoMessageFormat];
        }
        if (`infoSecondaryFormat` in options) {
            this.infoSecondaryFormat = [...options.infoSecondaryFormat];
        }
        if (`errorMessageFormat` in options) {
            this.errorMessageFormat = [...options.errorMessageFormat];
        }
        if (`errorSecondaryFormat` in options) {
            this.errorSecondaryFormat = [...options.errorSecondaryFormat];
        }
        if (`debugMessageFormat` in options) {
            this.debugMessageFormat = [...options.debugMessageFormat];
        }
        if (`debugSecondaryFormat` in options) {
            this.debugSecondaryFormat = [...options.debugSecondaryFormat];
        }
    }
    onFileWriteStart(info) {
        return true;
    }
    ;
    onFileWriteFinish(info) {
        return true;
    }
    ;
    /**
     * Determines which method to use for writing the log to the
     * filesystem.
     *  - fileWriteModeTypes.ASYNC  - async file write using fs.appendFile
     *  - fileWriteModeTypes.STREAM - keep file stream open and pipe new writes on demand
     *
     * @param   {fileWriteModeTypes}    value
     * @returns {fileWriteModeTypes}
     */
    static getFileWriteMode(value) {
        const regModes = /^writeFileAsync|writeFileStream$/;
        if (regModes.test(value)) {
            return value;
        }
        return fileWriteModeTypes.ASYNC;
    }
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
    static getlogDirectory(value) {
        const regDots = /^\.\.?\//;
        /**
         * Just a quick check for `..` or `.` to handle relative paths
         */
        if (regDots.test(value)) {
            return path_1.default.resolve(process.env.PWD || `./`, value);
        }
        return value;
    }
}
exports.LoggerOptions = LoggerOptions;
