
const axios = require('axios');

async function generateResponse(prompt) {
  try {
    const response = await axios.post('http://localhost:4891/v1/chat/completions', {
      model: "Llama-3.2B-Instruct", // Ensure this matches the model name exactly
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.28
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response from LLM');
  }
}

module.exports = { generateResponse };
