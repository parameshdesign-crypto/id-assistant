export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, userText } = req.body;
  if (!userText) return res.status(400).json({ error: 'No input provided' });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: system + '\n\n' + userText }] }]
      })
    });

    const text = await response.text();
    const data = JSON.parse(text);

    if (data.error) return res.status(500).json({ error: data.error.message });

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
    res.status(200).json({ result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
