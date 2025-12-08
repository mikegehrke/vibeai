const { OpenAI } = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.generatePatch = async function (filename, code) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI code repair agent. Analyze the given Python file and fix ALL errors including: syntax errors, import errors, undefined variables, type errors. Return ONLY the COMPLETE FIXED CODE, not a diff. Preserve all functionality and comments."
        },
        {
          role: "user",
          content: `Fix all errors in this file:\n\nFilename: ${filename}\n\nCode:\n${code}`
        }
      ],
      temperature: 0
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("OpenAI Error:", err);
    return null;
  }
};
