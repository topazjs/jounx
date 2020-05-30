"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerOptionsError = void 0;
class LoggerOptionsError extends Error {
    constructor(message, ...args) {
        super(...args);
        this.name = `LoggerOptionsError`;
        this.message = ``;
        this.date = new Date();
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, LoggerOptionsError);
        }
        this.message = message;
    }
}
exports.LoggerOptionsError = LoggerOptionsError;
