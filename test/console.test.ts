import chai from "chai";
import {
    destinationTypes,
    formatTypes,
    Logger,
    logTypes,
} from "../index";

const assert = chai.assert;

// import {
//     LoggerOptions,
// } from "../options";

const originalInfo = console.info;
const originalLog = console.log;
const originalError = console.error;
const originalTrace = console.trace;

afterEach(function () {
    console.info = originalInfo;
    console.log = originalLog;
    console.error = originalError;
    console.trace = originalTrace;
});

describe(`Console`, function () {
    const logger = new Logger({
        "enableLogFiles": false,
        "enableConsole": true,
        "prefixWithDateTime": false,
        "pidPrefix": ``,
        "portPrefix": ``,
    });

    describe(`#time()`, function () {
        const id = `TIMER_TEST_${Date.now()}`;

        let logOutput = [];

        function mockLog ( output ) {
            logOutput.push(output);
        }

        beforeEach(function () {
            console.log = mockLog;
            logOutput = [];
        });

        afterEach(function () {
            logger.timers.clear();
        });

        it(`should start a new timer`, function () {
            assert.isEmpty(logger.timers);

            logger.time(id);

            const timerStartValue = logger
                .timers
                .get(id);

            assert.typeOf(timerStartValue, `bigint`);
        });

        it(`should start a timer, end it, and remove the time from the timers map`, function () {
            assert.isEmpty(logger.timers);

            logger.time(id);

            const timerStartValue = logger
                .timers
                .get(id);

            assert.typeOf(timerStartValue, `bigint`);

            const timerEndValue = process.hrtime.bigint();

            assert.typeOf(timerEndValue, `bigint`);
            assert.isTrue(timerEndValue > timerStartValue, `Timer start time is somehow after the end time`);

            logger.timeEnd(id, timerEndValue);

            const timerRemoved = !logger
                .timers
                .has(id);

            assert.isTrue(timerRemoved);
        });

        it(`should throw if .timeEnd() does not find a matching timer`, function () {
            assert.throws(() => logger.timeEnd());
            assert.throws(() => logger.timeEnd(`abc123_NOTREAL`));
            assert.throws(() => logger.timeEnd(`abc123_NOTREAL_456`, process.hrtime.bigint()));
        });

        it(`should write a timer result to the console log output`, function () {
            const expectedOutput = [];
            const TIMER_ID = `_INFO_TIMER_`;
            logger.time(TIMER_ID);

            const timerStart = logger.timers.get(TIMER_ID);
            assert.typeOf(timerStart, `bigint`);

            const timerEnd = process.hrtime.bigint();
            assert.typeOf(timerEnd, `bigint`);
            assert.isTrue(timerEnd > timerStart);

            logger.timeEnd(TIMER_ID, timerEnd);

            const message = logger.getTimerMessage(TIMER_ID, timerEnd, timerStart);
            const formattedMessage = logger.getFormatted(destinationTypes.CONSOLE,formatTypes.TIMER, message);
            const full = logger.getText(destinationTypes.CONSOLE, logTypes.TIMER, formattedMessage);
            expectedOutput.push(full);

            assert.includeMembers(logOutput, expectedOutput);
        });
    });

    describe(`#info()`, function () {
        let infoOutput = [];

        function mockInfo ( output ) {
            infoOutput.push(output);
        }

        beforeEach(function () {
            console.info = mockInfo;
            infoOutput = [];
        });

        const message = `Hello, world!`;

        it(`should write stuff to the console info output`, function () {
            const expectedOutput = [];
            logger.info(message);

            const formattedMessage = logger.getFormatted(destinationTypes.CONSOLE, formatTypes.INFO, message);
            const full = logger.getText(destinationTypes.CONSOLE, logTypes.INFO, formattedMessage);
            expectedOutput.push(full);

            assert.includeMembers(infoOutput, expectedOutput);
        });
    });

    describe(`#error()`, function () {
        let errorOutput = [];

        function mockError ( output ) {
            errorOutput.push(output);
        }

        beforeEach(function () {
            console.error = mockError;
            errorOutput = [];
        });

        const message = `Hello, world!`;
        const message2 = `Well let's make this interesting shall we`;
        const message3 = [
            {label: `ad_groups`, value: `ad_groups`, image: `/${~~(Math.random() * 10)}.jpg`},
            {label: `ad_users`, value: `ad_users`, image: `/${~~(Math.random() * 10)}.jpg`},
            {label: `ae_scripts`, value: `ae_scripts`, image: `/${~~(Math.random() * 10)}.jpg`},
            {label: `alerts`, value: `alerts`, image: `/${~~(Math.random() * 10)}.jpg`},
            {label: `api_models`, value: `api_models`, image: `/${~~(Math.random() * 10)}.jpg`},
        ];

        it(`should write a single message to the console error output`, function () {
            const expectedOutput = [];
            const logger = new Logger({
                "enableLogFiles": false,
                "enableConsole": true,
                "prefixWithDateTime": false,
                "pidPrefix": ``,
                "portPrefix": ``,
            });
            logger.error(message);

            const formattedMessage = logger.getFormatted(destinationTypes.CONSOLE,formatTypes.ERROR, message);
            const full = logger.getText(destinationTypes.CONSOLE, logTypes.ERROR, formattedMessage);
            expectedOutput.push(full);

            assert.includeMembers(errorOutput, expectedOutput);
        });

        it(`should write two messages to the console error output`, function () {
            const expectedOutput = [];
            logger.error(message, message2);

            const formattedMessage = logger.getFormatted(destinationTypes.CONSOLE, formatTypes.ERROR, message);
            const formattedMessage2 = logger.getFormatted(destinationTypes.CONSOLE, formatTypes.ERROR2, message2);
            const full = logger.getText(destinationTypes.CONSOLE, logTypes.ERROR, formattedMessage, formattedMessage2);
            expectedOutput.push(full);

            assert.includeMembers(errorOutput, expectedOutput);
        });

        it(`should write multiple messages of mixed types to the console error output`, function () {
            const expectedOutput = [];
            logger.error(message, message2, message3);

            const formattedMessage = logger.getFormatted(destinationTypes.CONSOLE, formatTypes.ERROR, message);
            const messages = [ message2, message3 ].map(logger.getFormatted.bind(logger, destinationTypes.CONSOLE, formatTypes.ERROR2))
            const full = logger.getText(destinationTypes.CONSOLE, logTypes.ERROR, formattedMessage, ...messages);
            expectedOutput.push(full);

            assert.includeMembers(errorOutput, expectedOutput);
        });


    });

    describe(`#debug()`, function () {
        let debugOutput = [];
        const message = `Hello, world!`;

        function mockTrace ( output ) {
            debugOutput.push(output);
        }

        beforeEach(function () {
            console.trace = mockTrace;
            debugOutput = [];
        });

        it(`should do nothing if options.dev === false`, function () {
            const logger = new Logger({
                "enableLogFiles": false,
                "enableConsole": true,
                "prefixWithDateTime": false,
                "pidPrefix": ``,
                "portPrefix": ``,
                "dev": false,
            });
            logger.debug(message);
            assert.includeMembers(debugOutput, []);
        });

        it(`should write stuff to the console trace output if options.dev === true`, function () {
            const expectedOutput = [];
            const logger = new Logger({
                "enableLogFiles": false,
                "enableConsole": true,
                "prefixWithDateTime": false,
                "pidPrefix": ``,
                "portPrefix": ``,
                "dev": true,
            });

            const formattedMessage = logger.getFormatted(destinationTypes.CONSOLE,formatTypes.DEBUG, message);
            const full = logger.getText(destinationTypes.CONSOLE, logTypes.DEBUG, formattedMessage);
            expectedOutput.push(full);

            logger.debug(message);
            assert.includeMembers(debugOutput, expectedOutput);
        });
    });
});
