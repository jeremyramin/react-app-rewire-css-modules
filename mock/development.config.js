const deepFreeze = require('../deepFreeze');

module.exports = deepFreeze({
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        enforce: 'pre',
        use: [
          {options: {}, loader: '/path/to/eslint-loader/index.js'}
        ],
        include: '/path/to/src'
      },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: '/path/to/url-loader/index.js',
            options: {},
          },
          {
            test: /\.(js|jsx|mjs)$/,
            include: '/path/to/src',
            loader: '/path/to/babel-loader/lib/index.js',
            options: {},
          },
          {
            test: /\.css$/,
            use: [
              '/path/to/style-loader/index.js',
              {
                loader: '/path/to/css-loader/index.js',
                options: {importLoaders: 1},
              },
              {
                loader: '/path/to/postcss-loader/lib/index.js',
                options: {},
              },
            ],
          },
          {
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            loader: '/path/to/file-loader/dist/cjs.js',
            options: {name: 'static/media/[name].[hash:8].[ext]'},
          },
        ]
      }]
  }
});
