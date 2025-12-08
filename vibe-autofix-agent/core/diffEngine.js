const diff = require("diff");

exports.createDiff = function (original, updated) {
  return diff.createPatch("file", original, updated);
};

exports.applyDiff = function (original, diffText) {
  const patches = diff.parsePatch(diffText);
  if (patches.length === 0) return null;

  return diff.applyPatch(original, patches[0]);
};
