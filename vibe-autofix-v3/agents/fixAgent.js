const openaiService = require("../services/openaiService");
const logger = require("../utils/logger");

/**
 * Fix Agent - Automatic error fixing
 * Fixes all problems found by Analyzer Agent
 */
module.exports = {
  /**
   * Generate fixes for all problems
   * @param {string} filepath - Full path to file
   * @param {Object} analysis - Analysis result from Analyzer Agent
   * @param {string} code - Original file content
   * @returns {Object} Fix result with patch
   */
  run: async (filepath, analysis, code) => {
    logger.info("🛠️  Fix Agent fixing...");

    if (!analysis.problems || analysis.problems.length === 0) {
      logger.info("ℹ️  No problems to fix");
      return { patch: null, fixed: false };
    }

    // Build problem summary for AI
    const problemSummary = analysis.problems.map(p =>
      `Line ${p.line}: [${p.category}] ${p.message}`
    ).join("\n");

    const prompt = `You are an expert code fixer. Fix ALL problems in this code.

Problems found by analyzer:
${problemSummary}

Required fixes:
${JSON.stringify(analysis.requiredFixes, null, 2)}

INSTRUCTIONS:
1. Fix ALL import errors (add missing imports, remove unused, fix paths)
2. Fix ALL syntax errors (correct typos, fix malformed code)
3. Fix ALL type errors (add type annotations, fix type mismatches)
4. Fix ALL undefined variables (define them properly)
5. Fix ALL logic errors (remove dead code, fix infinite loops)
6. Keep the same functionality - only fix errors
7. Do NOT refactor yet - that's the next agent's job

Return a unified diff patch (like git diff) that can be applied to the original file.
The patch must be in this exact format:

--- original
+++ fixed
@@ -1,3 +1,3 @@
 line 1
-old line 2
+new line 2
 line 3

IMPORTANT: Return ONLY the unified diff patch, no explanation, no markdown.`;

    try {
      const response = await openaiService.ask(prompt, code);

      // Clean markdown code blocks if present
      let patch = response.trim();
      if (patch.startsWith("```diff")) {
        patch = patch.replace(/^```diff\s*/, "").replace(/```\s*$/, "");
      } else if (patch.startsWith("```")) {
        patch = patch.replace(/^```\s*/, "").replace(/```\s*$/, "");
      }

      // Validate patch format
      const isPatch = patch.includes("---") && patch.includes("+++") && patch.includes("@@");

      if (!isPatch) {
        logger.warn("Fix Agent did not return valid patch");
        return { patch: null, fixed: false };
      }

      logger.info("✅ Fixes generated");
      return { patch, fixed: true };

    } catch (error) {
      logger.error(`Fix Agent error: ${error.message}`);
      throw error;
    }
  }
};
