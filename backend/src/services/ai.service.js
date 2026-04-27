const axios = require('axios');
const { buildPrompt } = require('../prompt-templates.js');

// ─── Provider Implementations ─────────────────────────────────────────────────

const callNvidiaNIM = async ({ messages, maxTokens, temperature }) => {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error('NVIDIA_API_KEY is missing from environment');

  const response = await axios.post(
    'https://integrate.api.nvidia.com/v1/chat/completions',
    {
      model: 'meta/llama-3.1-405b-instruct',
      messages,
      max_tokens: maxTokens,
      temperature,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 8000,
    }
  );

  if (!response.data?.choices?.[0]?.message?.content) {
    throw new Error('Invalid response format from Nvidia NIM');
  }

  return response.data.choices[0].message.content.trim();
};

const callClaudeFallback = async ({ messages, maxTokens }) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is missing from environment');

  // Claude uses a different message shape — strip system message from array
  const systemMessage = messages.find(m => m.role === 'system')?.content ?? '';
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-3-haiku-20240307',
      max_tokens: maxTokens,
      system: systemMessage,
      messages: userMessages,
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 8000,
    }
  );

  return response.data.content[0].text.trim();
};

const callGroqFallback = async ({ messages, maxTokens, temperature }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is missing from environment');

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama3-8b-8192',
      messages,
      max_tokens: maxTokens,
      temperature,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 8000,
    }
  );

  return response.data.choices[0].message.content.trim();
};

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Builds the prompt from a template and calls providers with automatic failover.
 *
 * @param {string} actionType - e.g. 'summarize', 'explain', 'fix_grammar', 'custom', etc.
 * @param {string} text - The user's selected text
 * @param {string} [customInstruction] - Only required when actionType === 'custom'
 */
const generateResponse = async (actionType, text, customInstruction = '') => {
  const promptPayload = buildPrompt(actionType, text, customInstruction);

  try {
    console.log(`[AI Service] Primary: Nvidia NIM — action="${actionType}"`);
    return await callNvidiaNIM(promptPayload);
  } catch (error) {
    console.warn(`[Failover] Nvidia NIM failed: ${error.message}`);
  }

  try {
    console.log(`[AI Service] Fallback 1: Claude — action="${actionType}"`);
    return await callClaudeFallback(promptPayload);
  } catch (error) {
    console.warn(`[Failover] Claude failed: ${error.message}`);
  }

  try {
    console.log(`[AI Service] Fallback 2: Groq — action="${actionType}"`);
    return await callGroqFallback(promptPayload);
  } catch (error) {
    console.error(`[Failover] Groq failed: ${error.message}`);
  }

  throw new Error('All AI providers exhausted. Generation failed.');
};

module.exports = { generateResponse };
