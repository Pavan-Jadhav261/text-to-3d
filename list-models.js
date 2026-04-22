const Groq = require("groq-sdk");

async function listModels() {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const response = await client.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      messages: [{ role: "user", content: "Reply with: Groq SDK is working" }],
      max_tokens: 30,
    });

    console.log(response.choices[0]?.message?.content || "No response");
  } catch (e) {
    console.error(e);
  }
}

listModels();
