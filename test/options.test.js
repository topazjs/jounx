'use strict';

const Logger = require('../build/index.js').default;
const LoggerOptions = require('../build/options.js').default;
const chai = require('chai');
const assert = chai.assert;

/**
 * Initialization
 */

describe(`Initialization and options`, () => {
    describe(`- No options passed`, () => {
        it(`new Logger() is an instance of Logger with default options`, () => {
            const logger = new Logger();
            assert.deepInclude(logger, new LoggerOptions());
        });
        it(`new Logger(null) is an instance of Logger with default options`, () => {
            const testOptions = null;
            const logger = new Logger(testOptions);
            assert.deepInclude(logger, new LoggerOptions());
        });
        it(`new Logger({}) is an instance of Logger with default options`, () => {
            const testOptions = {};
            const logger = new Logger(testOptions);
            assert.deepInclude(logger, new LoggerOptions());
        });
        it(`new Logger([]) is an instance of Logger with default options`, () => {
            const testOptions = [];
            const logger = new Logger(testOptions);
            assert.deepInclude(logger, new LoggerOptions());
        });
        it(`new Logger(0) is an instance of Logger with default options`, () => {
            const testOptions = 0;
            const logger = new Logger(testOptions);
            assert.deepInclude(logger, new LoggerOptions());
        });
        it(`new Logger('') is an instance of Logger with default options`, () => {
            const testOptions = ``;
            const logger = new Logger(testOptions);
            assert.deepInclude(logger, new LoggerOptions());
        });
    });

    describe(`- Unexpected options passed`, () => {
        it(`new Logger({ "abc": true, "def": 123 }) is an instance of Logger with default options`, () => {
            const testOptions = {
                "abc": true,
                "def": 123,
            };
            const logger = new Logger(testOptions);
            assert.deepInclude(logger, new LoggerOptions());
        });
        it(`new Logger([{}]) is an instance of Logger with default options`, () => {
            const testOptions = [ {} ];
            assert.throws(() => new Logger(testOptions));
        });
        it(`new Logger([{ "abc": true, "def": 123 }]) is an instance of Logger with default options`, () => {
            const testOptions = [
                {
                    "abc": true,
                    "def": 123,
                },
            ];
            assert.throws(() => new Logger(testOptions));
        });
        it(`new Logger(123) is an instance of Logger with default options`, () => {
            const testOptions = 123;
            const logger = new Logger(testOptions);
            assert.deepInclude(logger, new LoggerOptions());
        });
        it(`new Logger('abc') is an instance of Logger with default options`, () => {
            const testOptions = `abc`;
            const logger = new Logger(testOptions);
            assert.deepInclude(logger, new LoggerOptions());
        });
        it(`new Logger(NaN) is an instance of Logger with default options`, () => {
            const testOptions = NaN;
            const logger = new Logger(testOptions);
            assert.deepInclude(logger, new LoggerOptions());
        });
        it(`new Logger(function () {}) is an instance of Logger with default options`, () => {
            const testOptions = function () {};
            const logger = new Logger(testOptions);
            assert.deepInclude(logger, new LoggerOptions());
        });
        it(`new Logger(() => {}) is an instance of Logger with default options`, () => {
            const testOptions = () => {};
            const logger = new Logger(testOptions);
            assert.deepInclude(logger, new LoggerOptions());
        });
        it(`new Logger(Infinity) is an instance of Logger with default options`, () => {
            const testOptions = Infinity;
            const logger = new Logger(testOptions);
            assert.deepInclude(logger, new LoggerOptions());
        });
    });

    describe(`#options()`, () => {
        const basicOptions = {
            "enableLogFiles": false,
            "enableConsole": false,
            // "enableExternal": false,
        };

        it(`should use defaults when no options passed`, () => {
            const logger = new Logger();
            assert.deepInclude(logger, new LoggerOptions());
        });

        describe(`options.info`, function () {
            it(`show info.pid in prefix when populated`, function () {
                const logger = new Logger({
                    ...basicOptions,
                    "prefixWithDateTime": false,
                    "prefixWithMessageType": false,
                    "portPrefix": ``,
                    "pidPrefix": String(process.pid),
                });

                // destination "file" so we avoid the formatting characters
                const prefix = logger.getPrefix(`file`, `info`);

                assert.equal(prefix, logger.pidPrefix, `Mismatch with provided pidPrefix`);

            });

            describe(`info.port`, function () {
                it(`should only show port in prefix`, function () {
                    const logger = new Logger({
                        ...basicOptions,
                        "prefixWithDateTime": false,
                        "prefixWithMessageType": false,
                        "portPrefix": `_8080_`,
                        "pidPrefix": ``,
                    });

                    // destination "file" so we avoid the formatting characters
                    const prefix = logger.getPrefix(`file`, `info`);

                    assert.equal(prefix, logger.portPrefix, `Mismatch with provided portPrefix`);
                });

                it(`should hide port in prefix`, function () {
                    const logger = new Logger({
                        ...basicOptions,
                        "portPrefix": ``,
                    });

                    // destination "file" so we avoid the formatting characters
                    const prefix = logger.getPrefix(`file`, `info`);

                    assert.include(prefix, logger.pidPrefix, `Mismatch with provided pidPrefix`);
                });
            });

        });

        describe(`multiple io.file option changes`, () => {
            it(`should use the changes and merge with existing defaults`, () => {
                const logger1 = new Logger({
                    "enableLogFiles": true,
                    "logFileDirectory": `./logs`,
                    "infoFilename": `info-guy`,
                    "errorFilename": `error-dude`,
                    "debugFilename": `debug-san`,
                });
                const logger2 = new Logger();

                /**
                 * The file options above changed while the defaults remained the same
                 */

                const logFileDirectory1 = logger1.logFileDirectory;
                const infoFilename1 = logger1.infoFilename;
                const errorFilename1 = logger1.errorFilename;
                const debugFilename1 = logger1.debugFilename;

                const logFileDirectory2 = logger2.logFileDirectory;
                const infoFilename2 = logger2.infoFilename;
                const errorFilename2 = logger2.errorFilename;
                const debugFilename2 = logger2.debugFilename;

                assert.notEqual(logFileDirectory1, logFileDirectory2, `logFileDirectory given did not get applied as a new value and still reflects the default`);
                assert.notEqual(infoFilename1, infoFilename2, `infoFilename given did not get applied as a new value and still reflects the default`);
                assert.notEqual(errorFilename1, errorFilename2, `errorFilename given did not get applied as a new value and still reflects the default`);
                assert.notEqual(debugFilename1, debugFilename2, `debugFilename given did not get applied as a new value and still reflects the default`);

            });
        });

        /*
         *describe(`io.fileWriteMode set as "streamFile"`, function () {
         *  it(`should match all defaults`, function () {
         *      const logger1 = new Logger({ "io": { "file": { "mode": `streamFile` } } });
         *      const logger2 = new Logger();
         *      assert.deepEqual(logger1, logger2);
         *  });
         *
         *  it(`should assign the streamFile method to fileWriter`, async function () {
         *      const logger = new Logger({ "io": { "file": { "mode": `streamFile` } } });
         *      await logger.initFile();
         *      expect(logger.fileWriter).toEqual(logger.streamFile);
         *  });
         *});
         */

        describe(`fileWriteMode passed`, () => {
            it(`should not allow any unsupported value to be passed`, () => {
                const logger1 = new Logger({ "fileWriteMode": `abcdefgHIJKLMNOP123345` });
                const logger2 = new Logger();
                assert.deepInclude(logger1, logger2, `Incorrect option passed to fileWriteMode was allowed to save`);
            });

            it(`should match the defaults when set to "writeFileAsync"`, () => {
                const logger1 = new Logger({ "fileWriteMode": `writeFileAsync` });
                const logger2 = new Logger();
                assert.deepEqual(logger1, logger2, `Correct/default option passed for fileWriteMode but the result value or parent props differ somehow`);
            });

            it(`should assign the writeFileAsync method to fileWriter when set to "writeFileAsync"`, () => {
                const logger = new Logger({ "fileWriteMode": `writeFileAsync` });
                logger.initFile();
                assert.equal(logger.fileWriter, logger.writeFileAsync, `fileWriter was not assigned to writeFileAsync as expected`);
            });
        });
    });
});
