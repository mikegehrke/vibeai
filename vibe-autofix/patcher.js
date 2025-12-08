const fs = require("fs-extra");

exports.applyPatch = async function (filepath, original, fixedCode) {
  try {
    // Simple replacement - write the fixed code directly
    if (fixedCode && fixedCode.trim().length > 0) {
      // Remove markdown code blocks if present
      let cleaned = fixedCode;
      if (cleaned.includes("```python")) {
        cleaned = cleaned.split("```python")[1].split("```")[0].trim();
      } else if (cleaned.includes("```")) {
        cleaned = cleaned.split("```")[1].split("```")[0].trim();
      }

      await fs.writeFile(filepath, cleaned, "utf-8");
      console.log(`✅ Fixed: ${filepath}`);
    }
  } catch (err) {
    console.error("Patch error:", err);
  }
};
