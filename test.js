const puppeteer = require('puppeteer-core')
const { resolve } = require('path')

const extPath = resolve(__dirname, './release')
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'

  ; (async () => {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: chromePath,
      args: [
        `--disable-extensions-except=${extPath}`,
        `--load-extension=${extPath}`
      ]
    })

    // const page = await browser.newPage();
    // page.goto('https://www.baidu.com')
  })();