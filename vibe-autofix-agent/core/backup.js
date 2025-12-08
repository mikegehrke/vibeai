const fs = require("fs-extra");
const path = require("path");

exports.createBackup = async function (filePath, content) {
  const backupDir = path.join(process.cwd(), ".vibe-agent-backup");
  await fs.ensureDir(backupDir);

  const fileName = filePath.replace(/[\\/]/g, "_");
  const backupPath = path.join(backupDir, fileName);

  await fs.writeFile(backupPath, content, "utf-8");
};
