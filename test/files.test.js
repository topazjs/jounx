'use strict';

/**
 * @FYI
 * There are race conditions in the tests here - I am aware. They are
 * here for quick glance history and will be removed eventually.
 *
 * I do not plan to fix them.
 *
 * The way I write files now is going to change to *not care* what
 * gets written, how much is written, etc.
 *
 * Just gonna throw on FS access error.
 */

const NODE_VERSION = process
    .version
    .slice(1)
    .split(/\./g)
    .shift();

const {
    promisify,
} = require('util');

const fs = require('fs');
const statAsync = promisify(fs.stat);
const readFileAsync = promisify(fs.readFile);
const { Logger } = require('../build/index.js');
const chai = require('chai');
const assert = chai.assert;

function removeDirectory ( logFileDirectory ) {
    if ( NODE_VERSION >= 12 ) {
        fs.rmdirSync(logFileDirectory, { "recursive": true });
    }
    else {
        for ( const file in fs.readdirSync(logFileDirectory) ) {
            const filePath = `${logFileDirectory}/${file}`;
            if ( !fs.statSync(filePath).isDirectory() ) {
                fs.unlinkSync(filePath);
            }
            else {
                fs.rmdirSync(filePath);
            }
        }
        fs.rmdirSync(logFileDirectory);
    }
}

function makeLogger ( options = {} ) {
    return new Logger({
        "fileWriteMode": `writeFileAsync`,
        "logFileDirectory": `./logs`,
        "enableLogFiles": true,
        "enableConsole": false,
        "infoFilename": `info`,
        "errorFilename": `error`,
        "debugFilename": `debug`,
        "logFileExtension": `log`,
        ...options,
    });
}

describe(`Directory management`, () => {
    it(`should throw when directory access is denied`, function () {
        if ( process.env.USER === `root` ) {
            throw new Error(`Please run tests as non-root user`);
        }
        const restrictedDir = `/root/jounxlogs`;
        assert.throws(function () {
            new Logger({
                "logFileDirectory": restrictedDir,
                "enableLogFiles": true,
                "enableConsole": false,
            });
        });
    });

    it(`should create a new directory if missing`, async () => {
        const logger = makeLogger();
        removeDirectory(logger.logFileDirectory);
        logger.initFile();
        await logger.info(`test new directory made`);
        const dirStat = await statAsync(logger.logFileDirectory);
        assert.isTrue(dirStat.isDirectory());
        removeDirectory(logger.logFileDirectory);
    });

    it(`should create or use a directory matching the default location of ./logs`, async () => {
        const logger = makeLogger({
            "logFileDirectory": `./logs`,
        });
        logger.initFile();
        await logger.info(`test new directory made`);
        const dirStat = await statAsync(logger.logFileDirectory);
        assert.isTrue(dirStat.isDirectory());
        removeDirectory(logger.logFileDirectory);
    });
});

describe(`#info()`, () => {
    const type = `info`;
    const logger = makeLogger();

    const filename = logger[`${type}Filename`];
    const logFileExtension = logger.logFileExtension;
    const logFileDirectory = logger.logFileDirectory;
    const logFileSizeLimit = logger.logFileSizeLimit;

    const filePath = `${logFileDirectory}/${filename}.${logFileExtension}`;

    afterEach(() => removeDirectory(logFileDirectory));

    it(`should write a single message to the log file`, async function () {

        const date = new Date();
        const logMessage = `A test ${type} message! At ${date}!`;
        await logger[ type ](logMessage);

        let fileText = ``;
        try {
            fileText = fs.readFileSync(filePath, { "encoding": `utf8` });
        }
        catch ( e ) {
            assert.notExists(e);
        }
        const index = fileText.indexOf(logMessage);
        assert.isAbove(index, -1);
        assert.equal(fileText.slice(index), `${logMessage}\n`);
    });

    it(`should create new file when name matches and file size is out of limits`, async () => {
        logger.initFile();

        const date = new Date();
        const extraText = (new Array(logFileSizeLimit))
            .fill(1)
            .join('');
        const logMessage = `A test ${type} message! At ${date}! ${extraText}`;
        await logger[ type ](logMessage);
        await logger[ type ](`next file first message`);
        await logger[ type ](`next file second message`);

        const currentFile = `${logFileDirectory}/${filename}.${logFileExtension}`;
        let statNew;
        try {
            statNew = await statAsync(currentFile);
        }
        catch ( e ) {
            assert.notExists(e);
        }

        const nextIndex = await logger.getNextFileIndex(logFileDirectory, `${filename}.${logFileExtension}`) - 1;
        const oldFile = `${logFileDirectory}/${filename}.${logFileExtension}.${nextIndex}`;

        let statOld;
        try {
            statOld = await statAsync(oldFile);
        }
        catch ( e ) {
            assert.notExists(e);
        }

        assert.isAbove(logFileSizeLimit, statNew.size);
        assert.isAbove(statOld.size, logFileSizeLimit);
    });
});

describe(`#error()`, () => {
    const type = `error`;
    const logger = makeLogger();

    const filename = logger[`${type}Filename`];
    const logFileExtension = logger.logFileExtension;
    const logFileDirectory = logger.logFileDirectory;
    const logFileSizeLimit = logger.logFileSizeLimit;

    const filePath = `${logFileDirectory}/${filename}.${logFileExtension}`;

    afterEach(() => removeDirectory(logFileDirectory));

    it(`should write to the log file`, async () => {
        logger.initFile();

        const date = new Date();
        const logMessage = `A test ${type} message! At ${date}!`;
        await logger[ type ](logMessage);

        let fileText = ``;
        try {
            fileText = await readFileAsync(filePath, { "encoding": `utf8` });
        }
        catch ( e ) {
            assert.notExists(e);
        }
        const index = fileText.indexOf(logMessage);
        assert.isAbove(index, -1);
        assert.equal(fileText.slice(index), `${logMessage}\n`);
    });

    it(`should create new file when name matches and file size is out of limits`, async () => {
        logger.initFile();

        const date = new Date();
        const extraText = (new Array(logFileSizeLimit))
            .fill(1)
            .join('');
        const logMessage = `A test ${type} message! At ${date}! ${extraText}`;
        await logger[ type ](logMessage);
        await logger[ type ](`next file first message`);
        await logger[ type ](`next file second message`);

        const currentFile = `${logFileDirectory}/${filename}.${logFileExtension}`;
        let statNew;
        try {
            statNew = await statAsync(currentFile);
        }
        catch ( e ) {
            assert.notExists(e);
        }

        const nextIndex = await logger.getNextFileIndex(logFileDirectory, `${filename}.${logFileExtension}`) - 1;
        const oldFile = `${logFileDirectory}/${filename}.${logFileExtension}.${nextIndex}`;

        let statOld;
        try {
            statOld = await statAsync(oldFile);
        }
        catch ( e ) {
            assert.notExists(e);
        }

        assert.isAbove(logFileSizeLimit, statNew.size);
        assert.isAbove(statOld.size, logFileSizeLimit);
    });
});

describe(`#debug()`, () => {
    const type = `debug`;
    const logger = makeLogger();

    const filename = logger[`${type}Filename`];
    const logFileExtension = logger.logFileExtension;
    const logFileDirectory = logger.logFileDirectory;

    const filePath = `${logFileDirectory}/${filename}.${logFileExtension}`;

    afterEach(() => removeDirectory(logFileDirectory));

    /*it(`should write to the log file`, async () => {
        logger.initFile();

        const date = new Date();
        const logMessage = `A test ${type} message! At ${date}!`;
        await logger[ type ](logMessage);

        let fileText = ``;
        try {
            fileText = await readFileAsync(filePath, { "encoding": `utf8` });
        }
        catch ( e ) {
            assert.notExists(e);
        }
        const index = fileText.indexOf(logMessage);
        expect(index)
            .toBeGreaterThan(-1);
        expect(fileText.slice(index))
            .toEqual(`${logMessage}\n`);
    });

    it(`should create new file when name matches and file size is out of limits`, async () => {
        logger.initFile();

        const date = new Date();
        const extraText = (new Array(logFileSizeLimit))
            .fill(1)
            .join('');
        const logMessage = `A test ${type} message! At ${date}! ${extraText}`;
        await logger[ type ](logMessage);
        await logger[ type ](`next file first message`);
        await logger[ type ](`next file second message`);

        const currentFile = `${logFileDirectory}/${filename}.${logFileExtension}`;
        let statNew;
        try {
            statNew = await statAsync(currentFile);
        }
        catch ( e ) {
            assert.notExists(e);
        }

        const nextIndex = await logger.getNextFileIndex(logFileDirectory, `${filename}.${logFileExtension}`) - 1;
        const oldFile = `${logFileDirectory}/${filename}.${logFileExtension}.${nextIndex}`;

        let statOld;
        try {
            statOld = await statAsync(oldFile);
        }
        catch ( e ) {
            assert.notExists(e);
        }

        expect(statNew.size)
            .toBeLessThan(logFileSizeLimit);
        expect(statOld.size)
            .toBeGreaterThanOrEqual(logFileSizeLimit);
    });*/

    it(`should write a timer result to the log file`, async function () {
        logger.initFile();

        const date = new Date();

        const TIMER_ID = `RANDOM_TIMER_${date.getTime()}`;
        logger.time(TIMER_ID);

        const timerStartTime = logger.timers.get(TIMER_ID);
        const timerEndTime = process.hrtime.bigint();
        const timerResult = logger.getTimerMessage(TIMER_ID, timerEndTime, timerStartTime);
        const message = logger.getText(`file`, `debug`, timerResult);
        await logger.timeEnd(TIMER_ID, timerEndTime);

        let fileText = ``;
        try {
            fileText = await readFileAsync(filePath, { "encoding": `utf8` });
        }
        catch ( e ) {
            assert.notExists(e);
        }
        const index = fileText.indexOf(message);
        assert.isAbove(index, -1);
        assert.equal(fileText.slice(index), `${message}\n`);
    });
});
