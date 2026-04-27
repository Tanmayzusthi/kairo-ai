# 🦅 Kairo AI

**Kairo AI** is a professional-grade Chrome Extension + Node.js backend system designed for high-performance AI text analysis. Built with a security-first architecture, it leverages **Nvidia NIM (Llama 3.1 405B)** to provide instant summarization, explanation, and custom AI actions directly in your browser.

---

## ✨ Features

- **🎯 Contextual AI**: Highlight any text on any webpage to trigger the floating AI panel.
- **⚡ High Performance**: Optimized for <200ms latency using Nvidia's global NIM endpoints.
- **🔒 Security First**: API keys are strictly handled server-side; never exposed to the client.
- **🛠️ 7 AI Actions**:
  - **Summarize**: 2-3 sentence concise summaries.
  - **Explain**: Simplifies complex text with analogies.
  - **Rewrite**: Improves clarity and style.
  - **Reply**: Generates professional email/message responses.
  - **Translate**: Accurate translation to English.
  - **Fix Grammar**: Perfects spelling and punctuation.
  - **Custom**: Execute any arbitrary instruction on selected text.
- **📝 Obsidian Integration**: Auto-save every conversation to your local vault with rich metadata.
- **🛡️ Production Ready**: Built-in rate limiting, CORS protection, and Sentry error tracking.

---

## 📂 Project Structure

```text
├── backend/            # Express.js server (Nvidia NIM Integration)
├── extension/          # Chrome Extension (Manifest V3, Vanilla JS)
├── obsidian-plugin/    # Obsidian Auto-Save Plugin (TypeScript)
├── DOCS/               # Detailed documentation
└── ARCHITECTURE.md     # System design overview
```

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Add your NVIDIA_API_KEY
npm start
```

### 2. Extension Setup
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension/` folder.

### 3. Obsidian Setup
1. Navigate to `obsidian-plugin/`.
2. Run `npm install && npm run build`.
3. Copy the folder to your vault's `.obsidian/plugins/` directory.

---

## 📚 Documentation

For detailed guides, check the `DOCS/` folder:
- [Local Setup Guide](DOCS/SETUP.md)
- [API Reference](DOCS/API.md)
- [Deployment Guide (Railway/Render)](DOCS/DEPLOYMENT.md)
- [Monetization Strategy](DOCS/MONETIZATION.md)
- [Troubleshooting](DOCS/TROUBLESHOOTING.md)

---

## 🛡️ License
MIT License - Copyright (c) 2024 Tanmayzusthi
