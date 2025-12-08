const simpleGit = require("simple-git");
const logger = require("../utils/logger");
const diff = require("diff");
const fs = require("fs-extra");
const path = require("path");

/**
 * Git service for version control operations
 */

/**
 * Get git instance for workspace
 */
function getGit(workspaceRoot) {
  return simpleGit(workspaceRoot);
}

/**
 * Apply unified diff patch
 */
async function applyPatch(workspaceRoot, patchText) {
  if (!patchText || !patchText.includes("---")) {
    logger.warn("Invalid patch - skipping");
    return;
  }

  logger.info("Applying patch...");

  try {
    // Parse patch
    const patches = diff.parsePatch(patchText);

    for (const patch of patches) {
      // Get file path (remove a/ or b/ prefix)
      const filePath = path.join(workspaceRoot, patch.newFileName.replace(/^[ab]\//, ""));

      // Read original file if exists
      let original = "";
      if (await fs.pathExists(filePath)) {
        original = await fs.readFile(filePath, "utf8");
      }

      // Apply patch
      const result = diff.applyPatch(original, patch);

      if (result) {
        // Ensure directory exists
        await fs.ensureDir(path.dirname(filePath));
        // Write patched file
        await fs.writeFile(filePath, result, "utf8");
        logger.info(`✅ Patched: ${patch.newFileName}`);
      } else {
        logger.warn(`Failed to apply patch to ${patch.newFileName}`);
      }
    }

  } catch (error) {
    logger.error(`Patch error: ${error.message}`);
  }
}

/**
 * Create git commit
 */
async function commit(workspaceRoot, message) {
  const git = getGit(workspaceRoot);

  try {
    // Stage all changes
    await git.add(".");

    // Commit
    await git.commit(message);

    logger.info(`✅ Committed: ${message.split("\n")[0]}`);
  } catch (error) {
    logger.error(`Commit error: ${error.message}`);
  }
}

/**
 * Create a new branch
 */
async function createBranch(workspaceRoot, branchName) {
  const git = getGit(workspaceRoot);

  try {
    await git.checkoutLocalBranch(branchName);
    logger.info(`✅ Created branch: ${branchName}`);
  } catch (error) {
    logger.error(`Branch creation error: ${error.message}`);
  }
}

/**
 * Get current status
 */
async function status(workspaceRoot) {
  const git = getGit(workspaceRoot);
  return await git.status();
}

/**
 * Initialize git repo if not exists
 */
async function init(workspaceRoot) {
  const git = getGit(workspaceRoot);

  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      await git.init();
      logger.info("✅ Git initialized");
    }
  } catch (error) {
    logger.error(`Git init error: ${error.message}`);
  }
}

module.exports = {
  applyPatch,
  commit,
  createBranch,
  status,
  init,
  getGit
};
