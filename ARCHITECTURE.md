# ARCHITECTURE.md

## 1. Folder Structure

```text
kairo-ai/
├── extension/                  # Chrome Extension Client
│   ├── manifest.json           # V3 Extension definition & permissions
│   ├── src/
│   │   ├── background/         # Service worker for event handling
│   │   │   └── index.js        # Background script entry point
│   │   ├── content/            # Injected scripts for DOM manipulation
│   │   │   └── index.js        # Content script entry point
│   ├── assets/                 # Icons and static assets
│   └── package.json            # Extension build dependencies
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── server.js           # Server entry point
│   │   ├── controllers/        # Route handlers
│   │   │   └── ai.controller.js# AI generation logic
│   │   ├── services/           # Business logic and external APIs
│   │   │   └── ai.service.js   # LLM provider integration
│   ├── package.json            # Backend dependencies
│   └── .env.example            # Environment variables template
```

## 2. Tech Stack
- **Client (Chrome Extension)**: Vanilla JavaScript + HTML/CSS.
- **Backend**: Node.js + Express.js.
- **AI Integration**: Nvidia NIM API
- **Hosting**: Vercel Serverless Functions or AWS Lambda.
