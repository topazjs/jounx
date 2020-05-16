import chalk from "chalk";

import fs from "fs";
import { promisify } from "util";
import { LoggerFileError } from "./errors/LoggerFileError";
import { LoggerOptions } from "./options";
import { getString } from "./utils";

const chalkConsole: chalk.Chalk = new chalk.Instance({ 'level': 3 });

const NANOSEC_PER_SEC = BigInt(1e9);
const NANOSEC_PER_MS = BigInt(1e6);

const appendFileAsync = promisify(fs.appendFile);
const readdirAsync = promisify(fs.readdir);

export class Logger extends LoggerOptions {
    timers: Map<any, bigint> = new Map();

    fileWriter: (
        filePath: string,
        fileText: string
    ) => void = null;

    fileStream: fs.WriteStream|void = null;

    constructor ( options: LoggerOptions ) {
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

    getFormatted ( destination, type, value = `` ) {
        const stringValue = getString(value);
        if ( destination === `file` ) {
            return stringValue;
        }

        const formats = this[ `${type}Format` ];

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
    getPrefix ( destination, type ) {
        const prefixArray = [];
        const prefixWithDateTime = this.prefixWithDateTime;
        const prefixWithMessageType = this.prefixWithMessageType;
        let pidPrefix = this.pidPrefix;
        let portPrefix = this.portPrefix;

        const now = new Date();
        let date = now.toLocaleDateString();
        let time = now.toLocaleTimeString();
        let label = `${type.toUpperCase()}:`;

        if ( destination === `log` ) {
            pidPrefix = this.getFormatted(destination, `pid`, pidPrefix);
            portPrefix = this.getFormatted(destination, `port`, portPrefix);
            date = this.getFormatted(destination, `date`, date);
            time = this.getFormatted(destination, `time`, time);
            label = this.getFormatted(destination, `label`, label);
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
    getText ( destination, type, ...messages ) {
        const prefix = this.getPrefix(destination, type);
        const multiline = this.consoleMultiLine;
        const {
            size: maxWidth,
            regEx: regMaxWidth,
        } = this.consoleMaxWidth;

        const line = [
            prefix,
            messages.map(row => row.replace(regMaxWidth, `$1\n`)).join(`\n`),
        ];

        const needsMultiLine = multiline === `always` || (
            multiline === `as-needed` && prefix.length > maxWidth / 2
        );

        if ( destination !== `file` && needsMultiLine ) {
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
    log ( type, ...textArgs ) {
        if ( this.enableConsole ) {
            const logText = this.getText(`log`, type, ...textArgs);

            if ( type === `timer` ) {
                console.log(logText);
            }
            else if ( type === `debug` ) {
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

    async file ( type, ...textArgs ) {
        const logFileDirectory = this.logFileDirectory;
        const logFileExtension = this.logFileExtension;
        const logFileSizeLimit = this.logFileSizeLimit;
        const filename = this[ `${type}Filename` ];

        if ( this.enableLogFiles && filename ) {
            const pathStart = `${logFileDirectory}/${filename}`;
            const currentPath = `${pathStart}.${logFileExtension}`;
            const fileText = this.getText(`file`, type, ...textArgs);

            fs.stat(currentPath, async ( error, stat ) => {
                if ( !error && stat && stat.size > logFileSizeLimit ) {
                    const newIndex = await this.getNextFileIndex(logFileDirectory, filename);
                    const newPath = `${currentPath}.${newIndex}`;
                    fs.rename(currentPath, newPath, error => {
                        if ( error ) {
                            this.log(`error`, `Failed to rename large file so killing file writing for this file`, error);
                            this[ `${type}Filename` ] = ``;
                        }
                    });
                }
            });

            return this.fileWriter(currentPath, fileText);
        }

        return this;
    }

    info ( msg, ...args ) {
        const logText = this.getFormatted(`log`, `infoMessage`, msg);
        const fileText = this.getFormatted(`file`, `infoMessage`, msg);
        const otherLogTextArray = args.map(this.getFormatted.bind(this, `log`, `infoSecondary`));
        const otherFileTextArray = args.map(this.getFormatted.bind(this, `file`, `infoSecondary`));

        this.log(`info`, logText, ...otherLogTextArray);

        return this.file(`info`, fileText, ...otherFileTextArray);
    }

    error ( msg, ...args ) {
        const logText = this.getFormatted(`log`, `errorMessage`, msg);

        if ( args.length > 0 ) {
            const otherLogTextArray = args.map(this.getFormatted.bind(this, `log`, `errorSecondary`));
            this.log(`error`, logText, ...otherLogTextArray);
        }
        else {
            this.log(`error`, logText);
        }

        const fileText = this.getFormatted(`file`, `errorMessage`, msg);
        const otherFileTextArray = args.map(this.getFormatted.bind(this, `file`, `errorSecondary`));

        return this.file(`error`, fileText, ...otherFileTextArray);
    }

    debug ( msg, ...args ) {
        if ( this.dev ) {
            const logText = this.getFormatted(`log`, `debugMessage`, msg);
            const otherLogTextArray = args.map(this.getFormatted.bind(this, `log`, `debugSecondary`));
            this.log(`debug`, logText, ...otherLogTextArray);
        }
        const fileText = this.getFormatted(`file`, `debugMessage`, msg);
        const otherFileTextArray = args.map(this.getFormatted.bind(this, `file`, `debugSecondary`));

        return this.file(`debug`, fileText, ...otherFileTextArray);
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

    getTimerMessage ( id: string, endTime: bigint, startTime: bigint = this.timers.get(id) ) {
        const diff: bigint = endTime - startTime;

        const ns = `${diff}ns`;
        const ms = `${diff / NANOSEC_PER_MS}ms`;
        const sec = `${diff / NANOSEC_PER_SEC}s`;

        return `${id}: ${ns} (${ms}, ${sec})`;
    }

    timeEnd ( id = `__SPONTANEOUS__`, endTime: bigint = process.hrtime.bigint() ) {
        if ( !id || !this.timers.has(id) ) {
            throw new Error(`No timer exists for ID ${id}. Make sure you included a .time('${id}') before calling .timeEnd('${id}')`);
        }

        const timerResult = this.getTimerMessage(id, endTime);
        const logText = this.getFormatted(`log`, `timer`, timerResult);
        const fileText = this.getFormatted(`file`, `timer`, timerResult);

        this.removeTimer(id);
        this.log(`timer`, logText);

        return this.file(`debug`, fileText);
    }
}
