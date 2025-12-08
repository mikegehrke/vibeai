const ai = require("../../services/openai");
const logger = require("../../utils/logger");
const memory = require("../../services/memory");
const messageBus = require("../../utils/messageBus");

/**
 * Project Manager Agent
 * Creates roadmap, tickets, prioritization, and task management
 */
module.exports = {
  /**
   * Select next best task from backlog
   */
  nextTask: async (workspaceRoot) => {
    logger.info("📋 PM analyzing backlog...");

    const projectMemory = await memory.getProjectState(workspaceRoot);

    const prompt = `You are an experienced Technical Project Manager.

Project Context:
${JSON.stringify(projectMemory, null, 2)}

Analyze the project and select the NEXT BEST task to work on.

Consider:
1. Dependencies (what needs to be done first)
2. Priority (business value vs effort)
3. Risk (reduce technical risk early)
4. Team capacity (what can be parallelized)
5. Incomplete features (finish before starting new)

Return a JSON object:
{
  "title": "Task title",
  "description": "Detailed description",
  "type": "feature|bugfix|refactor|test|docs",
  "priority": "critical|high|medium|low",
  "estimatedEffort": "small|medium|large",
  "dependencies": [],
  "filesToCreate": [],
  "filesToModify": [],
  "acceptanceCriteria": []
}

If NO tasks remain, return: NO_TASKS

IMPORTANT: Return ONLY valid JSON or NO_TASKS.`;

    try {
      const response = await ai.ask(prompt, "");

      if (response.trim() === "NO_TASKS") {
        logger.info("No pending tasks");
        return null;
      }

      const task = parseJSON(response);

      // Save task to memory
      await memory.saveCurrentTask(task);

      messageBus.emit("agent-message", {
        from: "Project Manager",
        to: "all",
        message: `New task assigned: ${task.title}`,
        data: task
      });

      logger.info(`✅ Task selected: ${task.title}`);
      return task;

    } catch (error) {
      logger.error(`PM error: ${error.message}`);
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
