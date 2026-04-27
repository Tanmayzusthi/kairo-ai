/**
 * prompt-templates.js
 * Kairo AI — Prompt Templates for Nemotron-3-Super-120B / Llama 3.1 405B
 *
 * Each template contains:
 *   system      — The model's persona and strict behavioral rules
 *   userPrefix  — Prepended to the user's selected text in the final prompt
 *   maxTokens   — Hard cap on output length for the action type
 *   temperature — Lower = deterministic, Higher = creative
 */

// Prompt templates for Nemotron-3-Super-120B / Llama 3.1 405B
// Each template contains:
//   system      — The model's persona and strict behavioral rules
//   userPrefix  — Prepended to the user's selected text in the final prompt
//   maxTokens   — Hard cap on output length for the action type
//   temperature — Lower = deterministic, Higher = creative

const PROMPT_TEMPLATES = {
  // SUMMARIZE
  summarize: {
    system: 'You are a concise summarizer. Output exactly 2-3 sentences. Only use information present in the input. Never add opinions or external facts.',
    userPrefix: 'Summarize this text concisely in 2-3 sentences:',
    maxTokens: 150,
    temperature: 0.3,
  },
  // EXPLAIN
  explain: {
    system: 'You are a patient teacher. Explain concepts simply, as if talking to a curious 15-year-old. Use one real-world analogy. Avoid jargon. Keep response under 150 words.',
    userPrefix: 'Explain this in simple, everyday terms with one analogy:',
    maxTokens: 300,
    temperature: 0.7,
  },
  // REWRITE
  rewrite: {
    system: 'You are a skilled editor. Rewrite the input for maximum clarity and readability. Preserve the original meaning completely. Do not add or remove ideas. Output only the rewritten text.',
    userPrefix: 'Rewrite this for better clarity and style:',
    maxTokens: 500,
    temperature: 0.5,
  },
  // REPLY
  reply: {
    system: 'You are a professional communicator. Write a clear, polite, and actionable reply. Match the tone of the input (formal or casual). Keep it under 100 words. Output only the reply text.',
    userPrefix: 'Write a professional reply to this message:',
    maxTokens: 200,
    temperature: 0.6,
  },
  // TRANSLATE
  translate: {
    system: 'You are an accurate translator. Translate the input into English. Preserve tone, idioms, and nuance. If the text is already English, return it unchanged. Output only the translated text, nothing else.',
    userPrefix: 'Translate the following text to English:',
    maxTokens: 600,
    temperature: 0.2,
  },
  // FIX_GRAMMAR
  fix_grammar: {
    system: 'You are a grammar expert. Fix all grammar, spelling, and punctuation errors in the input. Do not rephrase sentences or change the meaning. Output only the corrected text.',
    userPrefix: 'Fix the grammar and spelling in this text:',
    maxTokens: 500,
    temperature: 0.1,
  },
  // CUSTOM
  custom: {
    system: "You are a helpful AI assistant. Follow the user's instruction precisely. Be concise and factual. Refuse requests that are harmful, illegal, or unethical.",
    userPrefix: null,
    maxTokens: 600,
    temperature: 0.7,
  },
};

/**
 * Builds the final message array for the LLM API from a template.
 * @param {string} actionType - Key from PROMPT_TEMPLATES
 * @param {string} selectedText - The user's selected text
 * @param {string} [customInstruction] - Only used for the 'custom' action
 * @returns {{ messages: Array, maxTokens: number, temperature: number }}
 */
function buildPrompt(actionType, selectedText, customInstruction = '') {
  const template = PROMPT_TEMPLATES[actionType] ?? PROMPT_TEMPLATES.custom;
  const safeText = selectedText
    .replace(/---/g, '—')
    .replace(/<\|.*?\|>/g, '')
    .substring(0, 5000)
    .trim();
  let userContent;
  if (actionType === 'custom') {
    const safeInstruction = (customInstruction || 'Analyze this text')
      .replace(/<\|.*?\|>/g, '')
      .substring(0, 500)
      .trim();
    userContent = `User instruction: "${safeInstruction}"\n\nText to act on:\n"${safeText}"`;
  } else {
    userContent = `${template.userPrefix}\n\n"${safeText}"`;
  }
  return {
    messages: [
      { role: 'system', content: template.system },
      { role: 'user', content: userContent },
    ],
    maxTokens: template.maxTokens,
    temperature: template.temperature,
  };
}

module.exports = { PROMPT_TEMPLATES, buildPrompt };


  /**
   * SUMMARIZE
   * Goal: Boil down long text to its essential points. No fluff.
   */
  summarize: {
    system:
      'You are a concise summarizer. Output exactly 2-3 sentences. ' +
      'Only use information present in the input. Never add opinions or external facts.',
    userPrefix: 'Summarize this text concisely in 2-3 sentences:',
    maxTokens: 150,
    temperature: 0.3,
  },

  /**
   * EXPLAIN
   * Goal: Make technical or complex content understandable to a non-expert.
   */
  explain: {
    system:
      'You are a patient teacher. Explain concepts simply, as if talking to a curious 15-year-old. ' +
      'Use one real-world analogy. Avoid jargon. Keep response under 150 words.',
    userPrefix: 'Explain this in simple, everyday terms with one analogy:',
    maxTokens: 300,
    temperature: 0.7,
  },

  /**
   * REWRITE
   * Goal: Improve clarity, flow, and style while preserving the original meaning exactly.
   */
  rewrite: {
    system:
      'You are a skilled editor. Rewrite the input for maximum clarity and readability. ' +
      'Preserve the original meaning completely. Do not add or remove ideas. Output only the rewritten text.',
    userPrefix: 'Rewrite this for better clarity and style:',
    maxTokens: 500,
    temperature: 0.5,
  },

  /**
   * REPLY
   * Goal: Compose a professional, contextually-appropriate response to an email or message.
   */
  reply: {
    system:
      'You are a professional communicator. Write a clear, polite, and actionable reply. ' +
      'Match the tone of the input (formal or casual). Keep it under 100 words. Output only the reply text.',
    userPrefix: 'Write a professional reply to this message:',
    maxTokens: 200,
    temperature: 0.6,
  },

  /**
   * TRANSLATE
   * Goal: Accurately translate any language into English, preserving tone and meaning.
   */
  translate: {
    system:
      'You are an accurate translator. Translate the input into English. ' +
      'Preserve tone, idioms, and nuance. If the text is already English, return it unchanged. ' +
      'Output only the translated text, nothing else.',
    userPrefix: 'Translate the following text to English:',
    maxTokens: 600,
    temperature: 0.2,
  },

  /**
   * FIX_GRAMMAR
   * Goal: Correct grammar, spelling, and punctuation. Do NOT rephrase or change the content.
   */
  fix_grammar: {
    system:
      'You are a grammar expert. Fix all grammar, spelling, and punctuation errors in the input. ' +
      'Do not rephrase sentences or change the meaning. Output only the corrected text.',
    userPrefix: 'Fix the grammar and spelling in this text:',
    maxTokens: 500,
    temperature: 0.1,
  },

  /**
   * CUSTOM
   * Goal: Execute any arbitrary instruction the user provides alongside the selected text.
   * Security: The user prompt is sandwiched between strict delimiters to prevent injection.
   */
  custom: {
    system:
      'You are a helpful AI assistant. Follow the user\'s instruction precisely. ' +
      'Be concise and factual. Refuse requests that are harmful, illegal, or unethical.',
    // For custom, the caller must format the prompt as:
    // `User instruction: "${userInstruction}"\n\nText to act on:\n"${selectedText}"`
    userPrefix: null,
    maxTokens: 600,
    temperature: 0.7,
  },
};

/**
 * Builds the final message array for the LLM API from a template.
 *
 * @param {string} actionType - Key from PROMPT_TEMPLATES
 * @param {string} selectedText - The user's selected text
 * @param {string} [customInstruction] - Only used for the 'custom' action
 * @returns {{ messages: Array, maxTokens: number, temperature: number }}
 */
export function buildPrompt(actionType, selectedText, customInstruction = '') {
  const template = PROMPT_TEMPLATES[actionType] ?? PROMPT_TEMPLATES.custom;

  // Sanitize input: strip any attempts to break out of the prompt
  const safeText = selectedText
    .replace(/---/g, '—')         // Prevent YAML/markdown separator injection
    .replace(/<\|.*?\|>/g, '')    // Strip special model control tokens
    .substring(0, 5000)           // Hard length cap (mirrors backend validation)
    .trim();

  let userContent;

  if (actionType === 'custom') {
    const safeInstruction = (customInstruction || 'Analyze this text')
      .replace(/<\|.*?\|>/g, '')
      .substring(0, 500)
      .trim();
    userContent = `User instruction: "${safeInstruction}"\n\nText to act on:\n"${safeText}"`;
  } else {
    userContent = `${template.userPrefix}\n\n"${safeText}"`;
  }

  return {
    messages: [
      { role: 'system', content: template.system },
      { role: 'user',   content: userContent },
    ],
    maxTokens:   template.maxTokens,
    temperature: template.temperature,
  };
}
