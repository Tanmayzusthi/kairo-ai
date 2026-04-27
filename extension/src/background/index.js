// Set this to your production URL when deploying (e.g., https://kairo-ai.up.railway.app)
const PROD_URL = ''; 
const DEV_URL = 'http://localhost:3001/api/ai/process';
const API_ENDPOINT = PROD_URL || DEV_URL;


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GENERATE_AI_RESPONSE') {
    handleAIGeneration(request.payload)
      .then(data => sendResponse({ status: 'success', data }))
      .catch(error => sendResponse({ status: 'error', error: error.message }));

    return true; // Keep message channel open for async response
  }
});

async function handleAIGeneration(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selectedText:      payload.context,
        actionType:        payload.actionType,
        customInstruction: payload.customInstruction || '',
        extension_id:      chrome.runtime.id,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
}
