const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function run() {
  try {
    console.log('Testing llama-3.1-8b-instant with JSON mode...');
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are a helper. Respond in JSON. Format: {"greeting": "hello"}' },
        { role: 'user', content: 'Say hello' }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });
    console.log('JSON Output:', completion.choices[0]?.message?.content);
  } catch (error) {
    console.error('Error with JSON mode:', error.message);
  }
}

run();
