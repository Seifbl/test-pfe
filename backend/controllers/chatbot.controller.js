// controllers/chatbot.controller.js
const axios = require('axios');

const respondToQuestion = async (req, res) => {
  const { question } = req.body;

  try {
    const gptResponse = await axios.post('https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Tu es un assistant pour une plateforme de mise en relation entre freelances et entreprises.' },
          { role: 'user', content: question }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const response = gptResponse.data.choices[0].message.content;
    res.json({ response });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ response: "Désolé, une erreur est survenue." });
  }
};

module.exports = { respondToQuestion };
 