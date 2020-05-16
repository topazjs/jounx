import chalk from "chalk";
import fs from "fs";

import { promisify } from "util";
import { LoggerFileError } from "./errors/LoggerFileError";

import {
    formattingType,
    LoggerOptions,
    multilineTypes,
} from "./options";

import {
    getPrettyString,
    getString,
} from "./utils";

const chalkConsole: chalk.Chalk = new chalk.Instance({ 'level': 3 });

const NANOSEC_PER_SEC = BigInt(1e9);
const NANOSEC_PER_MS = BigInt(1e6);

const appendFileAsync = promisify(fs.appendFile);
const readdirAsync = promisify(fs.readdir);

export type fileWriterType = (
    filePath: string,
    fileText: string
) => void;

export enum destinationTypes {
    CONSOLE = "console",
    FILE = "file",
}

export enum logTypes {
    INFO = "info",
    ERROR = "error",
    DEBUG = "debug",
    TIMER = "timer",
}

export enum formatTypes {
    LABEL = "labelFormat",
    PID = "pidFormat",
    PORT = "portFormat",
    DATE = "dateFormat",
    TIME = "timeFormat",
    TIMER = "timerFormat",
    INFO = "infoMessage",
    INFO2 = "infoSecondary",
    ERROR = "errorMessage",
    ERROR2 = "errorSecondary",
    DEBUG = "debugMessage",
    DEBUG2 = "debugSecondary",
}

export class Logger extends LoggerOptions {
    timers: Map<any, bigint> = new Map();

    fileWriter: fileWriterType | null = null;

    fileStream: fs.WriteStream | null = null;

    constructor ( options?: LoggerOptions | {} ) {
        super(options);

        if ( this.enableLogFiles === true ) {
            this.initFile();
        }
    }

    initFile () {
        this.fileWriter = this[ this.fileWriteMode ];

        try {
            // eslint-disable-next-line no-sync
            fs.mkdirSync(this.logFileDirectory, { "recursive": true });
        }
        catch (e) {
            throw new LoggerFileError(e);
        }

        return this;
    }

    getTypeFormatting ( type: formatTypes ): formattingType {
        return this[ type ] || [];
    }

    getFormatted ( destination: destinationTypes, formatType: formatTypes, value = `` ): string {
        if ( destination === destinationTypes.FILE ) {
            return getString(value);
        }

        const stringValue = getPrettyString(value);
        const formats = this.getTypeFormatting(formatType);

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
    log ( type: logTypes, ...textArgs ) {
        if ( this.enableConsole ) {
            const logText = this.getText(destinationTypes.CONSOLE, type, ...textArgs);

            if ( type === logTypes.TIMER ) {
                console.log(logText);
            }
            else if ( type === logTypes.DEBUG ) {
                console.trace(logText);
            }
            else {
                console[ type ](logText);
            }
        }

        return this;
    }

    writeFileStream ( filePath: string, fileText: string ) {
        if ( !this.fileStream ) {
            this.fileStream = fs.createWriteStream(`${filePath}`);

            this.fileStream.on(`error`, error => {
                this.error(`Log file write failed`, error);
            });

            this.fileStream.on(`close`, () => {
                this.fileStream = null;
            });
        }
        this.fileStream.write(`${fileText}\n`);

        return this;
    }

    async writeFileAsync ( filePath: string, fileText: string ) {
        await appendFileAsync(filePath, `${fileText}\n`);

        return this;
    }

    async getNextFileIndex ( logFileDirectory: string, filename: string ) {
        const dirItems = await readdirAsync(logFileDirectory);
        const baseFilenameLength = filename.length;
        const matchingItems = dirItems.filter(_filename => {
            const extractedName = _filename.slice(0, baseFilenameLength);

            return extractedName === filename;
        });

        return matchingItems.length;
    }

    async file ( type: logTypes, ...textArgs ) {
        const logFileDirectory = this.logFileDirectory;
        const logFileExtension = this.logFileExtension;
        const logFileSizeLimit = this.logFileSizeLimit;
        const filename = this[ `${type}Filename` ];

        if ( this.enableLogFiles && filename ) {
            const pathStart = `${logFileDirectory}/${filename}`;
            const currentPath = `${pathStart}.${logFileExtension}`;
            const fileText = this.getText(destinationTypes.FILE, type, ...textArgs);

            fs.stat(currentPath, async ( error, stat ) => {
                if ( !error && stat && stat.size > logFileSizeLimit ) {
                    const newIndex = await this.getNextFileIndex(logFileDirectory, filename);
                    const newPath = `${currentPath}.${newIndex}`;
                    fs.rename(currentPath, newPath, error => {
                        if ( error ) {
                            this.log(logTypes.ERROR, `Failed to rename large file so killing file writing for this file`, error);
                            this[ `${type}Filename` ] = ``;
                        }
                    });
                }
            });

            return this.fileWriter(currentPath, fileText);
        }

        return this;
    }

    info ( msg: any, ...args: any[] ) {
        const logText = this.getFormatted(destinationTypes.CONSOLE, formatTypes.INFO, msg);
        const fileText = this.getFormatted(destinationTypes.FILE, formatTypes.INFO, msg);
        const consoleMapper = this.getFormatted.bind(this, destinationTypes.CONSOLE, formatTypes.INFO2);
        const fileMapper = this.getFormatted.bind(this, destinationTypes.FILE, formatTypes.INFO2);
        const otherLogTextArray = args.map(consoleMapper);
        const otherFileTextArray = args.map(fileMapper);

        this.log(logTypes.INFO, logText, ...otherLogTextArray);

        return this.file(logTypes.INFO, fileText, ...otherFileTextArray);
    }

    error ( msg: any, ...args: any[] ) {
        const logText = this.getFormatted(destinationTypes.CONSOLE, formatTypes.ERROR, msg);

        if ( args.length > 0 ) {
            const consoleMapper = this.getFormatted.bind(this, destinationTypes.CONSOLE, formatTypes.ERROR2);
            const otherLogTextArray = args.map(consoleMapper);
            this.log(logTypes.ERROR, logText, ...otherLogTextArray);
        }
        else {
            this.log(logTypes.ERROR, logText);
        }

        const fileMapper = this.getFormatted.bind(this, destinationTypes.FILE, formatTypes.ERROR2);
        const fileText = this.getFormatted(destinationTypes.FILE, formatTypes.ERROR, msg);
        const otherFileTextArray = args.map(fileMapper);

        return this.file(logTypes.ERROR, fileText, ...otherFileTextArray);
    }

    debug ( msg: any, ...args: any[] ) {
        if ( this.dev ) {
            const consoleMapper = this.getFormatted.bind(this, destinationTypes.CONSOLE, formatTypes.DEBUG2);
            const logText = this.getFormatted(destinationTypes.CONSOLE, formatTypes.DEBUG, msg);
            const otherLogTextArray = args.map(consoleMapper);
            this.log(logTypes.DEBUG, logText, ...otherLogTextArray);
        }
        const fileMapper = this.getFormatted.bind(this, destinationTypes.FILE, formatTypes.DEBUG2);
        const fileText = this.getFormatted(destinationTypes.FILE, formatTypes.DEBUG, msg);
        const otherFileTextArray = args.map(fileMapper);

        return this.file(logTypes.DEBUG, fileText, ...otherFileTextArray);
    }

    time ( id = `__SPONTANEOUS__` ) {
        const startTime = process.hrtime.bigint();
        this.timers.set(id, startTime);

        return this;
    }

    async removeTimer ( id: string ) {
        this.timers.delete(id);

        return this;
    }

    getTimerMessage ( id: string, endTime: bigint, startTime: bigint ) {
        const diff: bigint = endTime - startTime;

        const ns = `${diff}ns`;
        const ms = `${diff / NANOSEC_PER_MS}ms`;
        const sec = `${diff / NANOSEC_PER_SEC}s`;

        return `${id}: ${ns} (${ms}, ${sec})`;
    }

    timeEnd ( id = `__SPONTANEOUS__`, endTime: bigint = process.hrtime.bigint() ) {
        const startTime = this.timers.get(id);
        if ( !id || !startTime ) {
            throw new Error(`No timer exists for ID ${id}. Make sure you included a .time('${id}') before calling .timeEnd('${id}')`);
        }

        const timerResult = this.getTimerMessage(id, endTime, startTime);
        const logText = this.getFormatted(destinationTypes.CONSOLE, formatTypes.TIMER, timerResult);
        const fileText = this.getFormatted(destinationTypes.FILE, formatTypes.TIMER, timerResult);

        this.removeTimer(id);
        this.log(logTypes.TIMER, logText);

        return this.file(logTypes.DEBUG, fileText);
    }
}
