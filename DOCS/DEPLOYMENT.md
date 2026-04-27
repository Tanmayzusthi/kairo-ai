# Deployment Guide for Kairo AI

---

## 📦 Overview
This guide walks you through deploying the **Kairo AI** backend to a free‑tier **Railway** or **Render** service, updating the Chrome extension for production, and adding monitoring & security safeguards.

---

## 🚂 Railway Deployment

1. **Create an account** – Visit <https://railway.app> and sign up (free tier).
2. **New Project** – Click **New Project → Deploy from Repo**.
3. **Connect GitHub** – Authorize Railway to access your repo, select the `KAIRO AI` repository, and confirm.
4. **Environment Variables** – In the *Variables* tab, add:
   ```
   NVIDIA_API_KEY=YOUR_NVIDIA_API_KEY
   PORT=3001
   NODE_ENV=production
   ```
5. **Deploy button** – Railway automatically runs `npm install` then `npm start`. Verify the build succeeds and the service shows *Running*.
6. **Custom domain (optional)** – In *Settings → Domains* click **Add Domain**, point your DNS `CNAME` to the Railway sub‑domain, and enable **HTTPS** (Railway auto‑issues a cert.
7. **Monitoring & logs** – Use the *Logs* panel to view real‑time output. Enable *Metrics* for CPU/RAM alerts.

> **Tip:** Railway’s free tier restarts the container after 30 minutes of inactivity – the next request will automatically spin it back up.

---

## ☁️ Render Deployment

1. **Sign up** – Go to <https://render.com> and create a free account.
2. **Create a Web Service** – Click **New → Web Service**.
3. **GitHub integration** – Connect your GitHub account, choose the `KAIRO AI` repo, and select the `main` branch.
4. **Build command** – `npm install`
5. **Start command** – `npm start`
6. **Environment variables** – Add the same three variables as on Railway:
   ```
   NVIDIA_API_KEY=YOUR_NVIDIA_API_KEY
   PORT=3001
   NODE_ENV=production
   ```
7. **Auto‑deploy** – Ensure *Auto‑Deploy on Push* is enabled (default).
8. **Health checks** – Set **Path** to `/api/ai/health` (you may add a simple health endpoint) and **Interval** to `30s`.
9. **Domain** – Render provides a TLS‑enabled sub‑domain; you can map a custom domain in *Settings → Custom Domains*.
10. **Logs & metrics** – View logs under *Logs* and enable *Metrics* for response‑time alerts.

---

## 🧩 Chrome Extension Update for Production

1. **Build production manifest** – Update `extension/manifest.json`:
   ```json
   "content_security_policy": {
     "extension_pages": "script-src 'self'; object-src 'self'"
   },
   "host_permissions": ["https://<YOUR_BACKEND_DOMAIN>/*"]
   ```
2. **Set `BACKEND_URL`** – In `extension/src/content/index.js` (or a dedicated config file) replace the development URL with the production domain:
   ```js
   const BACKEND_URL = "https://your-backend.railway.app/api/ai/process";
   ```
3. **CORS origins** – In `backend/src/server.js` add the extension’s origin (e.g., `chrome-extension://<extension-id>`) to the CORS whitelist.
4. **Test** – Load the unpacked extension in Chrome (`chrome://extensions`), reload a page, select text and verify the API request succeeds (check Network tab).

---

## 📈 Monitoring & Alerting

| Item | Recommendation |
|------|-----------------|
| **Error logging** | Integrate **Sentry** (free tier). In `backend/src/server.js` add:
```js
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'YOUR_SENTRY_DSN', tracesSampleRate: 1.0 });
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```
| **Response‑time monitoring** | Use Railway/Render metrics or add lightweight **Prometheus** exporters. Plot average latency (target `< 200 ms`). |
| **Rate‑limit alerts** | Enable alerts on the rate‑limit middleware (`express-rate-limit`). Send Slack/Email webhook when 429 errors spike. |
| **API‑key rotation** | Schedule a monthly reminder to generate a new NVIDIA API key, update the `.env` value, and redeploy. |
| **HTTPS enforcement** | All traffic to the backend must use HTTPS. Railway and Render automatically provide TLS; enforce `app.use((req,res,next)=>{ if(req.protocol!=='https') return res.redirect('https://'+req.get('host')+req.url); next();});` |

---

## 🔐 Security Checklist (pre‑deployment)

- [ ] **NVIDIA_API_KEY** never appears in client‑side code or the repo (stored only in the server’s `.env`).
- [ ] **CORS** limited to the Chrome extension’s `chrome-extension://<extension‑id>` origin **and** the production domain.
- [ ] **Rate limiting** (`30 req/min per IP`) is active and cannot be bypassed.
- [ ] **HTTPS** enforced for all endpoints.
- [ ] **Logs** are sanitized – no raw request bodies or API keys are printed.
- [ ] **Dependency audit** – run `npm audit` and fix any high‑severity issues before deployment.

---

## ✅ Final Checklist Before Going Live
1. ✅ Verify `.env` contains a valid `NVIDIA_API_KEY` and that the file is listed in `.gitignore`.
2. ✅ Deploy to Railway **or** Render and confirm the health endpoint returns `200`.
3. ✅ Update the Chrome extension’s `BACKEND_URL` and CORS whitelist.
4. ✅ Load the unpacked extension in Chrome and perform a test *Summarize* action.
5. ✅ Check Sentry dashboard for any uncaught errors.
6. ✅ Ensure rate‑limit headers (`X‑RateLimit-Limit`, `X‑RateLimit-Remaining`) are present in responses.
7. ✅ Document the production domain URL in the project README for future collaborators.

---

*Happy deploying! 🎉*
