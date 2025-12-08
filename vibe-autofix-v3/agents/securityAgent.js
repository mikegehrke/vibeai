const openaiService = require("../services/openaiService");
const logger = require("../utils/logger");

/**
 * Security Agent - Vulnerability detection & patching
 * Detects and fixes security issues, unsafe patterns, and vulnerabilities
 */
module.exports = {
  /**
   * Perform security audit and fix vulnerabilities
   * @param {string} filepath - Full path to file
   * @param {Object} refactored - Refactor result from Refactor Agent
   * @param {string} code - Original file content
   * @returns {Object} Security result with patch
   */
  run: async (filepath, refactored, code) => {
    logger.info("🛡️  Security Agent auditing...");

    const prompt = `You are an expert security auditor. Perform a comprehensive security audit of this code.

SECURITY CHECKS:
1. SQL Injection vulnerabilities (use parameterized queries)
2. XSS (Cross-Site Scripting) vulnerabilities (sanitize user input)
3. CSRF (Cross-Site Request Forgery) protection
4. Authentication/Authorization issues
5. Insecure data storage (passwords, API keys, secrets)
6. Unsafe deserialization
7. Path traversal vulnerabilities
8. Command injection vulnerabilities
9. Hardcoded credentials or secrets
10. Insecure cryptography (weak algorithms, hardcoded keys)
11. Unsafe file operations
12. Missing input validation
13. Information disclosure (error messages, debug info)
14. Insufficient logging/monitoring
15. Dependency vulnerabilities

SECURITY FIXES:
- Add input validation and sanitization
- Use parameterized queries instead of string concatenation
- Implement proper authentication and authorization
- Use secure cryptography (bcrypt for passwords, not MD5/SHA1)
- Remove hardcoded secrets (use environment variables)
- Add CSRF tokens
- Sanitize all user input before output
- Use safe deserialization
- Validate file paths
- Add rate limiting where appropriate
- Implement proper error handling (don't leak stack traces)

Return a unified diff patch (like git diff) that fixes all security issues.
The patch must be in this exact format:

--- original
+++ secured
@@ -1,3 +1,3 @@
 line 1
-old line 2
+new line 2
 line 3

If NO security issues found, return:
NO_SECURITY_ISSUES

IMPORTANT: Return ONLY the unified diff patch or NO_SECURITY_ISSUES, no explanation, no markdown.`;

    try {
      const response = await openaiService.ask(prompt, code);

      // Check for "no issues" response
      if (response.trim() === "NO_SECURITY_ISSUES") {
        logger.info("✅ No security issues found");
        return { patch: null, secured: true, issues: [] };
      }

      // Clean markdown code blocks if present
      let patch = response.trim();
      if (patch.startsWith("```diff")) {
        patch = patch.replace(/^```diff\s*/, "").replace(/```\s*$/, "");
      } else if (patch.startsWith("```")) {
        patch = patch.replace(/^```\s*/, "").replace(/```\s*$/, "");
      }

      // Validate patch format
      const isPatch = patch.includes("---") && patch.includes("+++") && patch.includes("@@");

      if (!isPatch) {
        logger.warn("Security Agent did not return valid patch");
        return { patch: null, secured: false };
      }

      logger.info("✅ Security fixes generated");
      return { patch, secured: true };

    } catch (error) {
      logger.error(`Security Agent error: ${error.message}`);
      throw error;
    }
  }
};
