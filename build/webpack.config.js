const CopyPlugin = require('copy-webpack-plugin-advanced')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { resolve } = require('path')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  mode: 'production',
  context: resolve(__dirname, '../src'),
  // devtool: 'cheap-module-source-map',
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.js', '.vue', '.jsx']
  },
  entry: {
    'content_script': './content_script.js',
    background: './background.js',
    popup: './popup',
    devtool: './devtool'
  },
  output: {
    filename: '[name].js',
    // chunkFilename: 'chunk.js',
    path: resolve(__dirname, '../release')
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          test: /[\\/]node_modules[\\/](vue|buefy)[\\/]/,
          name: 'vendors',
          chunks: 'all',
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        exclude: [/node_modules/],
        options: {}
      },
      {
        test: /.s?css$/,
        use: [
          {
            loader: 'vue-style-loader',
          },
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        options: {
          /**
           * use @vue/babel-preset-jsx to enable auto-inject h feature
           */
          presets: ['@babel/preset-env', '@vue/babel-preset-jsx'],
          plugins: [
            /** this plugin should always on top of plugins */
            '@vue/babel-plugin-transform-vue-jsx',
            '@babel/plugin-transform-runtime',
            [
              '@babel/plugin-proposal-decorators',
              {
                legacy: true
              }
            ],
            'transform-class-properties'
          ]
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new CopyPlugin([
      'manifest.json',
      'popup_disabled.html',
      'devtool.html',
      'devtool/create-panel.js',
      {
        from: 'icons/',
        to: 'img/',
      }
    ]),
    new HtmlWebpackPlugin({
      template: '../src/popup.html',
      inject: 'body',
      filename: 'popup.html',
      chunks: ['vendors', 'popup']
    }),
    new HtmlWebpackPlugin({
      template: '../src/popup.html',
      inject: 'body',
      filename: 'debacror-tab.html',
      chunks: ['vendors', 'devtool']
    })
  ]
}
