const ai = require("../../services/openai");
const logger = require("../../utils/logger");
const messageBus = require("../../utils/messageBus");

/**
 * Chief Architect Agent
 * Decides structure, frameworks, patterns, and technical decisions
 */
module.exports = {
  /**
   * Create architecture plan for task
   */
  plan: async (task, workspaceRoot) => {
    logger.info("🏗️ Chief Architect planning architecture...");

    const prompt = `You are a Chief Software Architect with 20+ years experience.

Task: ${task.title}
Description: ${task.description}

Create a complete architecture plan including:

1. **Tech Stack Decision**
   - Frameworks and libraries to use
   - Database choice
   - State management approach
   - Testing strategy

2. **Architecture Pattern**
   - Overall architecture (MVC, MVVM, Clean Architecture, etc.)
   - Folder structure
   - Module organization
   - Dependency flow

3. **Design Patterns**
   - Which patterns to apply where
   - Rationale for each choice

4. **Technical Decisions**
   - API design (REST, GraphQL, etc.)
   - Authentication strategy
   - Error handling approach
   - Logging strategy

5. **Implementation Guidelines**
   - Code organization
   - Naming conventions
   - Best practices to follow

Return a JSON object with this structure:
{
  "techStack": {
    "frontend": [],
    "backend": [],
    "database": "",
    "testing": []
  },
  "architecture": {
    "pattern": "",
    "folderStructure": {},
    "modules": []
  },
  "designPatterns": [],
  "decisions": [],
  "guidelines": []
}

IMPORTANT: Return ONLY valid JSON, no markdown.`;

    try {
      const response = await ai.ask(prompt, "");
      const plan = parseJSON(response);

      // Broadcast plan to other agents
      messageBus.emit("agent-message", {
        from: "Chief Architect",
        to: "all",
        message: "Architecture plan ready",
        data: plan
      });

      logger.info("✅ Architecture plan created");
      return plan;

    } catch (error) {
      logger.error(`Architect error: ${error.message}`);
      throw error;
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
