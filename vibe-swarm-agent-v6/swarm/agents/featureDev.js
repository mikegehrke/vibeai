const ai = require("../../services/openai");
const logger = require("../../utils/logger");
const messageBus = require("../../utils/messageBus");

/**
 * Feature Development Agent
 * Implements complete features following architecture
 */
module.exports = {
  /**
   * Execute feature implementation
   */
  execute: async (task, archPlan) => {
    logger.info("👨‍💻 Feature Dev implementing...");

    const prompt = `You are a Senior Software Engineer implementing a new feature.

Task:
${JSON.stringify(task, null, 2)}

Architecture Plan:
${JSON.stringify(archPlan, null, 2)}

Implement the COMPLETE feature following:
1. Architecture guidelines
2. Design patterns specified
3. Code organization conventions
4. Error handling strategy
5. Best practices

Requirements:
- Write production-ready code
- Handle edge cases
- Add error handling
- Follow naming conventions
- Keep functions focused and small
- Add comments where needed

Return a unified diff patch for ALL file changes.

Format:
--- path/to/file1
+++ path/to/file1
@@ -1,3 +1,3 @@
 line 1
-old line 2
+new line 2
 line 3

--- path/to/file2
+++ path/to/file2
...

IMPORTANT: Return ONLY unified diff, no markdown, no explanation.`;

    try {
      const response = await ai.ask(prompt, "");
      const patch = cleanPatch(response);

      messageBus.emit("agent-message", {
        from: "Feature Dev",
        to: "Reviewer",
        message: "Feature implementation ready for review",
        data: { patch }
      });

      logger.info("✅ Feature implementation complete");
      return patch;

    } catch (error) {
      logger.error(`Feature Dev error: ${error.message}`);
      throw error;
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
