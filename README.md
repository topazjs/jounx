# jounx

## yay

- For Node 12 (might be ok on older ones, I dunno yet)
- Uses the amazing `chalk` library to make stuff pretty ([check it out](https://github.com/chalk/chalk))
- Made in Ubuntu so I may have left some linux-specific stuff in the tests somewhere

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
const Jounx = require('jounx');

// grab an instance
const logger = new Jounx();

// ...or include an options object (see below)
const logger = new Jounx({ "enableLogFiles": false, "prefixWithDateTime": false });

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
    "dev": process.env.NODE_ENV === `development`,

    /**
     * Enables log file to be written while app is running
     */
    "enableLogFiles": true,

    /**
     * Determines which method to use for writing the log to the
     * filesystem.
     *  - writeFileAsync - async file write using fs.appendFile
     *  - writeFileStream - keep file stream open and pipe new writes on demand
     */
    "fileWriteMode": "writeFileAsync",

    /**
     * Each type of output can be saved to a different file in case
     * you want to save your errors away from your regular info.
     *
     * Any that are missing custom or default names on purpose will not
     * be saved.  Also if two or more share the same name they will write
     * to the same file.
     */

    "infoFilename": "info",

    "warnFilename": "warn",

    "errorFilename": "error",

    "debugFilename": "debug",

    /**
     * Directory to store the log files if `enableLogFiles` is `true`
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
    "logFileDirectory": "./logs",

    /**
     * Extension to use at the end of the filename
     */
    "logFileExtension": "log",

    /**
     * Number of bytes to allow log to reach before renaming and starting a new one
     */
    "logFileSizeLimit": 5000000,

    /**
     * Pretty much the main point of this lib but maybe you don't want
     * words in your terminal and here's how to stop em
     */
    "enableConsole": true,

    /**
     * Max amount of text that will attempt to fit on one line before a line break
     * is inserted
     */
    "consoleMaxWidth": [width of terminal window or 120 if unavailable],

    /**
     * Put the prefix info (date/time, PID, etc) on its own line above the
     * primary (first argument provided to one of the loggers) message.
     *
     * - "as-needed" tries to do it only if the prefix info is more than half the 
     *   terminal width
     * 
     * **Only affects console output - file primary messages will remain on the same line as prefix**
     */
    "consoleMultiLine": `always`,

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

Must have Node 12+ (to run tests fully at least)

- Set it up

```bash
npm install
```

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
