const ai = require("./openai");
const file = require("./file");
const logger = require("../utils/logger");
const path = require("path");

/**
 * Full Project Generator Service
 * Generates complete applications with full stack
 */

/**
 * Generate complete project
 */
async function generate(stack, workspaceRoot) {
  logger.info(`🏗️ Generating project: ${stack}`);

  const prompt = `Generate a COMPLETE project skeleton for: ${stack}

Create a production-ready project structure with:

1. **Folder Structure**
   - Organized by feature/module
   - Separate frontend, backend, shared
   - Config files in root

2. **Files**
   - Entry points (main.js, app.py, etc.)
   - Configuration (package.json, tsconfig, .env.example)
   - README.md with setup instructions
   - .gitignore
   - Docker files

3. **Frontend** (if applicable)
   - Component structure
   - Routing setup
   - State management
   - API client
   - Authentication

4. **Backend** (if applicable)
   - API routes
   - Database models
   - Authentication/authorization
   - Error handling
   - Validation

5. **Database** (if applicable)
   - Schema/migrations
   - Seed data

6. **Tests**
   - Test setup
   - Sample tests

7. **CI/CD**
   - GitHub Actions or similar
   - Docker Compose

8. **Documentation**
   - README with all instructions
   - API documentation
   - Development guide

Return a JSON object:
{
  "name": "project-name",
  "description": "Project description",
  "files": [
    {
      "path": "relative/path/to/file",
      "content": "full file content"
    }
  ]
}

IMPORTANT: Return ONLY valid JSON with COMPLETE file contents.`;

  try {
    const response = await ai.ask(prompt, "");
    const project = parseJSON(response);

    // Create all files
    for (const fileData of project.files) {
      const filePath = path.join(workspaceRoot, fileData.path);
      await file.writeFileContent(filePath, fileData.content);
      logger.info(`✅ Created: ${fileData.path}`);
    }

    logger.info(`✅ Project generated: ${project.name}`);
    return project;

  } catch (error) {
    logger.error(`Project Generator error: ${error.message}`);
    throw error;
  }
}

/**
 * Parse JSON response
 */
function parseJSON(response) {
  let cleaned = response.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/```\s*$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
  }
  return JSON.parse(cleaned);
}

module.exports = {
  generate
};
