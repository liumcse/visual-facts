const path = require("path");
const SRC_PATH = path.resolve(__dirname, "./src");

console.log("SRC_PATH", SRC_PATH);

module.exports = {
  // Put your normal webpack config below here
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    alias: {
      "react-dom": "@hot-loader/react-dom",
      "@root": SRC_PATH,
    },
  },
  module: {
    rules: require("./webpack.rules"),
  },
  externals: [
    function(context, request, callback) {
      if (/^nodegit/.test(request))
        return callback(null, "commonjs" + " " + request);
      callback();
    },
  ],
};
