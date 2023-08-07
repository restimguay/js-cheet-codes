

var s = 'test';
require('./init.env.js');
(() => {
    process.on('uncaughtException', function (err) {
        console.log("Handling error automatically");
        console.error(err.stack[2]);
        console.log(s);
    });
})()

//////////////////////////
const NEWLINES_MATCH = /\r\n|\n|\r/
const NEWLINE = '\n'
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/
const RE_NEWLINES = /\\n/g

const parseBuffer = (src) => {
    const obj = {};
    src.toString().split(NEWLINES_MATCH).forEach((line, idx) => {
        // matching "KEY" and "VAL" in "KEY=VAL"
        const keyValueArr = line.match(RE_INI_KEY_VAL);
        // matched?
        if (keyValueArr != null) {
            const key = keyValueArr[1];

            // default undefined or missing values to empty string

            let val = (keyValueArr[2] || '');
            const end = val.length - 1;
            const isDoubleQuoted = val[0] === '"' && val[end] === '"';
            const isSingleQuoted = val[0] === "'" && val[end] === "'";

            // if single or double quoted, remove quotes 
            if (isSingleQuoted || isDoubleQuoted) {
                val = val.substring(1, end);

                // if double quoted, expand newlines
                if (isDoubleQuoted) {
                    val = val.replace(RE_NEWLINES, NEWLINE);
                }
            } else {
                //  remove surrounding whitespace
                val = val.trim();
            }
            obj[key] = val;
        }
    });
    return obj;
}


module.exports = {
    parseBuffer
}
//////////////////////////

const path = require('path');
const { dirname } = require('path');
const fs = require('fs');
const { parseBuffer } = require('./parse');

(() => {
    const appDir = dirname(require.main.filename);
    console.log(appDir, '.env')
    const envFilePath = path.join(appDir, '.env');
    const bufferEnv = fs.readFileSync(envFilePath);
    const envObject = parseBuffer(bufferEnv);

    Object.keys((envObject || {})).map(key => {
        if (!process.env[key] && process.env[key] !== envObject[key]) {
            process.env[key] = envObject[key];
            console.log(envObject[key])
        }
    });

    const version = process.env.VERSION;
    const environment = process.env.ENVIRONMENT;
    const port = process.env.PORT;

    return {
        version,
        environment,
        port,
    }
})();
