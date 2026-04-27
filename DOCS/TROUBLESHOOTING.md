# Troubleshooting Guide

## Common Issues

### 1. "Failed to generate response" (Red text in UI)
- **Cause**: The backend is not running or the extension cannot reach it.
- **Fix**: Ensure your backend server is running on port 3001 and that you can access `http://localhost:3001` in your browser.

### 2. "Text exceeds 5000 character limit"
- **Cause**: You selected too much text.
- **Fix**: Select a smaller section of text. This limit is in place to ensure fast response times and prevent high API costs.

### 3. "Too many requests"
- **Cause**: You hit the rate limit (30 requests per minute).
- **Fix**: Wait 60 seconds before trying again.

### 4. Extension UI not appearing
- **Cause**: Conflict with other extensions or page scripts.
- **Fix**: Refresh the page. Ensure the extension is enabled in `chrome://extensions/`.

### 5. Backend Error: "NVIDIA_API_KEY is missing"
- **Cause**: `.env` file not created or key not added.
- **Fix**: Check that `backend/.env` exists and contains your key.
