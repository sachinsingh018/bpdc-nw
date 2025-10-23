import { UIMessage } from 'ai';

export const myProvider = {
  languageModel: (modelName: string) => {
    if (modelName === 'gemini-2.0-flash') {
      return {
        generate: async ({ messages }: { messages: UIMessage[] }) => {
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is not set');
          }
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

          // Map the messages into the structure expected by Gemini
          const contents = messages.map((msg) => ({
            parts: msg.parts
              .filter((part) => 'text' in part)  // Ensure the part has text
              .map((part) => ({ text: (part as { text: string }).text })), // Extract the text
          }));

          // Prepare the request body
          const requestBody = {
            contents, // Directly using the contents variable in the body
          };

          // Send the request to Gemini API
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          const data = await response.json();

          // Return the text of the first candidate from the response
          return {
            text: data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '', // Safely access the response
          };
        },
      };
    }

    throw new Error(`Model ${modelName} is not supported yet`);
  },
};
