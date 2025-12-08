const { glob } = require("glob");

exports.scanFiles = async function (root) {
  try {
    const files = await glob("backend/**/*.py", {
      cwd: root,
      ignore: ["**/__pycache__/**", "**/.venv/**", "**/venv/**", "**/node_modules/**"],
      absolute: true
    });
    return files;
  } catch (err) {
    console.error("File scan error:", err);
    return [];
  }
};
