let logs = [];

exports.log = function (msg) {
  const timestamp = new Date().toLocaleTimeString();
  const logMsg = `[${timestamp}] ${msg}`;
  logs.push(logMsg);
  console.log("[VIBE AGENT]", msg);
};

exports.clear = function () {
  logs = [];
};

exports.getLogs = function () {
  return logs.join("\n");
};
