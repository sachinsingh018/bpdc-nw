// lib/ai/gemini.ts
export async function callGeminiAPI(messages: { role: string; parts: string[] }[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: messages.map(msg => ({
      parts: msg.parts.map(text => ({ text })),
    })),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error: ${data.error.message}`);
  }

  return data.response.text;  // Assuming the API responds with `response.text`
}
