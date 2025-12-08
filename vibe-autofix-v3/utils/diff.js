const diff = require("diff");

/**
 * Create a unified diff between two strings
 * @param {string} oldStr - Original string
 * @param {string} newStr - Modified string
 * @param {string} filename - Filename for diff header
 * @returns {string} Unified diff string
 */
function createUnifiedDiff(oldStr, newStr, filename = "file") {
  const patch = diff.createPatch(
    filename,
    oldStr,
    newStr,
    "original",
    "modified"
  );

  return patch;
}

/**
 * Create a two-column diff
 * @param {string} oldStr - Original string
 * @param {string} newStr - Modified string
 * @returns {Array} Array of diff parts
 */
function createDiff(oldStr, newStr) {
  return diff.diffLines(oldStr, newStr);
}

/**
 * Parse a unified diff
 * @param {string} diffStr - Unified diff string
 * @returns {Array} Parsed patches
 */
function parseDiff(diffStr) {
  return diff.parsePatch(diffStr);
}

/**
 * Apply a patch to a string
 * @param {string} source - Original string
 * @param {Object|string} patch - Patch object or string
 * @returns {string|false} Patched string or false if failed
 */
function applyDiff(source, patch) {
  return diff.applyPatch(source, patch);
}

/**
 * Convert diff to HTML
 * @param {Array} diffParts - Diff parts from createDiff
 * @returns {string} HTML string
 */
function diffToHtml(diffParts) {
  let html = '<div class="diff">';

  diffParts.forEach(part => {
    const color = part.added ? 'green' :
      part.removed ? 'red' : 'grey';
    const prefix = part.added ? '+ ' :
      part.removed ? '- ' : '  ';

    html += `<pre style="color: ${color}; margin: 0;">${prefix}${escapeHtml(part.value)}</pre>`;
  });

  html += '</div>';
  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Check if two strings are identical
 */
function areIdentical(str1, str2) {
  return str1 === str2;
}

/**
 * Get diff statistics
 */
function getDiffStats(diffParts) {
  let added = 0;
  let removed = 0;
  let unchanged = 0;

  diffParts.forEach(part => {
    const lines = part.value.split('\n').length - 1;
    if (part.added) {
      added += lines;
    } else if (part.removed) {
      removed += lines;
    } else {
      unchanged += lines;
    }
  });

  return { added, removed, unchanged, total: added + removed + unchanged };
}

module.exports = {
  createUnifiedDiff,
  createDiff,
  parseDiff,
  applyDiff,
  diffToHtml,
  areIdentical,
  getDiffStats
};
