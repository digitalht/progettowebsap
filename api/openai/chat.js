export default async function handler(req, res) {
  // 🔓 CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 👋 Preflight check
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ❌ Se non è POST, blocca
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  const { message, systemPrompt } = req.body;

  const apiKey = process.env.OPENAI_API_KEY; // o scrivila direttamente

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.2
      }),
    });

    const data = await openaiRes.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Errore OpenAI:", error);
    return res.status(500).json({ error: "Errore nella chiamata OpenAI" });
  }
}
