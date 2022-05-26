const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

// const fs = require('fs')

// let htmlPageNames = []
// let entries = {
//   main: path.resolve(__dirname, '../src/script.js'),
// }

// const readWriteEntries = async () => {
//   await fs.readdir(path.resolve(__dirname, '../src'), (err, filename) => {
//     htmlPageNames = filename
//       .filter((file) => file.includes('html'))
//       .map((file) => file.split('.')[0])

//     htmlPageNames.forEach((page) => {
//       entries[page] = path.resolve(__dirname, `../src/${page}.js`)
//       console.log(entries)
//     })
//   })
// }

let htmlPageNames = [
  'lights',
  'text',
  'galaxy',
  'house',
  'raycaster',
  'portfolio',
  'physics',
  'models',
  'realisticRender',
]
let multipleHtmlPlugins = htmlPageNames.map((name) => {
  return new HtmlWebpackPlugin({
    template: path.resolve(__dirname, `../src/${name}.html`), // relative path to the HTML files
    filename: `${name}.html`, // output HTML files
    chunks: [`${name}`], // respective JS files
  })
})

module.exports = {
  entry: path.resolve(__dirname, '../src/script.js'),
  entry: {
    main: path.resolve(__dirname, '../src/script.js'),
    lights: path.resolve(__dirname, '../src/lights.js'),
    text: path.resolve(__dirname, '../src/text.js'),
    galaxy: path.resolve(__dirname, '../src/galaxy.js'),
    house: path.resolve(__dirname, '../src/house.js'),
    raycaster: path.resolve(__dirname, '../src/raycaster.js'),
    portfolio: path.resolve(__dirname, '../src/portfolio.js'),
    physics: path.resolve(__dirname, '../src/physics.js'),
    models: path.resolve(__dirname, '../src/models.js'),
    realisticRender: path.resolve(__dirname, '../src/realisticRender.js'),
    //... repeat until example 4
  },
  output: {
    hashFunction: 'xxhash64',
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, '../dist'),
  },
  devtool: 'source-map',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, '../static') }],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html'),
      chunks: ['main'],
      minify: false,
    }),
    new MiniCSSExtractPlugin(),
  ].concat(multipleHtmlPlugins),
  module: {
    rules: [
      // HTML
      {
        test: /\.(html)$/,
        use: ['html-loader'],
      },

      // JS
      {
        test: /\.js$/,
        exclude: /node_modules/,
      },

      // CSS
      {
        test: /\.css$/,
        use: [MiniCSSExtractPlugin.loader, 'css-loader'],
      },

      // Images
      {
        test: /\.(jpg|png|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[hash][ext]',
        },
      },

      // Fonts
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[hash][ext]',
        },
      },
    ],
  },
  optimization: {
    minimize: false,
  },
}
