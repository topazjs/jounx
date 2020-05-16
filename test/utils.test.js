'use strict';

const chai = require('chai');
const assert = chai.assert;

const utils = require('../build/utils.js');
const Logger = require('../build/index.js').default;
const makeLogger = ( options = {} ) => new Logger({
    "enableLogFiles": false,
    "enableConsole": false,
    ...options,
});

describe(`Utils`, function () {
    const logger = makeLogger();
    describe(`#getString()`, function () {
        it(`should format the numbers real purty`, function () {
            assert.equal(utils.getString(1234567890.1), `1,234,567,890.1`);
            assert.equal(utils.getString(1234567890.0), `1,234,567,890`);
            assert.equal(utils.getString(1234567890.0004999), `1,234,567,890.001`);
            assert.equal(utils.getString(1234567890.0004998), `1,234,567,890`);

            // MAX_SAFE_INTEGER val
            assert.equal(utils.getString(9007199254740991), `9,007,199,254,740,991`);
        });

        it(`should treat numbers inside a string as an exact value with no change`, function () {
            const value1 = `1234567890.1`;
            assert.equal(utils.getString(value1), value1);
            const value2 = `1234567890.0`;
            assert.equal(utils.getString(value2), value2);
            const value3 = `1234567890.0004999`;
            assert.equal(utils.getString(value3), value3);
            const value4 = `1234567890.0004998`;
            assert.equal(utils.getString(value4), value4);
            const value5 = `9007199254740991`;
            assert.equal(utils.getString(value5), value5);
        });

        it(`should take a boolean and return some decoration with it in a new string`, function () {
            assert.equal(utils.getString(true), `✔ true`);
            assert.equal(utils.getString(false), `✗ false`);
        });

        it(`should take an object and stringify with 2-space indents`, function () {
            const object = {
                "abc": 123,
                "def": true,
                "sssssss": [
                    null,
                    null,
                    null,
                    "",
                    "",
                    {},
                    false,
                    false,
                    []
                ]
            };
            const objectString = JSON.stringify(object, null, 2);
            assert.equal(utils.getString(object), objectString);
        });

        it(`should change natural occurring NaN, exact NaN ref, Infinity or a Promise into [unknown]`, function () {
            assert.equal(utils.getString(2 + undefined), `[unknown]`);
            assert.equal(utils.getString(NaN), `[unknown]`);
            assert.equal(utils.getString(Infinity), `[unknown]`);
            assert.equal(utils.getString(Promise.resolve(true)), `[unknown]`);
        });

        it(`should change null or undefined into a string saying as such`, function () {
            assert.equal(utils.getString(undefined), `undefined`);
            assert.equal(utils.getString(null), `null`);
        });

        it(`should take a function and return the result, having passed through getString() again`, function () {
            function func () { return { "one": 123123 } }
            const result = func();
            const final = utils.getString(result);
            assert.equal(utils.getString(func), final);
        });
    });
});
