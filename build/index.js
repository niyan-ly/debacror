const webpack = require('webpack');
const argParser = require('minimist');
const serveStatic = require('serve-static');
const rm = require('rimraf');
const http = require('http');
const { resolve } = require('path');
const wConfig = require('./webpack.config');
const launchChrome = require('./launch-chrome');
const AfterCompilationPlugin = require('./after-compilation-plugin');

const arg = argParser(process.argv.slice(2));
const server = http.createServer((req, res) => {
  serveStatic('src', {
    index: ['../extension-test.html'],
  })(req, res, () => {
    res.statusCode = 404;
    res.end('NOT FOUND');
  });
});

const errLog = (err, stat) => {
  if (err) {
    throw err;
  }
  if (stat.hasErrors()) {
    throw stat.toString();
  }

  console.log('\ncompile DONE...\n');
};

if (arg.watch) {
  const useConfig = wConfig(false);
  server.listen(3000, () => {
    console.log(`server@${server.address().port} is running ...`);
  });

  webpack(
    {
      ...useConfig,
      watch: true,
      plugins: [
        ...useConfig.plugins,
        new AfterCompilationPlugin(launchChrome),
      ],
    },
    errLog,
  );
} else {
  rm.sync(resolve(__dirname, '../release'));
  webpack(wConfig(), errLog);
}
