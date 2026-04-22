const Groq = require("groq-sdk");

async function testGroq() {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const completion = await client.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: "Explain the importance of fast language models",
        },
      ],
    });

    console.log(completion.choices[0]?.message?.content || "");
  } catch (error) {
    console.error("Groq Error:", error);
  }
}

testGroq();
