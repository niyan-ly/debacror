const webpack = require('webpack')
const { resolve } = require('path')
const CopyPlugin = require('copy-webpack-plugin-advanced')
const argParser = require('minimist')

let useConfig = {}
const arg = argParser(process.argv.slice(2))
const config = {
  mode: 'production',
  context: resolve(__dirname, 'src'),
  resolve: {
    extensions: ['.js']
  },
  entry: {
    'content_script': './content_script.js',
    background: './background.js',
    popup: './popup.js'
  },
  output: {
    filename: '[name].js',
    path: resolve(__dirname, 'release')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    ]
  },
  plugins: [
    new CopyPlugin([
      'manifest.json',
      'popup.html',
    ])
  ]
}

useConfig = { ...config, watch: arg.watch }

webpack(useConfig, (err, stat) => {
  if (err) {
    throw err
  } if (stat.hasErrors()) {
    throw stat.toString()
  }

  console.log('\ncompilation DONE!\n');

})