const { OpenAI } = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.reason = async function (prompt) {
  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Du bist ein autonomer Code-Repair-Agent. Analysiere Python-Code und behebe ALLE Fehler. Gib immer vollständigen reparierten Code zurück, keine Erklärungen."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0
    });

    return res.choices[0].message.content;
  } catch (err) {
    console.error("OpenAI Error:", err.message);
    throw err;
  }
};
