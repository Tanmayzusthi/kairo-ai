require('dotenv').config();
const axios = require('axios');

async function verifySetup() {
  console.log('🔍 Starting Kairo AI Verification...\n');

  // 1. Check Env
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey || apiKey === 'your_nvidia_api_key_here') {
    console.error('❌ ERROR: NVIDIA_API_KEY is missing or still set to placeholder in .env');
    process.exit(1);
  }
  console.log('✅ Environment: .env loaded successfully.');

  // 2. Check Connection to Nvidia
  try {
    console.log('📡 Testing connection to Nvidia NIM...');
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: 'meta/llama-3.1-405b-instruct',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 5000,
      }
    );
    console.log('✅ API: Successfully connected to Nvidia NIM.');
  } catch (error) {
    console.error('❌ ERROR: Failed to connect to Nvidia. Check your API key.');
    console.error(`   Message: ${error.message}`);
    process.exit(1);
  }

  // 3. Final Check
  console.log('\n🚀 All systems go! Run "npm start" to launch the backend.');
}

verifySetup();
