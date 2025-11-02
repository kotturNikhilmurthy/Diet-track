const fetch = require('node-fetch');
const { validationResult } = require('express-validator');

const buildPromptFromMessages = (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return '';
  }

  const formatted = messages
    .map((message) => {
      const roleLabel = message.role === 'assistant' ? 'Assistant' : 'User';
      return `${roleLabel}: ${message.content}`;
    })
    .join('\n');

  return `${formatted}\nAssistant:`;
};

const callHuggingFace = async ({ prompt, systemPrompt, apiKey, modelId }) => {
  const apiUrl = `https://api-inference.huggingface.co/models/${modelId}`;
  const combinedPrompt = systemPrompt ? `${systemPrompt.trim()}\n\n${prompt}` : prompt;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      inputs: combinedPrompt,
      parameters: {
        max_new_tokens: 250,
        temperature: 0.7,
        return_full_text: false,
      },
      options: {
        wait_for_model: true,
      },
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    let friendlyMessage = 'The assistant service returned an unexpected response.';

    try {
      const errorPayload = JSON.parse(rawText);
      if (response.status === 401) {
        friendlyMessage = 'Assistant credentials were rejected. Refresh the Hugging Face API key.';
      } else if (errorPayload?.error) {
        friendlyMessage = errorPayload.error;
      }
    } catch (parseError) {
      console.error('Hugging Face error (unparsed):', rawText);
    }

    return { error: friendlyMessage, status: response.status };
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (parseErr) {
    console.error('Unexpected Hugging Face payload:', rawText);
    return { error: 'The assistant service returned malformed data.', status: 502 };
  }

  const generatedText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;

  if (!generatedText) {
    return { error: 'No response generated.', status: 502 };
  }

  return { reply: generatedText.trim() };
};

const callGroq = async ({ prompt, systemPrompt, apiKey, messages }) => {
  const groqMessages = [];

  if (systemPrompt) {
    groqMessages.push({ role: 'system', content: systemPrompt });
  }

  if (Array.isArray(messages) && messages.length > 0) {
    groqMessages.push(
      ...messages.map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
      }))
    );
  } else {
    groqMessages.push({ role: 'user', content: prompt });
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL_ID || 'llama-3.3-70b-versatile',
      messages: groqMessages,
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    let friendlyMessage = 'The assistant service returned an unexpected response.';

    try {
      const errorPayload = JSON.parse(rawText);
      if (errorPayload?.error?.message) {
        friendlyMessage = errorPayload.error.message;
      }
    } catch (parseError) {
      console.error('Groq error (unparsed):', rawText);
    }

    if (response.status === 401 || response.status === 403) {
      friendlyMessage = 'Assistant credentials were rejected. Update the Groq API key.';
    }

    return { error: friendlyMessage, status: response.status };
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (parseErr) {
    console.error('Unexpected Groq payload:', rawText);
    return { error: 'The assistant service returned malformed data.', status: 502 };
  }

  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) {
    return { error: 'No response generated.', status: 502 };
  }

  return { reply: reply.trim() };
};

exports.createChatCompletion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { prompt, messages, systemPrompt } = req.body;

  const effectivePrompt = prompt || buildPromptFromMessages(messages);
  if (!effectivePrompt) {
    return res.status(400).json({ message: 'Prompt cannot be empty.' });
  }

  try {
    if (process.env.GROQ_API_KEY) {
      const result = await callGroq({
        prompt: effectivePrompt,
        systemPrompt,
        apiKey: process.env.GROQ_API_KEY,
        messages,
      });

      if (result.error) {
        return res.status(result.status || 502).json({ message: result.error });
      }

      return res.json({ reply: result.reply });
    }

    if (!process.env.HUGGINGFACE_API_KEY) {
      return res.status(503).json({ message: 'Chat assistant is currently unavailable.' });
    }

    const result = await callHuggingFace({
      prompt: effectivePrompt,
      systemPrompt,
      apiKey: process.env.HUGGINGFACE_API_KEY,
      modelId: process.env.HUGGINGFACE_MODEL_ID || 'tiiuae/falcon-7b-instruct',
    });

    if (result.error) {
      return res.status(result.status || 502).json({ message: result.error });
    }

    return res.json({ reply: result.reply });
  } catch (error) {
    console.error('Chat completion error:', error);
    return res.status(500).json({ message: 'Something went wrong while contacting the assistant.' });
  }
};
