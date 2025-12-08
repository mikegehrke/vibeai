const fs = require("fs-extra");
const path = require("path");

exports.backupFile = async function (filePath, content) {
  const dir = path.join(process.cwd(), ".vibe-backup");
  await fs.ensureDir(dir);

  const backupPath = path.join(dir, filePath.replace(/[\\/]/g, "_"));
  await fs.writeFile(backupPath, content, "utf-8");
};
