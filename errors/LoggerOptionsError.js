'use strict';

class LoggerOptionsError extends Error {
    constructor ( message, ...args ) {
        super(...args);

        if ( Error.captureStackTrace ) {
            Error.captureStackTrace(this, LoggerOptionsError);
        }

        this.name = `LoggerOptionsError`;
        this.message = message;
        this.date = new Date();
    }
}

module.exports = LoggerOptionsError;
