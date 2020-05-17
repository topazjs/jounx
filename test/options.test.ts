import chai from "chai";

import { Logger } from "../src";

import {
    destinationTypes,
    LoggerOptions,
    logTypes,
} from "../src/options";

const assert = chai.assert;

/**
 * Initialization
 */

describe(`Initialization and options`, () => {
    class TestClass<T extends LoggerOptions> extends LoggerOptions {
        constructor ( options?: T | {} ) {
            super(options);
        }
    }

    describe(`- No options passed`, () => {
        it(`new Logger() is an instance of Logger with default options`, () => {
            const logger = new Logger();
            const testClass = new TestClass();
            assert.deepInclude(logger, testClass);
        });
        it(`new Logger(null) is an instance of Logger with default options`, () => {
            const testOptions = null;
            const logger = new Logger(testOptions);
            const testClass = new TestClass();
            assert.deepInclude(logger, testClass);
        });
        it(`new Logger({}) is an instance of Logger with default options`, () => {
            const testOptions = {};
            const logger = new Logger(testOptions);
            const testClass = new TestClass();
            assert.deepInclude(logger, testClass);
        });
        it(`new Logger([]) is an instance of Logger with default options`, () => {
            const testOptions = [];
            const logger = new Logger(testOptions);
            const testClass = new TestClass();
            assert.deepInclude(logger, testClass);
        });
        it(`new Logger(0) is an instance of Logger with default options`, () => {
            const testOptions = 0;
            const logger = new Logger(testOptions);
            const testClass = new TestClass();
            assert.deepInclude(logger, testClass);
        });
        it(`new Logger('') is an instance of Logger with default options`, () => {
            const testOptions = ``;
            const logger = new Logger(testOptions);
            const testClass = new TestClass();
            assert.deepInclude(logger, testClass);
        });
    });

    describe(`- Unexpected options passed`, () => {
        it(`new Logger({ "abc": true, "def": 123 }) is an instance of Logger with default options`, () => {
            const testOptions = {
                "abc": true,
                "def": 123,
            };
            const logger = new Logger(testOptions);
            const testClass = new TestClass();
            assert.deepInclude(logger, testClass);
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
            const testClass = new TestClass();
            assert.deepInclude(logger, testClass);
        });
        it(`new Logger('abc') is an instance of Logger with default options`, () => {
            const testOptions = `abc`;
            const logger = new Logger(testOptions);
            const testClass = new TestClass();
            assert.deepInclude(logger, testClass);
        });
        it(`new Logger(NaN) is an instance of Logger with default options`, () => {
            const testOptions = NaN;
            const logger = new Logger(testOptions);
            const testClass = new TestClass();
            assert.deepInclude(logger, testClass);
        });
        it(`new Logger(function () {}) is an instance of Logger with default options`, () => {
            const testOptions = function () {};
            const logger = new Logger(testOptions);
            const testClass = new TestClass();
            assert.deepInclude(logger, testClass);
        });
        it(`new Logger(() => {}) is an instance of Logger with default options`, () => {
            const testOptions = () => {};
            const logger = new Logger(testOptions);
            const testClass = new TestClass();
            assert.deepInclude(logger, testClass);
        });
        it(`new Logger(Infinity) is an instance of Logger with default options`, () => {
            const testOptions = Infinity;
            const logger = new Logger(testOptions);
            const testClass = new TestClass();
            assert.deepInclude(logger, testClass);
        });
    });

    describe(`#options()`, () => {
        const basicOptions = {
            "enableLogFile": false,
            "enableConsole": false,
            // "enableExternal": false,
        };

        it(`should use defaults when no options passed`, () => {
            const logger = new Logger();
            const testClass = new TestClass();
            assert.deepInclude(logger, testClass);
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
                const prefix = logger.getPrefix(destinationTypes.FILE, logTypes.INFO);

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
                    const prefix = logger.getPrefix(destinationTypes.FILE, logTypes.INFO);

                    assert.equal(prefix, logger.portPrefix, `Mismatch with provided portPrefix`);
                });

                it(`should hide port in prefix`, function () {
                    const logger = new Logger({
                        ...basicOptions,
                        "portPrefix": ``,
                    });

                    // destination "file" so we avoid the formatting characters
                    const prefix = logger.getPrefix(destinationTypes.FILE, logTypes.INFO);

                    assert.include(prefix, logger.pidPrefix, `Mismatch with provided pidPrefix`);
                });
            });

        });

        describe(`multiple io.file option changes`, () => {
            it(`should use the changes and merge with existing defaults`, () => {
                const logger1 = new Logger({
                    "enableLogFile": true,
                    "logDirectory": `./logs`,
                    "logFilename": `info-guy.log`,
                });
                const logger2 = new Logger();

                /**
                 * The file options above changed while the defaults remained the same
                 */

                const logDirectory1 = logger1.logDirectory;
                const logFilename1 = logger1.logFilename;

                const logDirectory2 = logger2.logDirectory;
                const logFilename2 = logger2.logFilename;

                assert.notEqual(logDirectory1, logDirectory2, `logDirectory given did not get applied as a new value and still reflects the default`);
                assert.notEqual(logFilename1, logFilename2, `logFilename given did not get applied as a new value and still reflects the default`);

            });
        });

        /**
         * Add this back when stream is re-enabled again
         */
        /*
        describe(`fileWriteMode passed`, () => {
            it(`should not allow any unsupported value to be passed`, () => {
                const logger1 = new Logger({ "fileWriteMode": `abcdefgHIJKLMNOP123345` });
                const logger2 = new Logger();
                assert.deepInclude(logger1, logger2, `Incorrect option passed to fileWriteMode was allowed to save`);
            });

            it(`should match the defaults when set to "writeFileAsync"`, () => {
                const logger1 = new Logger({ "fileWriteMode": fileWriteModeTypes.ASYNC });
                const logger2 = new Logger();
                assert.deepEqual(logger1, logger2, `Correct/default option passed for fileWriteMode but the result value or parent props differ somehow`);
            });

            it(`should assign the writeFileAsync method to fileWriter when set to "writeFileAsync"`, () => {
                const logger = new Logger({ "enableLogFile": true, "fileWriteMode": fileWriteModeTypes.ASYNC });
                logger.initFile();
                assert.equal(logger.fileWriter, logger.writeFileAsync, `fileWriter was not assigned to writeFileAsync as expected`);
            });
        });
        */
    });
});
