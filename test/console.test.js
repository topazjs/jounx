'use strict';

const chai = require('chai');
const assert = chai.assert;

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

const { Logger } = require('../build/index.js');

const makeLogger = ( options = {} ) => new Logger({
    "enableLogFiles": false,
    "enableConsole": true,
    "prefixWithDateTime": false,
    "pidPrefix": ``,
    "portPrefix": ``,
    ...options,
});

describe(`Console`, function () {
    const logger = makeLogger();

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

        it(`should start a timer, end the timer, and remove the timer`, async function () {
            assert.isEmpty(logger.timers);

            logger.time(id);

            const timerStartValue = logger
                .timers
                .get(id);

            assert.typeOf(timerStartValue, `bigint`);

            const timerEndValue = process.hrtime.bigint();

            assert.typeOf(timerEndValue, `bigint`);
            assert.isTrue(timerEndValue > timerStartValue, `Timer start time is somehow after the end time`);

            await logger.timeEnd(id, timerEndValue);

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
            const formattedMessage = logger.getFormatted(`console`,`timerFormat`, message);
            const full = logger.getText(`console`, `timer`, formattedMessage);
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

            const formattedMessage = logger.getFormatted(`console`, `infoMessage`, message);
            const full = logger.getText(`console`, `info`, formattedMessage);
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
            const logger = makeLogger();
            logger.error(message);

            const formattedMessage = logger.getFormatted(`console`,`errorMessage`, message);
            const full = logger.getText(`console`, `error`, formattedMessage);
            expectedOutput.push(full);

            assert.includeMembers(errorOutput, expectedOutput);
        });

        it(`should write two messages to the console error output`, function () {
            const expectedOutput = [];
            logger.error(message, message2);

            const formattedMessage = logger.getFormatted(`console`, `errorMessage`, message);
            const formattedMessage2 = logger.getFormatted(`console`, `errorSecondary`, message2);
            const full = logger.getText(`console`, `error`, formattedMessage, formattedMessage2);
            expectedOutput.push(full);

            assert.includeMembers(errorOutput, expectedOutput);
        });

        it(`should write multiple messages of mixed types to the console error output`, function () {
            const expectedOutput = [];
            logger.error(message, message2, message3);

            const formattedMessage = logger.getFormatted(`console`, `errorMessage`, message);
            const messages = [ message2, message3 ].map(logger.getFormatted.bind(logger, `console`, `errorSecondary`))
            const full = logger.getText(`console`, `error`, formattedMessage, ...messages);
            expectedOutput.push(full);

            assert.includeMembers(errorOutput, expectedOutput);
        });


    });

    describe(`#debug()`, function () {
        let debugOutput = [];

        function mockTrace ( output ) {
            debugOutput.push(output);
        }

        beforeEach(function () {
            console.trace = mockTrace;
            debugOutput = [];
        });

        it(`should do nothing if options.dev === false`, function () {
            const logger = makeLogger({ dev: false });
            const message = `Hello, world!`;
            console.log(logger.options);
            logger.debug(message);
            assert.includeMembers(debugOutput, []);
        });

        it(`should write stuff to the console trace output if options.dev === true`, function () {
            const expectedOutput = [];
            const logger = makeLogger({ dev: true });

            const message = `Hello, world!`;
            const formattedMessage = logger.getFormatted(`console`,`debugMessage`, message);
            const full = logger.getText(`console`, `debug`, formattedMessage);
            expectedOutput.push(full);

            logger.debug(message);
            assert.includeMembers(debugOutput, expectedOutput);
        });
    });
});
