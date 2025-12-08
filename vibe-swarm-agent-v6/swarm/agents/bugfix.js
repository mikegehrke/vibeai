const ai = require("../../services/openai");
const logger = require("../../utils/logger");
const file = require("../../services/file");

/**
 * Bugfix Agent
 * Detects and fixes errors autonomously
 */
module.exports = {
  /**
   * Search for bugs and fix them
   */
  searchAndFix: async (workspaceRoot) => {
    logger.info("🐛 Bugfix Agent scanning for errors...");

    // Scan all code files
    const files = await file.scanWorkspaceFiles(workspaceRoot);
    let allCode = "";

    // Read all files (limit to prevent token overflow)
    for (const filepath of files.slice(0, 50)) {
      try {
        const content = await file.readFileContent(filepath);
        allCode += `\n\n// FILE: ${filepath}\n${content}`;
      } catch (error) {
        // Skip unreadable files
      }
    }

    const prompt = `You are an expert debugger analyzing this codebase for errors.

Find and fix ALL of these types of issues:
1. **Import errors** (missing imports, wrong paths)
2. **Syntax errors** (typos, malformed code)
3. **Type errors** (type mismatches)
4. **Undefined variables** (variables used but not defined)
5. **Logic errors** (infinite loops, unreachable code, off-by-one)
6. **Runtime errors** (null pointer, array bounds)
7. **Promise errors** (unhandled promises, missing await)
8. **Async errors** (race conditions, callback hell)

Return a unified diff patch fixing ALL errors found.

If NO errors found, return: NO_BUGS_FOUND

IMPORTANT: Return ONLY unified diff or NO_BUGS_FOUND.`;

    try {
      const response = await ai.ask(prompt, allCode.substring(0, 50000)); // Limit context

      if (response.trim() === "NO_BUGS_FOUND") {
        logger.info("✅ No bugs found");
        return null;
      }

      const patch = cleanPatch(response);
      logger.info("✅ Bug fixes generated");
      return patch;

    } catch (error) {
      logger.error(`Bugfix error: ${error.message}`);
      return null; // Don't fail the whole swarm
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
