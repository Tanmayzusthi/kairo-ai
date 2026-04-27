# API Documentation

The Kairo AI backend provides a stateless API for processing text using advanced LLMs.

## Base URL
`http://localhost:3001`

## Endpoints

### POST `/api/ai/process`
Main entry point for AI text analysis.

**Request Body:**
```json
{
  "selectedText": "Text to analyze",
  "actionType": "summarize", // Options: "summarize", "explain"
  "extension_id": "optional-id"
}
```

**Successful Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "result": "The summarized or explained text output..."
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing `selectedText` or text exceeds 5000 chars.
- `429 Too Many Requests`: Rate limit exceeded (30 requests/min).
- `503 Service Unavailable`: AI providers failed or connection timed out.
