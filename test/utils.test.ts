import chai from "chai";

const assert = chai.assert;

const {
    getString,
    getPrettyString,
} = require('../src/utils');

describe(`Utils`, function () {
    const objectToStringify = {
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

    describe(`#getPrettyString()`, function () {
        it(`should format the numbers real purty`, function () {
            assert.equal(getPrettyString(1234567890.1), `1,234,567,890.1`);
            assert.equal(getPrettyString(1234567890.0), `1,234,567,890`);
            assert.equal(getPrettyString(1234567890.0004999), `1,234,567,890.001`);
            assert.equal(getPrettyString(1234567890.0004998), `1,234,567,890`);

            // MAX_SAFE_INTEGER val
            assert.equal(getPrettyString(9007199254740991), `9,007,199,254,740,991`);
        });

        it(`should treat numbers inside a string as an exact value with no change`, function () {
            const value1 = `1234567890.1`;
            assert.equal(getPrettyString(value1), value1);
            const value2 = `1234567890.0`;
            assert.equal(getPrettyString(value2), value2);
            const value3 = `1234567890.0004999`;
            assert.equal(getPrettyString(value3), value3);
            const value4 = `1234567890.0004998`;
            assert.equal(getPrettyString(value4), value4);
            const value5 = `9007199254740991`;
            assert.equal(getPrettyString(value5), value5);
        });

        it(`should take a boolean and return some decoration with it in a new string`, function () {
            assert.equal(getPrettyString(true), `✔ true`);
            assert.equal(getPrettyString(false), `✗ false`);
        });

        it(`should take an object and stringify with 2-space indents`, function () {
            const objectString = JSON.stringify(objectToStringify, null, 2);
            assert.equal(getPrettyString(objectToStringify), objectString);
        });

        it(`should change natural occurring NaN, exact NaN ref, Infinity or a Promise into [unknown]`, function () {
            // @ts-ignore
            assert.equal(getPrettyString(2 + undefined), `[unknown]`);
            assert.equal(getPrettyString(NaN), `[unknown]`);
            assert.equal(getPrettyString(Infinity), `[unknown]`);
            assert.equal(getPrettyString(Promise.resolve(true)), `[unknown]`);
        });

        it(`should change null or undefined into a string saying as such`, function () {
            assert.equal(getPrettyString(undefined), `undefined`);
            assert.equal(getPrettyString(null), `null`);
        });

        it(`should take a function and return the result, having passed through getString() again`, function () {
            function func () { return { "one": 123123 } }
            const result = func();
            const final = getPrettyString(result);
            assert.equal(getPrettyString(func), final);
        });
    });


    describe(`#getString()`, function () {
        it(`should format the numbers as-is`, function () {
            assert.equal(getString(1234567890.1), `1234567890.1`);
            assert.equal(getString(1234567890.0), `1234567890`);
            assert.equal(getString(1234567890.0004999), `1234567890.0005`);
            // Javascript making assumptions when the precision is too high
            assert.equal(getString(1234567890.0004998), `1234567890.0004997`);
            assert.equal(getString(1234567890.0004991), `1234567890.000499`);

            // MAX_SAFE_INTEGER val
            assert.equal(getString(9007199254740991), `9007199254740991`);
        });

        it(`should handle BigInt values as-is`, function () {
            assert.equal(getString(1234567890.1), `1234567890.1`);
            assert.equal(getString(1234567890.0), `1234567890`);
            assert.equal(getString(1234567890.0004999), `1234567890.0005`);
            // Javascript making assumptions when the precision is too high
            assert.equal(getString(1234567890.0004998), `1234567890.0004997`);
            assert.equal(getString(1234567890.0004991), `1234567890.000499`);

            // MAX_SAFE_INTEGER val
            assert.equal(getString(9007199254740991), `9007199254740991`);
        });

        it(`should treat numbers inside a string as an exact value with no change`, function () {
            const value1 = `1234567890.1`;
            assert.equal(getString(value1), value1);
            const value2 = `1234567890.0`;
            assert.equal(getString(value2), value2);
            const value3 = `1234567890.0004999`;
            assert.equal(getString(value3), value3);
            const value4 = `1234567890.0004998`;
            assert.equal(getString(value4), value4);
            const value5 = `9007199254740991`;
            assert.equal(getString(value5), value5);
        });

        it(`should take a boolean and return its value as a new string`, function () {
            assert.equal(getString(true), `true`);
            assert.equal(getString(false), `false`);
        });

        it(`should take an object and stringify with 2-space indents`, function () {
            const objectString = JSON.stringify(objectToStringify);
            assert.equal(getString(objectToStringify), objectString);
        });

        it(`should change natural occurring NaN, exact NaN ref, Infinity or a Promise into [unknown]`, function () {
            // @ts-ignore
            assert.equal(getString(2 + undefined), `[unknown]`);
            assert.equal(getString(NaN), `[unknown]`);
            assert.equal(getString(Infinity), `[unknown]`);
            assert.equal(getString(Promise.resolve(true)), `[unknown]`);
        });

        it(`should change null or undefined into a string saying as such`, function () {
            assert.equal(getString(undefined), `undefined`);
            assert.equal(getString(null), `null`);
        });

        it(`should take a function and return the result, having passed through getString() again`, function () {
            function func () { return { "one": 123123 } }
            const result = func();
            const final = getString(result);
            assert.equal(getString(func), final);
        });
    });
});
