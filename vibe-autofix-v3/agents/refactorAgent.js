const openaiService = require("../services/openaiService");
const logger = require("../utils/logger");

/**
 * Refactor Agent - Code improvement & clean code
 * Improves code quality, structure, and readability
 */
module.exports = {
  /**
   * Refactor code following clean code principles
   * @param {string} filepath - Full path to file
   * @param {Object} fixes - Fix result from Fix Agent
   * @param {string} code - Original file content
   * @returns {Object} Refactor result with patch
   */
  run: async (filepath, fixes, code) => {
    logger.info("✨ Refactor Agent refactoring...");

    const prompt = `You are an expert code refactorer. Improve this code following clean code principles.

REFACTORING TASKS:
1. Improve naming (variables, functions, classes) - make them self-documenting
2. Extract long functions into smaller, focused functions
3. Reduce nesting depth (early returns, guard clauses)
4. Remove code duplication (DRY principle)
5. Improve code structure and organization
6. Add missing documentation/comments where needed
7. Simplify complex conditionals
8. Remove magic numbers (use named constants)
9. Improve error handling
10. Follow language-specific best practices

RULES:
- Keep the same functionality - do NOT change behavior
- Only improve structure, naming, and readability
- Do NOT add new features
- Do NOT remove existing features
- Preserve all existing functionality

Return a unified diff patch (like git diff) that can be applied to the original file.
The patch must be in this exact format:

--- original
+++ refactored
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
        logger.warn("Refactor Agent did not return valid patch");
        return { patch: null, refactored: false };
      }

      logger.info("✅ Refactoring complete");
      return { patch, refactored: true };

    } catch (error) {
      logger.error(`Refactor Agent error: ${error.message}`);
      throw error;
    }
  }
};
