/**
 * Logger utility for VIBE SWARM
 */

function timestamp() {
  return new Date().toISOString();
}

function log(level, message) {
  console.log(`[${timestamp()}] [${level}] ${message}`);
}

function info(message) {
  log("INFO", message);
}

function warn(message) {
  log("WARN", message);
}

function error(message) {
  log("ERROR", message);
}

function debug(message) {
  log("DEBUG", message);
}

module.exports = {
  info,
  warn,
  error,
  debug
};
