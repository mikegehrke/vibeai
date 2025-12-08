const path = require("path");

exports.getRelativePath = function (fullPath, basePath) {
  return path.relative(basePath, fullPath);
};

exports.isValidFile = function (filePath) {
  return filePath && !filePath.includes("node_modules") && !filePath.includes("__pycache__");
};
