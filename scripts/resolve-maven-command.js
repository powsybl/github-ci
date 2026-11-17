'use strict';

const fs = require('node:fs');
const path = require('node:path');

const useMvnw = (process.env.USE_MVNW || '').trim() === 'true';
const wrapper = process.env.RUNNER_OS === 'Windows' ? 'mvnw.cmd' : 'mvnw';
const workingDirectory = process.env.WORKING_DIRECTORY || '.';

let cmd = 'mvn';
// The wrapper is looked up in working_directory, the directory where Maven runs.
if (useMvnw && fs.existsSync(path.join(workingDirectory, wrapper))) {
    cmd = `./${wrapper}`;
}

console.log(`Using Maven command: ${cmd}`);
fs.appendFileSync(process.env.GITHUB_OUTPUT, `cmd=${cmd}\n`);