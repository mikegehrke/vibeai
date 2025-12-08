const { OpenAI } = require("openai");
const vscode = require("vscode");
const logger = require("../utils/logger");

let client = null;

/**
 * Get or create OpenAI client
 */
function getClient() {
  if (!client) {
    const config = vscode.workspace.getConfiguration("vibe.swarm");
    const apiKey = config.get("openaiApiKey");

    if (!apiKey) {
      throw new Error("OpenAI API key not set. Configure vibe.swarm.openaiApiKey");
    }

    client = new OpenAI({ apiKey });
    logger.info("✅ OpenAI client initialized");
  }

  return client;
}

/**
 * Get configured model
 */
function getModel() {
  const config = vscode.workspace.getConfiguration("vibe.swarm");
  return config.get("model") || "gpt-4o";
}

/**
 * Ask OpenAI a question
 */
async function ask(instruction, code = "") {
  const openai = getClient();
  const model = getModel();

  logger.info(`Calling OpenAI ${model}...`);

  try {
    const messages = [
      { role: "system", content: instruction }
    ];

    if (code) {
      messages.push({ role: "user", content: code });
    }

    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0,
      max_tokens: 4096
    });

    const content = response.choices[0].message.content;
    logger.info(`✅ OpenAI response (${content.length} chars)`);

    return content;

  } catch (error) {
    logger.error(`OpenAI error: ${error.message}`);

    if (error.code === "insufficient_quota") {
      throw new Error("OpenAI quota exceeded");
    } else if (error.code === "invalid_api_key") {
      throw new Error("Invalid OpenAI API key");
    } else if (error.status === 429) {
      throw new Error("Rate limit exceeded");
    }

    throw error;
  }
}

module.exports = {
  ask,
  getClient,
  getModel
};
