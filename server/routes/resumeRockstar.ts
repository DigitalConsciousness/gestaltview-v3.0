// server/routes/resumeRockstar.ts
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
      temperature: 0.4,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const json = await res.json();
  return json.choices[0].message.content.trim();
}

async function callHuggingFace(prompt: string): Promise<string> {
  const res = await fetch(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 512 } }),
    }
  );
  if (!res.ok) throw new Error(`HF ${res.status}`);
  const json = await res.json();
  return (json[0]?.generated_text ?? "").replace(prompt, "").trim();
}
