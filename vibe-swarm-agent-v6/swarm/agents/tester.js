const ai = require("../../services/openai");
const logger = require("../../utils/logger");

/**
 * Test Engineer Agent
 * Writes unit, integration, and UI tests
 */
module.exports = {
  /**
   * Generate comprehensive tests
   */
  generate: async (task, archPlan) => {
    logger.info("🧪 Test Engineer writing tests...");

    const prompt = `You are a QA/Test Engineer writing comprehensive tests.

Task:
${JSON.stringify(task, null, 2)}

Architecture:
${JSON.stringify(archPlan, null, 2)}

Write COMPLETE test suite including:

1. **Unit Tests**
   - Test each function/method
   - Test edge cases
   - Test error handling
   - Mock external dependencies

2. **Integration Tests**
   - Test components working together
   - Test API endpoints
   - Test database operations

3. **UI Tests** (if applicable)
   - Test user interactions
   - Test form validations
   - Test navigation

Test Framework:
- Use appropriate framework for tech stack
- Follow testing best practices
- Arrange-Act-Assert pattern
- Clear test names
- Good coverage

Return unified diff patch with ALL test files.

Format:
--- tests/unit/feature.test.js
+++ tests/unit/feature.test.js
@@ -0,0 +1,50 @@
+import { describe, it, expect } from 'vitest';
+...

IMPORTANT: Return ONLY unified diff.`;

    try {
      const response = await ai.ask(prompt, "");
      const patch = cleanPatch(response);

      logger.info("✅ Tests generated");
      return patch;

    } catch (error) {
      logger.error(`Tester error: ${error.message}`);
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
