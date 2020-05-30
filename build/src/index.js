"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const util_1 = require("util");
const LoggerFileError_1 = require("./errors/LoggerFileError");
const LoggerOptionsError_1 = require("./errors/LoggerOptionsError");
const options_1 = require("./options");
const utils_1 = require("./utils");
const chalkConsole = new chalk_1.default.Instance({ 'level': 3 });
const appendFileAsync = util_1.promisify(fs_1.default.appendFile);
class Logger extends options_1.LoggerOptions {
    // #fileStream: fs.WriteStream | null = null;
    constructor(options) {
        super(options);
        this.#timers = new Map();
        /*
        writeFileStream ( filePath: string, fileText: string ) {
            if ( !this.#fileStream ) {
                this.#fileStream = fs.createWriteStream(`${filePath}`);
    
                this.#fileStream.on(`error`, error => {
                    console.error(`Log file write failed`, error);
                });
    
                this.#fileStream.on(`close`, () => {
                    this.#fileStream = null;
                });
            }
            this.#fileStream.write(`${fileText}\n`);
        }
        */
        this.writeFileAsync = (filePath, fileText) => appendFileAsync(filePath, `${fileText}\n`, { "encoding": `utf8` });
        if (this.enableLogFile === true) {
            this.initFile();
        }
    }
    #timers;
    initFile() {
        if (!this.logDirectory || !this.logFilename) {
            throw new LoggerOptionsError_1.LoggerOptionsError(`Log file is enabled but logDirectory and/or logFilename are invalid`);
        }
        try {
            // eslint-disable-next-line no-sync
            fs_1.default.mkdirSync(this.logDirectory, { "recursive": true });
        }
        catch (e) {
            throw new LoggerFileError_1.LoggerFileError(`Log directory inaccessible and cannot be created.  See error:`, e);
        }
        this.fileWriter = this[this.fileWriteMode];
        return this;
    }
    getFormatted(destination, formatType, value = ``) {
        if (destination === options_1.destinationTypes.FILE) {
            return utils_1.getString(value);
        }
        const stringValue = utils_1.getPrettyString(value);
        const formats = this[formatType];
        const formatter = formats.reduce((func, op) => {
            if (op) {
                return func[op];
            }
            return func;
        }, chalkConsole);
        return formatter(stringValue);
    }
    /**
     * Gets the first chunk of text to prepend to the line being logged
     * @param   {string}    type
     * @param   {string}    destination
     * @return  {string}
     */
    getPrefix(destination, type) {
        const prefixArray = [];
        const prefixWithDateTime = this.prefixWithDateTime;
        const prefixWithMessageType = this.prefixWithMessageType;
        let pidPrefix = this.pidPrefix;
        let portPrefix = this.portPrefix;
        const now = new Date();
        let date = now.toLocaleDateString();
        let time = now.toLocaleTimeString();
        let label = `${type.toUpperCase()}:`;
        if (destination === options_1.destinationTypes.CONSOLE) {
            pidPrefix = this.getFormatted(destination, options_1.formatTypes.PID, pidPrefix);
            portPrefix = this.getFormatted(destination, options_1.formatTypes.PORT, portPrefix);
            date = this.getFormatted(destination, options_1.formatTypes.DATE, date);
            time = this.getFormatted(destination, options_1.formatTypes.TIME, time);
            label = this.getFormatted(destination, options_1.formatTypes.LABEL, label);
        }
        if (pidPrefix) {
            prefixArray.push(pidPrefix);
        }
        if (portPrefix) {
            prefixArray.push(portPrefix);
        }
        if (prefixWithDateTime) {
            prefixArray.push(`[${date} ${time}]`);
        }
        if (label && prefixWithMessageType) {
            prefixArray.push(label);
        }
        return prefixArray.join(` `);
    }
    /**
     * Combines the generated prefix with the rest of the message text into one line
     * @param   {string}    destination
     * @param   {string}    type
     * @param   {string[]}  messages
     * @return {string}
     */
    getText(destination, type, ...messages) {
        const prefix = this.getPrefix(destination, type);
        const multiline = this.consoleMultiLine;
        const maxWidth = this.consoleMaxWidth;
        const regMaxWidth = new RegExp(`(.{${maxWidth}})`, `g`);
        const messageArray = destination === options_1.destinationTypes.CONSOLE
            ? messages.map(row => row.replace(regMaxWidth, `$1\n`))
            : messages;
        const line = [
            prefix,
            messageArray.join(`\n`),
        ];
        const needsMultiLine = multiline === options_1.multilineTypes.ALWAYS || (multiline === options_1.multilineTypes.AS_NEEDED && prefix.length > maxWidth / 2);
        if (destination !== options_1.destinationTypes.FILE && needsMultiLine) {
            return line.join(`\n`);
        }
        return line.join(` `);
    }
    /**
     * @param   {string}    type
     * @param   {string}    msg
     * @param   {?string[]}  textArgs
     * @return {Logger}
     */
    static async log(type, logText) {
        switch (type) {
            case options_1.logTypes.TIMER:
                console.log(logText);
                break;
            case options_1.logTypes.DEBUG:
                console.trace(logText);
                break;
            default:
                console[type](logText);
                break;
        }
    }
    file(type, fileText) {
        const logDirectory = this.logDirectory;
        const filename = this.logFilename;
        const pathStart = `${logDirectory}/${filename}`;
        const currentPath = `${pathStart}`;
        const fileWriteId = process.hrtime.bigint();
        const eventInfo = {
            currentPath,
            type,
            fileWriteId,
        };
        return Promise
            .resolve(eventInfo)
            .then((info) => {
            if (this.onFileWriteStart) {
                this.onFileWriteStart(info);
            }
            return info;
        })
            .catch(e => {
            console.error(`Problem with onFileWriteStart handler provided`, e);
            return eventInfo;
        })
            .then((info) => this.fileWriter(currentPath, fileText).then(() => info))
            .catch(e => {
            console.error(`Problem with fileWriter (${this.fileWriteMode})`, e);
            return eventInfo;
        })
            .then((info) => {
            if (this.onFileWriteFinish) {
                this.onFileWriteFinish(info);
            }
        })
            .catch(e => {
            console.error(`Problem with onFileWriteFinish handler provided`, e);
        });
    }
    generic(info, messages) {
        const { type, messageFormat, secondaryFormat, } = info;
        const [msg, ...args] = messages;
        const logActions = [];
        if (this.enableConsole === true) {
            const logMessage = this.getFormatted(options_1.destinationTypes.CONSOLE, messageFormat, msg);
            const consoleMapper = this.getFormatted.bind(this, options_1.destinationTypes.CONSOLE, secondaryFormat);
            const otherLogTextArray = args.map(consoleMapper);
            const logText = this.getText(options_1.destinationTypes.CONSOLE, type, logMessage, ...otherLogTextArray);
            logActions.push(Logger.log(type, logText));
        }
        if (this.enableLogFile === true) {
            const logMessage = this.getFormatted(options_1.destinationTypes.FILE, messageFormat, msg);
            const fileMapper = this.getFormatted.bind(this, options_1.destinationTypes.FILE, secondaryFormat);
            const otherFileTextArray = args.map(fileMapper);
            const fileText = this.getText(options_1.destinationTypes.FILE, type, logMessage, ...otherFileTextArray);
            logActions.push(this.file(type, fileText));
        }
        Promise
            .all(logActions)
            .catch(error => console.error(`Had trouble logging a message - `, error));
    }
    info(...messages) {
        const info = {
            "type": options_1.logTypes.INFO,
            "messageFormat": options_1.formatTypes.INFO,
            "secondaryFormat": options_1.formatTypes.INFO2,
        };
        this.generic(info, messages);
    }
    error(...messages) {
        const info = {
            "type": options_1.logTypes.ERROR,
            "messageFormat": options_1.formatTypes.ERROR,
            "secondaryFormat": options_1.formatTypes.ERROR2,
        };
        this.generic(info, messages);
    }
    debug(...messages) {
        const info = {
            "type": options_1.logTypes.DEBUG,
            "messageFormat": options_1.formatTypes.DEBUG,
            "secondaryFormat": options_1.formatTypes.DEBUG2,
        };
        this.generic(info, messages);
    }
    time(id = `__SPONTANEOUS__`) {
        const startTime = process.hrtime.bigint();
        this.#timers.set(id, startTime);
    }
    getTimer(id) {
        return this.#timers.get(id);
    }
    removeTimer(id) {
        return this.#timers.delete(id);
    }
    static getTimerMessage(id, endTime, startTime) {
        const diff = endTime - startTime;
        const ms = `${diff}`.replace(/^(\d*)(\d{6})$/g, "$1.$2ms");
        const sec = `${diff}`.replace(/^(\d*)(\d{9})$/g, "$1.$2s");
        return `${id}: ${ms} / ${sec}`;
    }
    timeEnd(id = `__SPONTANEOUS__`, endTime = process.hrtime.bigint()) {
        const startTime = this.#timers.get(id);
        if (!startTime) {
            if (!id || id === `__SPONTANEOUS__`) {
                throw new Error(`You need to pass a valid ID to end a timer and retreive the results`);
            }
            return this.error(`No timer exists for ID ${id}. Make sure you included a .time('${id}') before calling .timeEnd('${id}')`, startTime);
        }
        const timerResult = Logger.getTimerMessage(id, endTime, startTime);
        this.removeTimer(id);
        const info = {
            "type": options_1.logTypes.TIMER,
            "messageFormat": options_1.formatTypes.TIMER,
            "secondaryFormat": options_1.formatTypes.TIMER,
        };
        this.generic(info, [timerResult]);
    }
}
exports.Logger = Logger;
