const fs = require("fs-extra");
const diff = require("diff");

exports.applyPatch = async function (filepath, original, patchText) {
  try {
    const patch = diff.parsePatch(patchText)[0];
    if (!patch) {
      console.log("No valid patch found");
      return false;
    }

    const updated = diff.applyPatch(original, patch);
    if (!updated) {
      console.log("Patch could not be applied");
      return false;
    }

    await fs.writeFile(filepath, updated, "utf-8");
    return true;
  } catch (err) {
    console.error("Patch error:", err);
    return false;
  }
};
