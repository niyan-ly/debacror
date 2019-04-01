const argParser = require('minimist')

const argv = argParser(process.argv.slice(2))

console.log(argv)
