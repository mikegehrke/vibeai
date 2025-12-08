const fs = require("fs-extra");
const glob = require("glob");
const path = require("path");
const logger = require("../utils/logger");

/**
 * File service for workspace operations
 */

/**
 * Scan workspace for code files
 */
async function scanWorkspaceFiles(root) {
  logger.info(`Scanning workspace: ${root}`);

  return new Promise((resolve, reject) => {
    const patterns = [
      "**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx",
      "**/*.py", "**/*.java", "**/*.kt", "**/*.swift",
      "**/*.go", "**/*.rs", "**/*.rb", "**/*.php",
      "**/*.vue", "**/*.dart"
    ];

    const ignore = [
      "**/node_modules/**",
      "**/venv/**",
      "**/__pycache__/**",
      "**/dist/**",
      "**/build/**",
      "**/.git/**",
      "**/.vscode/**",
      "**/.next/**",
      "**/target/**"
    ];

    glob(`{${patterns.join(",")}}`, {
      cwd: root,
      ignore: ignore,
      absolute: true,
      nodir: true
    }, (error, files) => {
      if (error) {
        reject(error);
      } else {
        logger.info(`✅ Found ${files.length} files`);
        resolve(files);
      }
    });
  });
}

/**
 * Read file content
 */
async function readFileContent(filepath) {
  try {
    return await fs.readFile(filepath, "utf8");
  } catch (error) {
    logger.error(`Read error: ${filepath}`);
    throw error;
  }
}

/**
 * Write file content
 */
async function writeFileContent(filepath, content) {
  try {
    await fs.ensureDir(path.dirname(filepath));
    await fs.writeFile(filepath, content, "utf8");
    logger.info(`✅ Written: ${filepath}`);
  } catch (error) {
    logger.error(`Write error: ${filepath}`);
    throw error;
  }
}

/**
 * Check if file exists
 */
async function fileExists(filepath) {
  return await fs.pathExists(filepath);
}

/**
 * Ensure directory exists
 */
async function ensureDir(dirpath) {
  await fs.ensureDir(dirpath);
}

/**
 * Delete file
 */
async function deleteFile(filepath) {
  await fs.remove(filepath);
}

module.exports = {
  scanWorkspaceFiles,
  readFileContent,
  writeFileContent,
  fileExists,
  ensureDir,
  deleteFile
};
