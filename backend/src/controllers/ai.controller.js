const aiService = require('../services/ai.service');

// Valid action types matching prompt-templates.js
const VALID_ACTIONS = new Set([
  'summarize',
  'explain',
  'rewrite',
  'reply',
  'translate',
  'fix_grammar',
  'custom',
]);

const processRequest = async (req, res) => {
  try {
    const { actionType, selectedText, customInstruction, extension_id } = req.body;

    // ── Input validation ───────────────────────────────────────────────────
    if (!selectedText || typeof selectedText !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: 'Missing required field: selectedText',
      });
    }

    if (selectedText.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        error: 'selectedText cannot be empty.',
      });
    }

    if (selectedText.length > 5000) {
      return res.status(400).json({
        status: 'error',
        error: 'Text exceeds 5000 character limit.',
      });
    }

    const action = actionType && VALID_ACTIONS.has(actionType) ? actionType : 'summarize';

    // Validate custom instruction length
    if (action === 'custom' && customInstruction && customInstruction.length > 500) {
      return res.status(400).json({
        status: 'error',
        error: 'Custom instruction exceeds 500 character limit.',
      });
    }

    // ── Generate ───────────────────────────────────────────────────────────
    const result = await aiService.generateResponse(
      action,
      selectedText,
      customInstruction || ''
    );

    return res.json({
      status: 'success',
      data: {
        result,
        action,
      },
    });

  } catch (error) {
    console.error('[AI Controller Error]', error.message);
    return res.status(503).json({
      status: 'error',
      error: 'AI service currently unavailable. Please try again later.',
    });
  }
};

module.exports = { processRequest };
