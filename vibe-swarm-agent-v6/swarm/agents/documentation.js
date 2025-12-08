const ai = require("../../services/openai");
const logger = require("../../utils/logger");
const file = require("../../services/file");
const path = require("path");

/**
 * Documentation Agent
 * Generates README, API docs, architecture overview
 */
module.exports = {
  /**
   * Update documentation
   */
  update: async (task, results, workspaceRoot) => {
    logger.info("📝 Documentation Agent writing docs...");

    const prompt = `You are a Technical Writer creating comprehensive documentation.

Task Completed:
${JSON.stringify(task, null, 2)}

Implementation Results:
${JSON.stringify(results, null, 2)}

Update/create these documentation files:

1. **README.md**
   - Project overview
   - Features
   - Installation instructions
   - Usage examples
   - Configuration
   - Contributing guidelines

2. **API.md** (if applicable)
   - All endpoints
   - Request/response examples
   - Authentication
   - Error codes

3. **ARCHITECTURE.md**
   - System architecture
   - Tech stack
   - Design patterns used
   - Module structure
   - Data flow

4. **CHANGELOG.md**
   - Add entry for this task
   - Version bump if needed

5. **Code Comments**
   - JSDoc/docstrings for new functions
   - Complex logic explanations

Return unified diff patch for all documentation updates.

IMPORTANT: Return ONLY unified diff.`;

    try {
      const response = await ai.ask(prompt, "");
      const patch = cleanPatch(response);

      logger.info("✅ Documentation updated");
      return patch;

    } catch (error) {
      logger.error(`Documentation error: ${error.message}`);
      return null;
    }
  }
};

function cleanPatch(response) {
  let patch = response.trim();
  if (patch.startsWith("```diff")) {
    patch = patch.replace(/^```diff\s*/, "").replace(/```\s*$/, "");
  } else if (patch.startsWith("```")) {
    patch = patch.replace(/^```\s*/, "").replace(/```\s*$/, "");
  }
  return patch;
}
