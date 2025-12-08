const { OpenAI } = require("openai");
const vscode = require("vscode");
const logger = require("../utils/logger");

let client = null;

/**
 * Initialize OpenAI client with API key from VS Code settings
 */
function getClient() {
  if (!client) {
    const config = vscode.workspace.getConfiguration("vibe");
    const apiKey = config.get("openaiApiKey");

    if (!apiKey) {
      throw new Error("OpenAI API key not configured. Set vibe.openaiApiKey in VS Code settings.");
    }

    client = new OpenAI({ apiKey });
    logger.info("✅ OpenAI client initialized");
  }

  return client;
}

/**
 * Get configured model from VS Code settings
 */
function getModel() {
  const config = vscode.workspace.getConfiguration("vibe");
  return config.get("model") || "gpt-4o";
}

/**
 * Send a prompt to OpenAI and get response
 * @param {string} instruction - System instruction/prompt
 * @param {string} code - User code to analyze
 * @returns {Promise<string>} AI response
 */
async function ask(instruction, code) {
  const openai = getClient();
  const model = getModel();

  logger.info(`Calling OpenAI ${model}...`);

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: instruction },
        { role: "user", content: code }
      ],
      temperature: 0,
      max_tokens: 4096
    });

    const content = response.choices[0].message.content;
    logger.info(`✅ OpenAI response received (${content.length} chars)`);

    return content;

  } catch (error) {
    logger.error(`OpenAI API error: ${error.message}`);

    // Handle specific error types
    if (error.code === "insufficient_quota") {
      throw new Error("OpenAI quota exceeded. Please check your API key billing.");
    } else if (error.code === "invalid_api_key") {
      throw new Error("Invalid OpenAI API key. Please check vibe.openaiApiKey setting.");
    } else if (error.status === 429) {
      throw new Error("Rate limit exceeded. Please wait and try again.");
    }

    throw error;
  }
}

module.exports = {
  ask,
  getClient,
  getModel
};
