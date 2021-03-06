
export class LoggerOptionsError extends Error {
    name = `LoggerOptionsError`;

    message = ``;

    date: Date = new Date();

    constructor ( message: string, ...args: any[] ) {
        super(...args);

        if ( Error.captureStackTrace ) {
            Error.captureStackTrace(this, LoggerOptionsError);
        }

        this.message = message;
    }
}
