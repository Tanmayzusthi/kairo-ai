# Architecture Overview

Kairo AI follows a modular, security-first architecture.

## System Diagram
```text
[ Browser Page ] <---> [ Content Script ] <---> [ Background Script ]
                              |                         |
                        (Floating UI)             (API Handler)
                                                        |
                                                        v
                                              [ Node.js Backend ]
                                                        |
                                             (Rate Limit / Auth)
                                                        |
                                                        v
                                               [ Nvidia NIM API ]
```

## Key Components

### 1. Client Layer (Chrome Extension)
- **Content Script**: Uses a Shadow-like injection to avoid styling conflicts. Listens for `mouseup` events to detect text selection.
- **Background Script**: Acts as a proxy to keep the API logic separate from the browser tab and handles network timeouts.

### 2. Security Layer (Backend)
- **API Key Proxy**: Never exposes sensitive keys to the browser.
- **CORS Protection**: Only accepts requests from the extension's unique ID.
- **Input Sanitization**: Rejects oversized payloads.

### 3. AI Layer (Nvidia NIM)
- **NIM Integration**: Uses Llama 3.1 405B for high-quality reasoning.
- **Failover Chain**: Includes fallback logic for Anthropic (Claude) and Groq to ensure 100% uptime.
