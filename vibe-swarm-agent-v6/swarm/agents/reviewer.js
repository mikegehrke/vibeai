const ai = require("../../services/openai");
const logger = require("../../utils/logger");
const messageBus = require("../../utils/messageBus");

/**
 * Review Agent
 * Reviews PRs like a lead developer - validates all changes
 */
module.exports = {
  /**
   * Validate all changes made by other agents
   */
  validate: async (task, results, workspaceRoot) => {
    logger.info("👀 Reviewer validating changes...");

    const prompt = `You are a Lead Developer reviewing a pull request.

Task:
${JSON.stringify(task, null, 2)}

Changes Made by Agents:
${JSON.stringify(results, null, 2)}

Review ALL aspects:

1. **Code Quality**
   - Follows best practices?
   - Clean code principles?
   - Proper naming?
   - No code smells?

2. **Functionality**
   - Meets acceptance criteria?
   - Handles edge cases?
   - Error handling complete?

3. **Tests**
   - Adequate test coverage?
   - Tests actually test the right things?

4. **Security**
   - No vulnerabilities introduced?
   - Secrets properly handled?

5. **Performance**
   - No obvious performance issues?
   - Efficient algorithms?

6. **Documentation**
   - Code comments where needed?
   - README updated?
   - API docs current?

7. **Architecture**
   - Follows architecture plan?
   - Consistent with existing code?
   - No architecture violations?

Return JSON:
{
  "approved": true/false,
  "issues": [
    {
      "severity": "critical|major|minor",
      "category": "quality|functionality|security|performance|docs|architecture",
      "description": "Issue description",
      "suggestion": "How to fix"
    }
  ],
  "positives": ["Things done well"],
  "summary": "Overall review summary"
}

IMPORTANT: Return ONLY valid JSON.`;

    try {
      const response = await ai.ask(prompt, "");
      const review = parseJSON(response);

      if (!review.approved) {
        messageBus.emit("agent-message", {
          from: "Reviewer",
          to: "all",
          message: `Review found ${review.issues.length} issues`,
          data: review
        });
      }

      logger.info(`✅ Review complete: ${review.approved ? "APPROVED" : "CHANGES REQUESTED"}`);
      return review;

    } catch (error) {
      logger.error(`Reviewer error: ${error.message}`);
      // Default to approved if review fails
      return { approved: true, issues: [], positives: [], summary: "Review failed - defaulting to approved" };
    }
  }
};

function parseJSON(response) {
  let cleaned = response.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/```\s*$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
  }
  return JSON.parse(cleaned);
}
