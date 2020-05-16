
export class LoggerFileError extends Error {
    name = `LoggerFileError`;

    message = ``;

    date: Date = new Date();

    constructor ( message: string, ...args: any[] ) {
        super(...args);

        if ( Error.captureStackTrace ) {
            Error.captureStackTrace(this, LoggerFileError);
        }

        this.message = message;
    }
}
