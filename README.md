# jounx

## Reqz

- Node.js 12+ (cuz syntax)
- Linux (not really but if you're already doin stuff why not)
-

## Makes use of

- The amazing `chalk` library to make stuff pretty ([check it out](https://github.com/chalk/chalk))
- [TypeScript](https://www.typescriptlang.org/) throughout (finally - *but still kind of a work in progress for the moment*)
- [ESLint](https://eslint.org/) for the code stdz
- [Mocha](https://mochajs.org/) & [Chai](https://www.chaijs.com/) to make testing a little less terrible

### Random things

- Made in Ubuntu so I may have left some linux-specific stuff in the tests or other places.  Just upgrade to linux if you haven't already and nothin to worry about

## Usage

In your project's root directory, run:
```bash
yarn add jounx
# or
npm install --save jounx
```

In your app, import and initialize at the top:
```javascript
// import module
const { Logger } = require('jounx');

// grab an instance
const logger = new Jounx();

// ...or include an options object (see below)
const logger = new Jounx({ "enableLogFile": true, "prefixWithDateTime": false });

/**
 * Log a simple message
 */
logger.info(`Sweet`);

/** 
 * Or multiple messages in a row
 */
logger.info(`First`, `Then the second`, `Annnnd on and on`); // , ..., ..., etc

/** 
 * Error messages
 */
logger.error(`Could not connect to Google`, { "aBunchOfInfo": `About some stuff` });

/**
 * Debug - doesnt really do anything but will use console.trace() if the `dev`
 * option is `true`.  Also will continue to log to its own file even without `dev`
 */
logger.debug(`Let's investigate`, new Error(`Might as well quit`));
```

### Options

```javascript
{
    /**
     * Controls if user is shown the output for Logger.debug() in console or not (enabling log 
     * files will write either way)
     */
    "dev": $NODE_ENV === `development`,

    /**
     * Enables log file to be written while app is running
     */
    "enableLogFile": false,

    /**
     * Determines which method to use for writing the log to the
     * filesystem.
     *  - writeFileAsync - async file write using fs.appendFile
     * *experimental*
     *  - writeFileStream - keep file stream open and pipe new writes on demand
     */
    "fileWriteMode": "writeFileAsync",

    "logFilename": "info.log",

    /**
     * Directory to store the log files if `enableLogFile` is `true`
     *
     * - absolute path
     *  "/var/log/www"
     *
     * - relative path
     *  "../../home/my-logs"
     *
     * - empty path will use current working directory
     *  path.join(__dirname, ".")
     *  path.join(__dirname, "./logs")
     *
     */
    "logDirectory": "./logs",

    /**
     * Pretty much the main point of this lib but maybe you don't want
     * words in your terminal and here's how to stop em
     */
    "enableConsole": true,

    /**
     * *experimental*
     * Max amount of text that will attempt to fit on one line before a line break
     * is inserted
     */
    "consoleMaxWidth": [width of terminal window or 120 if unavailable],

    /**
     * *experimental*
     * Put the prefix info (date/time, PID, etc) on its own line above the
     * primary (first argument provided to one of the loggers) message.
     *
     * - "as-needed" tries to do it only if the prefix info is more than half the 
     *   terminal width
     * 
     * **Only affects console output - file primary messages will remain on the same line as prefix**
     */
    "consoleMultiLine": `always`, // or `never` or `as-needed`

    /**
     * The message will be prepended with a locale-formatted datetime
     */
    "prefixWithDateTime": true,

    /**
     * All-caps notifier of what type of message is being logged
     */
    "prefixWithMessageType": true,

    /**
     * Process ID in system
     */
    "pidPrefix": String(process.pid),

    /**
     * Port the server is bound to - ... or whatever data you want it to be lol
     */
    "portPrefix": ``,

    /**
     * Ways to customize the appearance in the console for each type of data piece
     * Each item in the array needs to be a valid chalk instance method.
     * 
     * const chalk = require('chalk');
     * const consoleChalk = new chalk.Instance({ 'level': 3 });
     * 
     * const coloredText = consoleChalk.[COLOR].[STYLE].[BGCOLOR]
     * 
     * Bold, red text on a black background:
     *  - consoleChalk.red.bgBlack.bold('Hello, world!');
     * 
     * For these options, that would be equivalent to:
     * "xyzFormat": [ `red`, `bgBlack`, `bold` ]
     * 
     * See more at the [chalk site](https://github.com/chalk/chalk)
     * 
     * **Complex combinations like using chalk.rgb(200, 100, 255) are not supported yet**
     */
    "labelFormat": [ `bold` ],

    "pidFormat": [ `white` ],

    "portFormat": [ `bold` ],

    "dateFormat": [ `grey` ],

    "timeFormat": [ `yellow` ],

    "timerFormat": [ `green`, `inverse` ],

    "infoMessageFormat": [ `blueBright` ],

    "infoSecondaryFormat": [ `whiteBright` ],

    "errorMessageFormat": [ `bold`, `redBright` ],

    "errorSecondaryFormat": [ `yellowBright` ],

    "debugMessageFormat": [ `cyanBright` ],

    "debugSecondaryFormat": [ `whiteBright` ],
}
```

## Development

- Set it up

```bash
npm install
```

- Write some code...
- etc.

- Lint it

```bash
npm run lint:test
# or to auto-fix what can be fixed
npm run lint:fix
```

- Test it

```bash
npm test
```
