/**
 * Simple logger utility for VIBE Auto-Fix Agent
 */

const LOG_LEVELS = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  DEBUG: "DEBUG"
};

/**
 * Format timestamp
 */
function timestamp() {
  return new Date().toISOString();
}

/**
 * Log with specific level
 */
function log(level, message) {
  const prefix = `[${timestamp()}] [${level}]`;
  console.log(`${prefix} ${message}`);
}

/**
 * Info level log
 */
function info(message) {
  log(LOG_LEVELS.INFO, message);
}

/**
 * Warning level log
 */
function warn(message) {
  log(LOG_LEVELS.WARN, message);
}

/**
 * Error level log
 */
function error(message) {
  log(LOG_LEVELS.ERROR, message);
}

/**
 * Debug level log
 */
function debug(message) {
  log(LOG_LEVELS.DEBUG, message);
}

module.exports = {
  info,
  warn,
  error,
  debug
};
