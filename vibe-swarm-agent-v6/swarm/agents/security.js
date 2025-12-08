const ai = require("../../services/openai");
const logger = require("../../utils/logger");
const file = require("../../services/file");

/**
 * Security Agent
 * OWASP audits, leak detection, dependency scanning, hardening
 */
module.exports = {
  /**
   * Perform comprehensive security audit
   */
  audit: async (workspaceRoot) => {
    logger.info("🛡️ Security Agent auditing...");

    // Scan code
    const files = await file.scanWorkspaceFiles(workspaceRoot);
    let codeToAudit = "";

    for (const filepath of files.slice(0, 40)) {
      try {
        const content = await file.readFileContent(filepath);
        codeToAudit += `\n\n// FILE: ${filepath}\n${content}`;
      } catch (error) {
        // Skip
      }
    }

    const prompt = `You are a Security Expert performing OWASP-level audit.

Check for ALL security vulnerabilities:

1. **OWASP Top 10**
   - Injection (SQL, NoSQL, Command, LDAP)
   - Broken Authentication
   - Sensitive Data Exposure
   - XML External Entities (XXE)
   - Broken Access Control
   - Security Misconfiguration
   - XSS (Cross-Site Scripting)
   - Insecure Deserialization
   - Using Components with Known Vulnerabilities
   - Insufficient Logging & Monitoring

2. **Common Vulnerabilities**
   - Hardcoded credentials/secrets/API keys
   - Weak cryptography (MD5, SHA1, weak keys)
   - Missing input validation
   - Missing output sanitization
   - CSRF vulnerabilities
   - Path traversal
   - Unsafe file operations
   - Missing rate limiting
   - Information disclosure
   - Missing security headers

3. **Best Practices**
   - Use parameterized queries
   - Use bcrypt for passwords
   - Environment variables for secrets
   - HTTPS enforcement
   - CORS configuration
   - Proper error handling (no stack traces in production)

Fix ALL security issues found.

Return unified diff patch.

If NO security issues, return: NO_SECURITY_ISSUES

IMPORTANT: Return ONLY diff or NO_SECURITY_ISSUES.`;

    try {
      const response = await ai.ask(prompt, codeToAudit.substring(0, 50000));

      if (response.trim() === "NO_SECURITY_ISSUES") {
        logger.info("✅ No security issues found");
        return null;
      }

      const patch = cleanPatch(response);
      logger.info("✅ Security fixes applied");
      return patch;

    } catch (error) {
      logger.error(`Security error: ${error.message}`);
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
