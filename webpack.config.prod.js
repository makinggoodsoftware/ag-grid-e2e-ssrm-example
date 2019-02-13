const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const DIST = path.resolve(__dirname, './dist/public');

module.exports = {
  context: __dirname,
  mode: 'production',
  entry: path.resolve(__dirname, './client/src/index.ts'),
  output: {
    path: DIST,
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: path.resolve(__dirname, '/client/tsconfig.json')
        }
      },
      {
        use: ['style-loader', 'css-loader'],
        test: /\.css$/
      },
      {
      	test: /\.scss$/,
        use: [{
            loader: "style-loader"
        }, {
            loader: "css-loader", options: {
                sourceMap: true
            }
        }, {
            loader: "sass-loader", options: {
                sourceMap: true
            }
        }]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/index.html'
    })
  ]
};

