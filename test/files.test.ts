import chai from "chai";
import fs from "fs";
import { promisify } from "util";

import { Logger } from "../src";

import { eventInfoType } from "../src/options";

const assert = chai.assert;

const NODE_VERSION = ~~process
    .version
    .slice(1)
    .split(/\./g)
    .shift();

const statAsync = promisify(fs.stat);

function removeDirectory ( logDirectory ) {
    if ( NODE_VERSION >= 12 ) {
        fs.rmdirSync(logDirectory, { "recursive": true });
    }
    else {
        for ( const file in fs.readdirSync(logDirectory) ) {
            const filePath = `${logDirectory}/${file}`;
            if ( !fs.statSync(filePath).isDirectory() ) {
                fs.unlinkSync(filePath);
            }
            else {
                fs.rmdirSync(filePath);
            }
        }
        fs.rmdirSync(logDirectory);
    }
}

function makeLogger ( options = {} ) {
    return new Logger({
        "fileWriteMode": `writeFileAsync`,
        "logDirectory": `./logs`,
        "enableLogFile": true,
        "enableConsole": false,
        "logFilename": `info.log`,
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
                "logDirectory": restrictedDir,
                "enableLogFile": true,
                "enableConsole": false,
            });
        });
    });

    it(`should create a new directory if missing`, async () => {
        const logger = makeLogger();
        removeDirectory(logger.logDirectory);
        logger.initFile();
        await logger.info(`test new directory made`);
        const dirStat = await statAsync(logger.logDirectory);
        assert.isTrue(dirStat.isDirectory());
        removeDirectory(logger.logDirectory);
    });

    it(`should create or use a directory matching the default location of ./logs`, async () => {
        const logger = makeLogger({
            "logDirectory": `./logs`,
        });
        logger.initFile();
        await logger.info(`test new directory made`);
        const dirStat = await statAsync(logger.logDirectory);
        assert.isTrue(dirStat.isDirectory());
        removeDirectory(logger.logDirectory);
    });
});

describe(`#info()`, () => {
    const type = `info`;
    const date = new Date();
    const logMessage = `A test ${type} message! At ${date}!`;
    const logMessage2 = `Oh wow ANOTHER test ${type} message how lucky are we?? At ${date}!`;
    const logMessage3 = `Well this is probly it for ${type} messages.  Bummer - ${date}`;
    // const filename = logger.logFilename;
    // const logDirectory = logger.logDirectory;
    // const filePath = `${logDirectory}/${filename}`;


    it(`should write a single message to the log file`, function ( done ) {
        const logger = makeLogger({
            "dev": true,
            "onFileWriteFinish": function ( info: eventInfoType ) {
                const fileText = fs.readFileSync(info.currentPath, { "encoding": `utf8` });

                const index = fileText.indexOf(logMessage);
                assert.isAbove(index, -1);
                assert.equal(fileText.slice(index), `${logMessage}\n`);
                removeDirectory(this.logDirectory);
                done();
            },
        });

        logger[ type ](logMessage);
    });

    it(`should write three messages to the log file`, function ( done ) {
        const logger = makeLogger({
            "dev": true,
            "onFileWriteStart": function ( info: eventInfoType ) {
                console.log(`starting file write`, info.fileWriteId);
            },
            "onFileWriteFinish": function ( info: eventInfoType ) {
                console.log(`stopping file write`, info.fileWriteId);
                const fileText = fs.readFileSync(info.currentPath, { "encoding": `utf8` });

                const index = fileText.indexOf(logMessage);
                assert.isAbove(index, -1);
                assert.equal(fileText.slice(index, logMessage.length), `${logMessage}\n`);

                const index2 = fileText.indexOf(logMessage2);
                assert.isAbove(index2, -1);
                assert.equal(fileText.slice(index2, logMessage2.length), `${logMessage2}\n`);

                const index3 = fileText.indexOf(logMessage3);
                assert.isAbove(index3, -1);
                assert.equal(fileText.slice(index3, logMessage3.length), `${logMessage3}\n`);
                removeDirectory(this.logDirectory);
                done();
            },
        });

        logger[ type ](logMessage, logMessage2, logMessage3);
    });
});

