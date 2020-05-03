'use strict';

const path = require('path');

const LoggerOptionsError = require('./errors/LoggerOptionsError');

class LoggerOptions {
    constructor ( ...info ) {
        let [ options ] = info;

        if ( !options || Object.keys(options).length === 0 || typeof options !== `object` ) {
            options = {};
        }

        if ( Array.isArray(options) ) {
            throw new LoggerOptionsError(`Cannot process options provided. Must be an object with key/value pairs`);
        }

        this.dev = `dev` in options
            ? !!options.dev
            : process.env.NODE_ENV === `development`;

        /**
         * Not currently implemented.  Intention is to eventually hook
         * into an API and pass the messages as they occur (for instance, an ELK stack)
         */
        this.enableExternal = `enableExternal` in options
            ? !!options.enableExternal
            : false;

        this.setupFileOptions(options);
        this.setupConsoleOptions(options);
        this.setupLayoutOptions(options);
        this.setupFormattingOptions(options);
    }

    setupFileOptions ( options ) {
        this.fileWriteMode = `fileWriteMode` in options
            ? LoggerOptions.getFileWriteMode(options.fileWriteMode)
            : `writeFileAsync`;

        this.logFileDirectory = `logFileDirectory` in options
            ? LoggerOptions.getLogFileDirectory(options.logFileDirectory)
            : `./logs`;

        this.enableLogFiles = `enableLogFiles` in options
            ? !!options.enableLogFiles
            : true;

        /**
         * @default "info"
         */
        this.infoFilename = `infoFilename` in options
            ? options.infoFilename
            : "info";

        /**
         * @default "error"
         */
        this.errorFilename = `errorFilename` in options
            ? options.errorFilename
            : "error";

        /**
         * @default "debug"
         */
        this.debugFilename = `debugFilename` in options
            ? options.debugFilename
            : "debug";

        /**
         * Extension to use at the end of the filename
         */
        this.logFileExtension = `logFileExtension` in options
            ? options.logFileExtension
            : "log";

        /**
         * Number of bytes to allow log to reach before renaming and starting a new one
         */
        this.logFileSizeLimit = `logFileSizeLimit` in options
            ? ~~options.logFileSizeLimit
            : 5000000;
    }

    setupConsoleOptions ( options ) {
        /**
         * Pretty much the main point of this lib but maybe you don't want
         * words in your terminal so disable here
         */
        this.enableConsole = `enableConsole` in options
            ? !!options.enableConsole
            : true;

        this.consoleMaxWidth = `consoleMaxWidth` in options
            ? ~~LoggerOptions.getConsoleMaxWidth(options.consoleMaxWidth)
            : process.stdout.columns || 120;

        /**
         * @property {always|as-needed|never}
         * @default "always"
         */
        this.consoleMultiLine = `consoleMultiLine` in options
            ? options.consoleMultiLine
            : `always`;
    }

    setupLayoutOptions ( options ) {
        /**
         * The message will be prepended with a locale-formatted datetime
         * @default true
         */
        this.prefixWithDateTime = `prefixWithDateTime` in options
            ? !!options.prefixWithDateTime
            : true;

        /**
         * All-caps notifier of what type of message is being logged
         * @example "ERROR:"
         * @default true
         */
        this.prefixWithMessageType = `prefixWithMessageType` in options
            ? !!options.prefixWithMessageType
            : true;

        /**
         * Process ID in system
         * @default process.pid
         */
        this.pidPrefix = `pidPrefix` in options
            ? String(options.pidPrefix)
            : String(process.pid);

        /**
         * Port the server is bound to
         * @default ''
         */
        this.portPrefix = `portPrefix` in options
            ? String(options.portPrefix)
            : ``;
    }

    setupFormattingOptions ( options ) {
        /**
         * @type    {string[]}
         */
        this.labelFormat = `labelFormat` in options
            ? [].concat(options.labelFormat)
            : [ `bold` ];

        this.pidFormat = `pidFormat` in options
            ? [].concat(options.pidFormat)
            : [ `white` ];

        this.portFormat = `portFormat` in options
            ? [].concat(options.portFormat)
            : [ `bold` ];

        this.dateFormat = `dateFormat` in options
            ? [].concat(options.dateFormat)
            : [ `grey` ];

        this.timeFormat = `timeFormat` in options
            ? [].concat(options.timeFormat)
            : [ `yellow` ];

        this.timerFormat = `timerFormat` in options
            ? [].concat(options.timerFormat)
            // eslint-disable-next-line array-element-newline
            : [ `green`, `inverse` ];

        this.infoMessageFormat = `infoMessageFormat` in options
            ? [].concat(options.infoMessageFormat)
            : [ `blueBright` ];

        this.infoSecondaryFormat = `infoSecondaryFormat` in options
            ? [].concat(options.infoSecondaryFormat)
            : [ `whiteBright` ];

        this.errorMessageFormat = `errorMessageFormat` in options
            ? [].concat(options.errorMessageFormat)
            // eslint-disable-next-line array-element-newline
            : [ `bold`, `redBright` ];

        this.errorSecondaryFormat = `errorSecondaryFormat` in options
            ? [].concat(options.errorSecondaryFormat)
            : [ `yellowBright` ];

        this.debugMessageFormat = `debugMessageFormat` in options
            ? [].concat(options.debugMessageFormat)
            : [ `cyanBright` ];

        this.debugSecondaryFormat = `debugSecondaryFormat` in options
            ? [].concat(options.debugSecondaryFormat)
            : [ `whiteBright` ];
    }
}

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
LoggerOptions.getFileWriteMode = function getFileWriteMode ( value ) {
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
LoggerOptions.getLogFileDirectory = function getLogFileDirectory ( value ) {
    const logFileDirectory = value;

    /**
     * Just a quick check for `..` or `.` to handle relative paths
     */
    if ( (/^\.\.?\//).test(logFileDirectory) ) {
        return path.join(process.env.PWD || __dirname, logFileDirectory);
    }

    return logFileDirectory;
};

/**
 * Max amount of text that will attempt to fit on one line before a line break
 * is inserted
 * @returns     {{ size: number, regEx: RegExp }}
 */
LoggerOptions.getConsoleMaxWidth = function getConsoleMaxWidth ( value ) {
    const size = value;
    const regEx = new RegExp(`(.{${size}})`, `g`);

    return {
        size,
        regEx,
    };
};

module.exports = LoggerOptions;
