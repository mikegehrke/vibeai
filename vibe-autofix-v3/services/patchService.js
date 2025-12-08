const diff = require("diff");
const logger = require("../utils/logger");

/**
 * Apply a unified diff patch to a file
 * @param {string} filepath - Path to file
 * @param {string} original - Original file content
 * @param {string} patchText - Unified diff patch
 * @returns {Promise<string>} Updated content
 */
async function applyUnifiedPatch(filepath, original, patchText) {
  logger.info(`Applying patch to: ${filepath}`);

  try {
    // Parse the patch
    const patches = diff.parsePatch(patchText);

    if (!patches || patches.length === 0) {
      logger.warn("No valid patches found in patch text");
      return null;
    }

    // Apply the first patch (we expect only one)
    const patch = patches[0];
    const result = diff.applyPatch(original, patch);

    if (!result) {
      logger.error("Failed to apply patch - patch may not match original content");
      return null;
    }

    // Write the patched content
    const fs = require("fs-extra");
    await fs.writeFile(filepath, result, "utf8");

    logger.info("✅ Patch applied successfully");
    return result;

  } catch (error) {
    logger.error(`Patch application error: ${error.message}`);
    throw error;
  }
}

/**
 * Preview a patch without applying it
 * @param {string} original - Original content
 * @param {string} patchText - Unified diff patch
 * @returns {Promise<string>} Diff preview
 */
async function previewPatch(original, patchText) {
  try {
    // Return the patch text itself as preview
    return patchText;
  } catch (error) {
    logger.error(`Patch preview error: ${error.message}`);
    return `Error previewing patch: ${error.message}`;
  }
}

/**
 * Create a unified diff between two strings
 * @param {string} oldContent - Original content
 * @param {string} newContent - New content
 * @param {string} filename - Filename for diff header
 * @returns {string} Unified diff
 */
function createUnifiedDiff(oldContent, newContent, filename = "file") {
  const patch = diff.createPatch(
    filename,
    oldContent,
    newContent,
    "original",
    "modified"
  );

  return patch;
}

/**
 * Check if two strings are different
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean}
 */
function isDifferent(a, b) {
  return a !== b;
}

module.exports = {
  applyUnifiedPatch,
  previewPatch,
  createUnifiedDiff,
  isDifferent
};
