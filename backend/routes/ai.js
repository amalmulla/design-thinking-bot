const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const CEREBRAS_URL = 'https://api.cerebras.ai/v1/chat/completions';

// POST /api/ai/chat — server-side proxy to Cerebras. The frontend sends the fully
// formed messages array; the API key stays here on the server and is never exposed.
router.post('/chat', requireAuth, async (req, res) => {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    // No key configured — signal the client so it can use its simulated fallback.
    return res.status(503).json({ message: 'AI is not configured on the server.' });
  }

  const { messages, model, temperature } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'messages must be a non-empty array.' });
  }

  try {
    const upstream = await fetch(CEREBRAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'gpt-oss-120b',
        messages,
        temperature: typeof temperature === 'number' ? temperature : 0.7
      })
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('Cerebras API error:', upstream.status, errText);
      return res.status(502).json({ message: 'Upstream AI request failed.' });
    }

    const data = await upstream.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ message: 'Invalid response from AI provider.' });
    }

    res.status(200).json({ content });
  } catch (error) {
    console.error('AI proxy error:', error.message);
    res.status(502).json({ message: 'AI request failed.' });
  }
});

module.exports = router;
