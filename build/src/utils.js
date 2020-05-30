"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrettyString = exports.getString = void 0;
/**
 * Feed this whatever comes through the log or file writer to make something more
 * presentable.
 * @param   {Function|undefined|boolean|Promise<any>|number|{}|[]|string}         value   -   any type value to be converted to string for display in log
 * @returns {string}    stringified value
 */
function getString(value) {
    /**
     * Quick return since it will go through this all over again.
     */
    if (typeof value === `function`) {
        return getString(value());
    }
    if (typeof value === `undefined` || value === null) {
        return `${value}`;
    }
    if (typeof value === `boolean`) {
        return value
            ? `true`
            : `false`;
    }
    const isBadNumber = typeof value === `number` && (isNaN(value) || value === Infinity);
    if (value instanceof Promise || isBadNumber) {
        return `[unknown]`;
    }
    if (typeof value === `object`) {
        return JSON.stringify(value);
    }
    if (typeof value === `number` || typeof value === `bigint`) {
        return String(value);
    }
    return String(value);
}
exports.getString = getString;
/**
 * Feed this whatever comes through the console to make something more
 * presentable.
 */
function getPrettyString(value) {
    /**
     * Quick return since it will go through this all over again.
     */
    if (typeof value === `function`) {
        return getPrettyString(value());
    }
    if (typeof value === `undefined` || value === null) {
        return `${value}`;
    }
    if (typeof value === `boolean`) {
        return value
            ? `✔ true`
            : `✗ false`;
    }
    const isBadNumber = typeof value === `number` && (isNaN(value) || value === Infinity);
    if (value instanceof Promise || isBadNumber) {
        return `[unknown]`;
    }
    if (typeof value === `object`) {
        return JSON.stringify(value, null, 2);
    }
    if (typeof value === `number` || typeof value === `bigint`) {
        // @ts-ignore
        return new Intl.NumberFormat(`en-US`).format(value);
    }
    return String(value);
}
exports.getPrettyString = getPrettyString;
