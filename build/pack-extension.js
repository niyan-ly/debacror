const rm = require('rimraf');
const { resolve } = require('path');
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const extensionPath = resolve(__dirname, '../release');
const pemPath = resolve(__dirname, '../release.pem');
const chrome = puppeteer.executablePath();

function pack() {
  console.log('--- START TO PACK EXTENSION ---');

  rm.sync(resolve(__dirname, '../release.crx'));

  return new Promise((res, rej) => {
    const thread = spawn(
      chrome,
      [
        `--pack-extension=${extensionPath}`,
        `--pack-extension-key=${pemPath}`
      ],
      {
        stdio: 'inherit',
        shell: process.platform === 'win32' ? 'cmd.exe' : false,
      },
    );

    thread.on('close', res);
    thread.on('error', rej);
  });
}

pack();
