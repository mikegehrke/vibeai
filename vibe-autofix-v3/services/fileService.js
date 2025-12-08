const fs = require("fs-extra");
const glob = require("glob");
const path = require("path");
const logger = require("../utils/logger");

/**
 * Scan workspace for all code files
 * @param {string} root - Workspace root path
 * @returns {Promise<string[]>} Array of absolute file paths
 */
async function scanWorkspaceFiles(root) {
  logger.info(`Scanning workspace: ${root}`);

  return new Promise((resolve, reject) => {
    const patterns = [
      "**/*.js",
      "**/*.ts",
      "**/*.jsx",
      "**/*.tsx",
      "**/*.py",
      "**/*.java",
      "**/*.kt",
      "**/*.swift",
      "**/*.go",
      "**/*.rs",
      "**/*.rb",
      "**/*.php",
      "**/*.vue",
      "**/*.html",
      "**/*.css",
      "**/*.scss"
    ];

    const ignorePatterns = [
      "**/node_modules/**",
      "**/venv/**",
      "**/__pycache__/**",
      "**/dist/**",
      "**/build/**",
      "**/.git/**",
      "**/.vscode/**",
      "**/.idea/**",
      "**/target/**",
      "**/.next/**",
      "**/.vibe-history/**",
      "**/.vibe-agent-backup/**"
    ];

    glob(`{${patterns.join(",")}}`, {
      cwd: root,
      ignore: ignorePatterns,
      absolute: true,
      nodir: true
    }, (error, files) => {
      if (error) {
        logger.error(`File scan error: ${error.message}`);
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
 * @param {string} filepath - Absolute path to file
 * @returns {Promise<string>} File content
 */
async function readFileContent(filepath) {
  try {
    const content = await fs.readFile(filepath, "utf8");
    return content;
  } catch (error) {
    logger.error(`Failed to read ${filepath}: ${error.message}`);
    throw error;
  }
}

/**
 * Write file content
 * @param {string} filepath - Absolute path to file
 * @param {string} content - Content to write
 */
async function writeFileContent(filepath, content) {
  try {
    await fs.writeFile(filepath, content, "utf8");
    logger.info(`✅ Written: ${filepath}`);
  } catch (error) {
    logger.error(`Failed to write ${filepath}: ${error.message}`);
    throw error;
  }
}

/**
 * Check if file exists
 * @param {string} filepath - Path to check
 * @returns {Promise<boolean>}
 */
async function fileExists(filepath) {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create directory if it doesn't exist
 * @param {string} dirpath - Directory path
 */
async function ensureDir(dirpath) {
  await fs.ensureDir(dirpath);
}

module.exports = {
  scanWorkspaceFiles,
  readFileContent,
  writeFileContent,
  fileExists,
  ensureDir
};
