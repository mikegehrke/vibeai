const diff = require("diff");

/**
 * Diff utilities
 */

function createUnifiedDiff(oldStr, newStr, filename = "file") {
  return diff.createPatch(filename, oldStr, newStr, "original", "modified");
}

function createDiff(oldStr, newStr) {
  return diff.diffLines(oldStr, newStr);
}

function parseDiff(diffStr) {
  return diff.parsePatch(diffStr);
}

function applyDiff(source, patch) {
  return diff.applyPatch(source, patch);
}

function areIdentical(str1, str2) {
  return str1 === str2;
}

module.exports = {
  createUnifiedDiff,
  createDiff,
  parseDiff,
  applyDiff,
  areIdentical
};
