const ai = require("../../services/openai");
const logger = require("../../utils/logger");
const file = require("../../services/file");
const path = require("path");

/**
 * DevOps Agent
 * Creates CI/CD, Docker, deployments, infrastructure
 */
module.exports = {
  /**
   * Set up deployment pipeline
   */
  deployPipeline: async (workspaceRoot, task) => {
    logger.info("🚀 DevOps setting up pipeline...");

    // Check if CI/CD already exists
    const hasGithubActions = await file.fileExists(path.join(workspaceRoot, ".github/workflows"));
    const hasDockerfile = await file.fileExists(path.join(workspaceRoot, "Dockerfile"));

    const prompt = `You are a DevOps Engineer setting up deployment infrastructure.

Task: ${task?.title || "General deployment"}

Current state:
- GitHub Actions: ${hasGithubActions ? "exists" : "missing"}
- Dockerfile: ${hasDockerfile ? "exists" : "missing"}

Create/update:

1. **Dockerfile**
   - Multi-stage build
   - Optimized layers
   - Security best practices
   - Health checks

2. **docker-compose.yml**
   - All services
   - Environment variables
   - Networking
   - Volumes

3. **GitHub Actions CI/CD** (.github/workflows/ci.yml)
   - Run tests
   - Build Docker image
   - Push to registry
   - Deploy to staging/production

4. **.dockerignore**
   - Exclude unnecessary files

5. **Environment Config** (.env.example)
   - All required environment variables

Return unified diff patch for ALL infrastructure files.

IMPORTANT: Return ONLY unified diff.`;

    try {
      const response = await ai.ask(prompt, "");
      const patch = cleanPatch(response);

      logger.info("✅ DevOps pipeline configured");
      return patch;

    } catch (error) {
      logger.error(`DevOps error: ${error.message}`);
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
