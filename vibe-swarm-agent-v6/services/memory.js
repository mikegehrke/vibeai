const fs = require("fs-extra");
const path = require("path");
const logger = require("../utils/logger");

const MEMORY_DIR = ".vibe-memory";
const MEMORY_FILE = "project.json";

/**
 * Project memory service - stores swarm's knowledge about the project
 */

/**
 * Load project memory
 */
async function loadProject(workspaceRoot) {
  const memoryPath = path.join(workspaceRoot, MEMORY_DIR, MEMORY_FILE);

  try {
    if (await fs.pathExists(memoryPath)) {
      const data = await fs.readFile(memoryPath, "utf8");
      const memory = JSON.parse(data);
      logger.info("✅ Project memory loaded");
      return memory;
    } else {
      // Create initial memory
      const initial = createInitialMemory();
      await saveProjectMemory(workspaceRoot, initial);
      return initial;
    }
  } catch (error) {
    logger.error(`Memory load error: ${error.message}`);
    return createInitialMemory();
  }
}

/**
 * Get current project state
 */
async function getProjectState(workspaceRoot) {
  const memory = await loadProject(workspaceRoot);
  return memory;
}

/**
 * Save project memory
 */
async function saveProjectMemory(workspaceRoot, data) {
  const memoryDir = path.join(workspaceRoot, MEMORY_DIR);
  const memoryPath = path.join(memoryDir, MEMORY_FILE);

  try {
    await fs.ensureDir(memoryDir);
    await fs.writeFile(memoryPath, JSON.stringify(data, null, 2), "utf8");
    logger.info("✅ Project memory saved");
  } catch (error) {
    logger.error(`Memory save error: ${error.message}`);
  }
}

/**
 * Save current task
 */
async function saveCurrentTask(task) {
  // Task is saved within project memory during task completion
  logger.info(`Current task: ${task.title}`);
}

/**
 * Save task completion
 */
async function saveTaskCompletion(task, results) {
  // This would append to project history
  logger.info(`Task completed: ${task.title}`);
}

/**
 * Create initial memory structure
 */
function createInitialMemory() {
  return {
    version: "1.0.0",
    created: new Date().toISOString(),
    projectName: "",
    techStack: {
      frontend: [],
      backend: [],
      database: "",
      tools: []
    },
    architecture: {
      pattern: "",
      modules: []
    },
    completedTasks: [],
    pendingTasks: [
      {
        title: "Initialize project structure",
        description: "Set up basic project scaffolding",
        priority: "high",
        type: "setup"
      }
    ],
    decisions: [],
    knownIssues: [],
    dependencies: []
  };
}

module.exports = {
  loadProject,
  getProjectState,
  saveProjectMemory,
  saveCurrentTask,
  saveTaskCompletion
};
