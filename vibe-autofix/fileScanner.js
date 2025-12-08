const glob = require("glob");

exports.scanFiles = function (root) {
  return new Promise((resolve) => {
    glob(
      "**/*.{js,ts,jsx,tsx,html,css,scss,dart,kt,java,swift,py,json}",
      { cwd: root, ignore: ["node_modules/**", ".vibe-backup/**", "vibe-autofix/**"] },
      (err, files) => {
        if (err) {
          resolve([]);
        } else {
          resolve(files.map((f) => root + "/" + f));
        }
      }
    );
  });
};
