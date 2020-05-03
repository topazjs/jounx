'use strict';

class LoggerFileError extends Error {
    constructor ( message, ...args ) {
        super(...args);

        if ( Error.captureStackTrace ) {
            Error.captureStackTrace(this, LoggerFileError);
        }

        this.name = `LoggerFileError`;
        this.message = message;
        this.date = new Date();
    }
}

module.exports = LoggerFileError;
