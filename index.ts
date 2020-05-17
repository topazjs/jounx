import chalk from "chalk";
import fs from "fs";

import { promisify } from "util";
import { LoggerFileError } from "./errors/LoggerFileError";
import { LoggerOptionsError } from "./errors/LoggerOptionsError";

import {
    destinationTypes,
    eventInfoType,
    fileWriterType,
    formattingType,
    formatTypes,
    LoggerOptions,
    logTypes,
    multilineTypes,
} from "./options";

import {
    getPrettyString,
    getString,
} from "./utils";

const chalkConsole: chalk.Chalk = new chalk.Instance({ 'level': 3 });

const appendFileAsync = promisify(fs.appendFile);

export class Logger <T extends LoggerOptions> extends LoggerOptions {
    #timers: Map<any, bigint> = new Map();

    fileWriter: fileWriterType;

    // #fileStream: fs.WriteStream | null = null;

    constructor ( options?: T | {} ) {
        super(options);

        if ( this.enableLogFile === true ) {
            this.initFile();
        }
    }

    initFile () {
        if ( !this.logDirectory || !this.logFilename ) {
            throw new LoggerOptionsError(`Log file is enabled but logDirectory and/or logFilename are invalid`);
        }

        try {
            // eslint-disable-next-line no-sync
            fs.mkdirSync(this.logDirectory, { "recursive": true });
        }
        catch (e) {
            throw new LoggerFileError(`Log directory inaccessible and cannot be created.  See error:`, e);
        }

        this.fileWriter = this[ this.fileWriteMode ];

        return this;
    }

    getFormatted ( destination: destinationTypes, formatType: formatTypes, value = `` ): string {
        if ( destination === destinationTypes.FILE ) {
            return getString(value);
        }

        const stringValue = getPrettyString(value);
        const formats: formattingType = this[ formatType ];

        const formatter = formats.reduce(( func, op ) => {
            if ( op ) {
                return func[ op ];
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
    getPrefix ( destination: destinationTypes, type: logTypes ) {
        const prefixArray = [];
        const prefixWithDateTime = this.prefixWithDateTime;
        const prefixWithMessageType = this.prefixWithMessageType;
        let pidPrefix = this.pidPrefix;
        let portPrefix = this.portPrefix;

        const now = new Date();
        let date = now.toLocaleDateString();
        let time = now.toLocaleTimeString();
        let label = `${type.toUpperCase()}:`;

        if ( destination === destinationTypes.CONSOLE ) {
            pidPrefix = this.getFormatted(destination, formatTypes.PID, pidPrefix);
            portPrefix = this.getFormatted(destination, formatTypes.PORT, portPrefix);
            date = this.getFormatted(destination, formatTypes.DATE, date);
            time = this.getFormatted(destination, formatTypes.TIME, time);
            label = this.getFormatted(destination, formatTypes.LABEL, label);
        }

        if ( pidPrefix ) {
            prefixArray.push(pidPrefix);
        }

        if ( portPrefix ) {
            prefixArray.push(portPrefix);
        }

        if ( prefixWithDateTime ) {
            prefixArray.push(`[${date} ${time}]`);
        }

        if ( label && prefixWithMessageType ) {
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
    getText ( destination: destinationTypes, type: logTypes, ...messages ) {
        const prefix = this.getPrefix(destination, type);
        const multiline = this.consoleMultiLine;
        const maxWidth = this.consoleMaxWidth;
        const regMaxWidth = new RegExp(`(.{${maxWidth}})`, `g`);

        const line = [
            prefix,
            messages.map(row => row.replace(regMaxWidth, `$1\n`)).join(`\n`),
        ];

        const needsMultiLine = multiline === multilineTypes.ALWAYS || (
            multiline === multilineTypes.AS_NEEDED && prefix.length > maxWidth / 2
        );

        if ( destination !== destinationTypes.FILE && needsMultiLine ) {
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
    static async log ( type: logTypes, logText ) {
        switch ( type ) {
            case logTypes.TIMER:
                console.log(logText);
                break;

            case logTypes.DEBUG:
                console.trace(logText);
                break;

            default:
                console[ type ](logText);
                break;
        }
    }

    /*
    writeFileStream ( filePath: string, fileText: string ) {
        if ( !this.#fileStream ) {
            this.#fileStream = fs.createWriteStream(`${filePath}`);

            this.#fileStream.on(`error`, error => {
                this.error(`Log file write failed`, error);
            });

            this.#fileStream.on(`close`, () => {
                this.#fileStream = null;
            });
        }
        this.#fileStream.write(`${fileText}\n`);
    }
    */

    writeFileAsync: fileWriterType = ( filePath, fileText ) =>
        appendFileAsync(filePath, `${fileText}\n`, { "encoding": `utf8` });

    async file ( type: logTypes, fileText ) {
        const logDirectory = this.logDirectory;
        const filename = this.logFilename;
        const pathStart = `${logDirectory}/${filename}`;
        const currentPath = `${pathStart}`;

        const fileWriteId = process.hrtime.bigint();
        const eventInfo: eventInfoType = {
            currentPath,
            type,
            fileWriteId,
        };

        Promise
            .resolve(eventInfo)
            .then(( info: eventInfoType ) => {
                if ( this.onFileWriteStart ) {
                    this.onFileWriteStart(info);
                }

                return info;
            })
            .catch(e => {
                this.error(`Problem with onFileWriteStart handler provided`, e);

                return eventInfo;
            })
            .then(( info: eventInfoType ) => this.fileWriter(currentPath, fileText).then(() => info))
            .catch(e => {
                this.error(`Problem with fileWriter (${this.fileWriteMode})`, e);

                return eventInfo;
            })
            .then(( info: eventInfoType ) => {
                if ( this.onFileWriteFinish ) {
                    this.onFileWriteFinish(info);
                }
            })
            .catch(e => {
                this.error(`Problem with onFileWriteFinish handler provided`, e);
            });

        return this;
    }

    generic (
        info: {
            type: logTypes;
            messageFormat: formatTypes;
            secondaryFormat: formatTypes;
        },
        messages: any[]
    ) {
        const {
            type,
            messageFormat,
            secondaryFormat,
        } = info;

        const [
            msg,
            ...args
        ] = messages;

        const logActions: Promise<this | void>[] = [];

        if ( this.enableConsole === true ) {
            const logMessage = this.getFormatted(destinationTypes.CONSOLE, messageFormat, msg);
            const consoleMapper = this.getFormatted.bind(this, destinationTypes.CONSOLE, secondaryFormat);
            const otherLogTextArray = args.map(consoleMapper);
            const logText = this.getText(destinationTypes.CONSOLE, type, logMessage, ...otherLogTextArray);

            logActions.push(
                Logger.log(type, logText)
            );
        }

        if ( this.enableLogFile === true ) {
            const logMessage = this.getFormatted(destinationTypes.FILE, messageFormat, msg);
            const fileMapper = this.getFormatted.bind(this, destinationTypes.FILE, secondaryFormat);
            const otherFileTextArray = args.map(fileMapper);
            const fileText = this.getText(destinationTypes.FILE, type, logMessage, ...otherFileTextArray);

            logActions.push(
                this.file(type, fileText)
            );
        }

        Promise
            .all(logActions)
            .catch(error => this.error(`Had trouble logging a message - `, error));

    }

    info ( ...messages: any[] ) {
        const info = {
            "type": logTypes.INFO,
            "messageFormat": formatTypes.INFO,
            "secondaryFormat": formatTypes.INFO2,
        };

        this.generic(info, messages);
    }

    error ( ...messages: any[] ) {
        const info = {
            "type": logTypes.ERROR,
            "messageFormat": formatTypes.ERROR,
            "secondaryFormat": formatTypes.ERROR2,
        };

        this.generic(info, messages);
    }

    debug ( ...messages: any[] ) {
        const info = {
            "type": logTypes.DEBUG,
            "messageFormat": formatTypes.DEBUG,
            "secondaryFormat": formatTypes.DEBUG2,
        };

        this.generic(info, messages);
    }

    time ( id = `__SPONTANEOUS__` ) {
        const startTime = process.hrtime.bigint();
        this.#timers.set(id, startTime);
    }

    getTimer ( id: string ): bigint {
        return this.#timers.get(id);
    }

    removeTimer ( id: string ): boolean {
        return this.#timers.delete(id);
    }

    static getTimerMessage ( id: string, endTime: bigint, startTime: bigint ) {
        const diff: bigint = endTime - startTime;

        const ms = `${diff}`.replace(/^(\d*)(\d{6})$/g, "$1.$2ms");
        const sec = `${diff}`.replace(/^(\d*)(\d{9})$/g, "$1.$2s");

        return `${id}: ${ms} / ${sec}`;
    }

    timeEnd ( id = `__SPONTANEOUS__`, endTime: bigint = process.hrtime.bigint() ) {
        const startTime = this.#timers.get(id);
        if ( !startTime ) {
            if ( !id || id === `__SPONTANEOUS__` ) {
                throw new Error(`You need to pass a valid ID to end a timer and retreive the results`);
            }

            return this.error(`No timer exists for ID ${id}. Make sure you included a .time('${id}') before calling .timeEnd('${id}')`, startTime);
        }

        const timerResult = Logger.getTimerMessage(id, endTime, startTime);

        this.removeTimer(id);

        const info = {
            "type": logTypes.TIMER,
            "messageFormat": formatTypes.TIMER,
            "secondaryFormat": formatTypes.TIMER,
        };

        this.generic(info, [ timerResult ]);
    }
}
