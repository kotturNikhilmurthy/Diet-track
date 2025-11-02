const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fetch = require('node-fetch');

(async () => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL_ID || 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Hello!'}],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Body:', text);
  } catch (err) {
    console.error('Error calling Groq:', err);
  }
})();
