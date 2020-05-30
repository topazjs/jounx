import {
    destinationTypes,
    fileWriterType,
    formatTypes,
    LoggerOptions,
    logTypes,
} from "./options";

export declare class Logger<T extends LoggerOptions> extends LoggerOptions {
    #private;
    fileWriter: fileWriterType;
    constructor(options?: T | {});
    initFile(): this;
    getFormatted(destination: destinationTypes, formatType: formatTypes, value?: string): string;
    /**
     * Gets the first chunk of text to prepend to the line being logged
     * @param   {string}    type
     * @param   {string}    destination
     * @return  {string}
     */
    getPrefix(destination: destinationTypes, type: logTypes): string;
    /**
     * Combines the generated prefix with the rest of the message text into one line
     * @param   {string}    destination
     * @param   {string}    type
     * @param   {string[]}  messages
     * @return {string}
     */
    getText(destination: destinationTypes, type: logTypes, ...messages: any[]): string;
    /**
     * @param   {string}    type
     * @param   {string}    msg
     * @param   {?string[]}  textArgs
     * @return {Logger}
     */
    static log(type: logTypes, logText: any): Promise<void>;
    writeFileAsync: fileWriterType;
    file(type: logTypes, fileText: any): Promise<void>;
    generic(info: {
        type: logTypes;
        messageFormat: formatTypes;
        secondaryFormat: formatTypes;
    }, messages: any[]): void;
    info(...messages: any[]): void;
    error(...messages: any[]): void;
    debug(...messages: any[]): void;
    time(id?: string): void;
    getTimer(id: string): bigint;
    removeTimer(id: string): boolean;
    static getTimerMessage(id: string, endTime: bigint, startTime: bigint): string;
    timeEnd(id?: string, endTime?: bigint): void;
}
