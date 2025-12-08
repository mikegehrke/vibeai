const ai = require("../../services/openai");
const logger = require("../../utils/logger");
const file = require("../../services/file");

/**
 * Refactor Agent
 * Cleans architecture, modernizes code, applies clean code principles
 */
module.exports = {
  /**
   * Optimize and refactor codebase
   */
  optimize: async (workspaceRoot) => {
    logger.info("✨ Refactor Agent optimizing code...");

    // Scan code files
    const files = await file.scanWorkspaceFiles(workspaceRoot);
    let codeToRefactor = "";

    for (const filepath of files.slice(0, 30)) {
      try {
        const content = await file.readFileContent(filepath);
        codeToRefactor += `\n\n// FILE: ${filepath}\n${content}`;
      } catch (error) {
        // Skip
      }
    }

    const prompt = `You are a code refactoring expert. Improve this codebase following clean code principles.

Apply these refactorings:

1. **Extract Functions**
   - Long functions → smaller focused functions
   - Duplicate code → reusable functions

2. **Improve Naming**
   - Vague names → self-documenting names
   - Abbreviations → full words
   - Generic names → specific names

3. **Reduce Complexity**
   - Deep nesting → early returns, guard clauses
   - Complex conditionals → extract to functions
   - Magic numbers → named constants

4. **Design Patterns**
   - Apply appropriate patterns (Strategy, Factory, etc.)
   - Dependency injection where needed

5. **Modern Syntax**
   - Use latest language features
   - Arrow functions, destructuring, etc.

6. **Remove Dead Code**
   - Unused variables, functions
   - Commented-out code

7. **Improve Structure**
   - Better file organization
   - Separate concerns

RULES:
- Keep same functionality
- No behavior changes
- Only improve quality

Return unified diff patch.

If NO refactoring needed, return: NO_REFACTORING_NEEDED

IMPORTANT: Return ONLY diff or NO_REFACTORING_NEEDED.`;

    try {
      const response = await ai.ask(prompt, codeToRefactor.substring(0, 50000));

      if (response.trim() === "NO_REFACTORING_NEEDED") {
        logger.info("✅ Code already clean");
        return null;
      }

      const patch = cleanPatch(response);
      logger.info("✅ Refactoring complete");
      return patch;

    } catch (error) {
      logger.error(`Refactor error: ${error.message}`);
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
