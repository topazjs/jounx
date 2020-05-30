"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerFileError = void 0;
class LoggerFileError extends Error {
    constructor(message, ...args) {
        super(...args);
        this.name = `LoggerFileError`;
        this.message = ``;
        this.date = new Date();
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, LoggerFileError);
        }
        this.message = message;
    }
}
exports.LoggerFileError = LoggerFileError;
