export declare class LoggerFileError extends Error {
    name: string;
    message: string;
    date: Date;
    constructor(message: string, ...args: any[]);
}
