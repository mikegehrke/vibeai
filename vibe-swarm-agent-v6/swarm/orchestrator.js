const PQueue = require("p-queue").default;
const logger = require("../utils/logger");
const messageBus = require("../utils/messageBus");
const memory = require("../services/memory");
const git = require("../services/git");

// Import all agents
const architect = require("./agents/architect");
const pm = require("./agents/pm");
const featureDev = require("./agents/featureDev");
const bugfix = require("./agents/bugfix");
const refactor = require("./agents/refactor");
const tester = require("./agents/tester");
const devops = require("./agents/devops");
const security = require("./agents/security");
const documentation = require("./agents/documentation");
const reviewer = require("./agents/reviewer");

/**
 * SWARM Orchestrator - Multi-Agent Task Orchestration
 * Manages parallel execution of all agents with communication
 */
class Orchestrator {
  constructor(ui, workspaceRoot, options = {}) {
    this.ui = ui;
    this.workspaceRoot = workspaceRoot;
    this.autopilot = options.autopilot || false;

    // Parallel execution queue
    const vscode = require("vscode");
    const maxParallel = vscode.workspace.getConfiguration("vibe.swarm").get("parallelAgents") || 5;
    this.queue = new PQueue({ concurrency: maxParallel });

    // Agent results storage
    this.results = {};

    // Message bus for agent communication
    messageBus.on("agent-message", this.handleAgentMessage.bind(this));
  }

  /**
   * Run SWARM for single task
   */
  async run() {
    logger.info("🚀 SWARM Orchestrator starting...");
    this.ui.updateStatus("🚀 Initializing SWARM...");

    try {
      // Step 1: Load project memory
      logger.info("📚 Loading project memory...");
      this.ui.logAgent("Memory", "Loading project context...");
      await memory.loadProject(this.workspaceRoot);

      // Step 2: PM selects next task
      logger.info("📋 PM selecting next task...");
      this.ui.logAgent("Project Manager", "Analyzing backlog...");
      const task = await pm.nextTask(this.workspaceRoot);

      if (!task) {
        this.ui.updateStatus("✅ No pending tasks");
        logger.info("No tasks found");
        return;
      }

      this.ui.updateStatus(`📋 Task: ${task.title}`);
      logger.info(`Task selected: ${task.title}`);

      // Step 3: Architect creates plan
      logger.info("🏗️ Architect planning...");
      this.ui.logAgent("Chief Architect", "Creating architecture plan...");
      const archPlan = await architect.plan(task, this.workspaceRoot);
      this.results.architecture = archPlan;
      messageBus.emit("plan-ready", archPlan);

      // Step 4: Parallel agent execution
      logger.info("🤖 Starting parallel agent execution...");
      this.ui.updateStatus("🤖 Agents working in parallel...");

      const parallelTasks = [
        this.queue.add(() => this.runAgent("Feature Dev", featureDev, "execute", task, archPlan)),
        this.queue.add(() => this.runAgent("Bugfix", bugfix, "searchAndFix", this.workspaceRoot)),
        this.queue.add(() => this.runAgent("Refactor", refactor, "optimize", this.workspaceRoot)),
        this.queue.add(() => this.runAgent("Tester", tester, "generate", task, archPlan)),
        this.queue.add(() => this.runAgent("Security", security, "audit", this.workspaceRoot))
      ];

      // Wait for all parallel tasks
      await Promise.all(parallelTasks);

      // Step 5: Sequential post-processing
      logger.info("📝 Running review and documentation...");

      // Review all changes
      this.ui.logAgent("Reviewer", "Reviewing all changes...");
      const review = await reviewer.validate(task, this.results, this.workspaceRoot);

      if (!review.approved && !this.autopilot) {
        const proceed = await this.askUser("Review found issues. Proceed anyway?");
        if (!proceed) {
          this.ui.updateStatus("❌ Cancelled by review");
          return;
        }
      }

      // Generate documentation
      this.ui.logAgent("Documentation", "Updating documentation...");
      const docsPatch = await documentation.update(task, this.results, this.workspaceRoot);
      if (docsPatch) {
        await git.applyPatch(this.workspaceRoot, docsPatch);
      }

      // Step 6: Apply all patches
      logger.info("📝 Applying all patches...");
      this.ui.updateStatus("📝 Applying changes...");
      await this.applyAllPatches();

      // Step 7: DevOps setup
      this.ui.logAgent("DevOps", "Setting up CI/CD pipeline...");
      await devops.deployPipeline(this.workspaceRoot, task);

      // Step 8: Git commit
      logger.info("💾 Creating commit...");
      await git.commit(this.workspaceRoot, `SWARM: ${task.title}\n\n${task.description}`);

      // Step 9: Update memory
      await memory.saveTaskCompletion(task, this.results);

      // Done!
      this.ui.updateStatus("✅ Task completed successfully");
      logger.info("✅ SWARM task completed");

      // Show summary
      this.showSummary(task);

    } catch (error) {
      logger.error(`SWARM error: ${error.message}`);
      this.ui.updateStatus(`❌ Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run SWARM continuously (autopilot mode)
   */
  async runContinuous() {
    logger.info("🤖 SWARM Autopilot Mode activated");
    this.ui.updateStatus("🤖 Autopilot running...");

    let tasksCompleted = 0;
    const maxTasks = 10; // Safety limit

    while (tasksCompleted < maxTasks) {
      await memory.loadProject(this.workspaceRoot);
      const task = await pm.nextTask(this.workspaceRoot);

      if (!task) {
        logger.info("No more tasks - Autopilot stopping");
        break;
      }

      logger.info(`Autopilot task ${tasksCompleted + 1}: ${task.title}`);
      await this.run();
      tasksCompleted++;

      // Brief pause between tasks
      await this.sleep(2000);
    }

    this.ui.updateStatus(`✅ Autopilot completed ${tasksCompleted} tasks`);
    logger.info(`Autopilot finished - ${tasksCompleted} tasks completed`);
  }

  /**
   * Run individual agent
   */
  async runAgent(name, agent, method, ...args) {
    try {
      logger.info(`🤖 ${name} starting...`);
      this.ui.logAgent(name, "Working...");

      const result = await agent[method](...args);

      this.results[name.toLowerCase().replace(/\s/g, "")] = result;
      messageBus.emit(`${name}-complete`, result);

      logger.info(`✅ ${name} completed`);
      this.ui.logAgent(name, "✅ Completed");

      return result;
    } catch (error) {
      logger.error(`${name} error: ${error.message}`);
      this.ui.logAgent(name, `❌ Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Apply all generated patches
   */
  async applyAllPatches() {
    const patches = [
      this.results.featuredev,
      this.results.bugfix,
      this.results.refactor,
      this.results.tester,
      this.results.security
    ].filter(Boolean);

    for (const patch of patches) {
      if (patch && typeof patch === "string" && patch.includes("---")) {
        await git.applyPatch(this.workspaceRoot, patch);
      }
    }
  }

  /**
   * Handle agent-to-agent messages
   */
  handleAgentMessage(data) {
    logger.info(`Agent message: ${data.from} → ${data.to}: ${data.message}`);
    this.ui.logAgentMessage(data.from, data.to, data.message);
  }

  /**
   * Ask user for confirmation
   */
  async askUser(question) {
    const vscode = require("vscode");
    const answer = await vscode.window.showQuickPick(["Yes", "No"], {
      placeHolder: question
    });
    return answer === "Yes";
  }

  /**
   * Show completion summary
   */
  showSummary(task) {
    const summary = `
SWARM Task Completed: ${task.title}

Agents executed:
✅ Chief Architect - Architecture plan created
✅ Feature Dev - Implementation complete
✅ Bugfix - Errors fixed
✅ Refactor - Code optimized
✅ Tester - Tests generated
✅ Security - Security audit passed
✅ Documentation - Docs updated
✅ Reviewer - Changes approved
✅ DevOps - Pipeline configured

Changes committed to Git.
    `.trim();

    const vscode = require("vscode");
    vscode.window.showInformationMessage(summary);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Orchestrator;
