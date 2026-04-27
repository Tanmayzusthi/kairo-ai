# BUG_REPORT.md: Kairo AI Security & Performance Review

## 🔴 CRITICAL ISSUES (Must Fix Before Ship)

**1. Uncapped Input Length (Token Exhaustion / DoS Vulnerability)**
- **Issue**: The backend and frontend accept text selections of any length. A malicious user or accidental "Select All" on a massive page could send hundreds of thousands of characters to Nvidia NIM, exceeding token limits, crashing the server, or draining credits.
- **Location**: `backend/src/controllers/ai.controller.js` and `extension/src/content/index.js`
- **Fix**: 
  - Frontend: Truncate `text.substring(0, 5000)` before sending.
  - Backend: Add validation: `if (selectedText.length > 5000) return res.status(400).json({ error: 'Text exceeds 5000 character limit.' });`

**2. IP Rate Limiting Bypass / False Positives Behind Proxies**
- **Issue**: `express-rate-limit` relies on the `req.ip` object. If deployed to Vercel, AWS, or behind Cloudflare, `req.ip` will be the proxy's IP, meaning all users share the same rate limit (breaking the app immediately) or attackers can easily spoof IPs.
- **Location**: `backend/src/server.js`
- **Fix**: Add `app.set('trust proxy', 1 /* number of proxies between user and server */);` right above the rate limiter instantiation.

---

## 🟡 WARNINGS (Nice to Have / Should Fix)

**1. No Client-Side Fetch Timeout (Potential Infinite Hang)**
- **Issue**: If the backend goes down but doesn't immediately refuse the connection, the `fetch` in the background script will hang forever, leaving the content script UI stuck in "Generating...".
- **Location**: `extension/src/background/index.js` -> `handleAIGeneration()`
- **Fix**: Implement an `AbortController` with a `setTimeout` to abort the fetch if it exceeds 10,000ms, returning a "Request timed out" error to the UI.

**2. Insufficient Error Differentiation in UI**
- **Issue**: The UI catches all errors and says `"Failed to generate response. Please try again."` If the user hits the rate limit (429), they should be explicitly told to "Wait 60 seconds."
- **Location**: `extension/src/content/index.js` -> `handleAction()` callback.
- **Fix**: Pass the specific `response.error` message from the backend directly into `this.responseArea.textContent`.

**3. Selection Thrashing (Missing Debounce)**
- **Issue**: Rapidly clicking or dragging the mouse fires the `mouseup` event continuously. While there is a 10ms timeout, it doesn't cancel previous invocations, potentially causing the UI to flicker or duplicate calculations.
- **Location**: `extension/src/content/index.js` -> `handleSelection()`
- **Fix**: Add a `clearTimeout(this.selectionTimeout)` before setting the new `setTimeout` for UI rendering.

---

## 🔵 SUGGESTIONS (Phase 2 Optimizations)

**1. Time-to-First-Byte (TTFB) / Streaming**
- **Issue**: To achieve a strict `< 200ms` perceived latency on a 120B/405B model, you cannot wait for the entire generation to finish before responding.
- **Fix**: Implement Server-Sent Events (SSE) or Fetch API streaming. The backend should proxy the stream from Nvidia NIM directly to the Chrome Extension background script, and pass chunks to the content script.

**2. Response Caching (Cost Reduction & Speed)**
- **Issue**: Users often re-select the exact same text to get a summary or explanation. Re-calling the AI wastes API credits and adds latency.
- **Fix**: Implement a Redis cache (or simple in-memory `Map` if single-instance) on the backend using an MD5 hash of `actionType + selectedText` as the key. Return the cached result instantly.

**3. Content Security Policy (CSP) Hardening**
- **Issue**: Chrome extensions are susceptible to compromised CDNs or rogue script execution. 
- **Fix**: Add a strict `"content_security_policy"` to the `manifest.json` ensuring no external scripts or unsafe eval can run in the extension context.
