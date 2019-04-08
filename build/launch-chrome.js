const puppeteer = require('puppeteer')
const { resolve } = require('path')
const extensionPath = resolve(__dirname, '../release')

let browser = null

async function launchChrome() {
  /**
   * ignore when instance of browser window already exist
   */
  if (browser && (await browser.pages()).length) {
    return
  }
  browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ],
    defaultViewport: null,
    devtools: false
  })

  await (await browser.pages())[0].goto('http://127.0.0.1:3000')
}

module.exports = launchChrome