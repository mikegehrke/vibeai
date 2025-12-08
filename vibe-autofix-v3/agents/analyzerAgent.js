const openaiService = require("../services/openaiService");
const logger = require("../utils/logger");

/**
 * Analyzer Agent - Deep code analysis (LSP-like)
 * Detects: logic errors, type issues, undefined variables, anti-patterns, code smells
 */
module.exports = {
  /**
   * Analyze file for all types of issues
   * @param {string} filepath - Full path to file
   * @param {string} code - File content
   * @returns {Object} Analysis result with problems, fixes, refactors
   */
  run: async (filepath, code) => {
    logger.info("🔍 Analyzer Agent analyzing...");

    const prompt = `You are an expert code analyzer. Analyze this code deeply like an LSP server.

Detect ALL of the following:
1. Import errors (missing imports, unused imports, wrong paths)
2. Syntax errors (typos, malformed code, invalid syntax)
3. Type errors (type mismatches, undefined types)
4. Undefined variables (variables used but not defined)
5. Logic errors (infinite loops, unreachable code, dead code)
6. Anti-patterns (God objects, spaghetti code, duplicate code)
7. Code smells (long functions, deep nesting, magic numbers)
8. Performance issues (unnecessary loops, N+1 queries)

Return a JSON object with this exact structure:
{
  "problems": [
    {
      "line": <line number>,
      "type": "<error|warning|info>",
      "category": "<import|syntax|type|undefined|logic|antipattern|smell|performance>",
      "message": "<description>",
      "severity": <1-10>
    }
  ],
  "requiredFixes": [
    {
      "problem": "<problem description>",
      "solution": "<how to fix>"
    }
  ],
  "recommendedRefactors": [
    {
      "issue": "<code smell or anti-pattern>",
      "improvement": "<suggested improvement>"
    }
  ],
  "summary": {
    "totalIssues": <number>,
    "critical": <number>,
    "warnings": <number>,
    "suggestions": <number>
  }
}

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation.`;

    try {
      const response = await openaiService.ask(prompt, code);

      // Parse JSON response
      let analysis;
      try {
        // Remove markdown code blocks if present
        let cleaned = response.trim();
        if (cleaned.startsWith("```json")) {
          cleaned = cleaned.replace(/^```json\s*/, "").replace(/```\s*$/, "");
        } else if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
        }

        analysis = JSON.parse(cleaned);
      } catch (parseError) {
        logger.error(`Failed to parse Analyzer response: ${parseError.message}`);
        // Return empty analysis if parsing fails
        analysis = {
          problems: [],
          requiredFixes: [],
          recommendedRefactors: [],
          summary: { totalIssues: 0, critical: 0, warnings: 0, suggestions: 0 }
        };
      }

      logger.info(`✅ Found ${analysis.problems?.length || 0} issues`);
      return analysis;

    } catch (error) {
      logger.error(`Analyzer Agent error: ${error.message}`);
      throw error;
    }
  }
};
