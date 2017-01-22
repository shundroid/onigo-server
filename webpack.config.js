const webpack = require("webpack");

module.exports = {
  cache: true,
  entry: {
    dashboard: "./dashboard/js/main.js",
    scoreboard: "./scoreboard/js/main.js"
  },
  output: {
    path: __dirname,
    filename: "./[name]/js/build/bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel",
        query: {
          cacheDirectory: true,
          presets: ["es2015"]
        }
      },
      { test: /\.vue$/, loader: "vue-loader" },
      { test: /\.css$/, loader: "style-loader!css-loader" }
    ]
  }
};
