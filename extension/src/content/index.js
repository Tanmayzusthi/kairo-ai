/* ─── Kairo AI Content Script (SHADOW DOM EDITION) ──────────────────────────
   Design: Claude-inspired, Ironclad stability, Shadow DOM injection.
──────────────────────────────────────────────────────────────────────────── */

const KAIRO_STYLES = `
  :host {
    all: initial; /* Reset everything inside shadow root */
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .kairo-wrapper {
    position: fixed;
    z-index: 2147483647;
    pointer-events: none;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
  }

  #kairo-panel {
    position: absolute;
    width: 420px;
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
    padding: 20px;
    display: none;
    flex-direction: column;
    gap: 16px;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 200ms ease, transform 200ms ease;
    color: #1F2937;
    box-sizing: border-box;
  }

  #kairo-panel.visible {
    display: flex;
    opacity: 1;
    transform: translateY(0);
  }

  .kairo-preview {
    font-size: 13px;
    color: #6B7280;
    font-style: italic;
    border-bottom: 1px solid #F3F4F6;
    padding-bottom: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .kairo-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .kairo-btn {
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    color: #374151;
    border-radius: 8px;
    padding: 10px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    transition: all 150ms ease;
  }
  .kairo-btn:hover { background: #F3F4F6; border-color: #D1D5DB; }
  .kairo-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; }

  .kairo-custom {
    display: flex;
    gap: 8px;
    background: #F9FAFB;
    padding: 4px;
    border-radius: 10px;
    border: 1px solid #E5E7EB;
  }
  .kairo-input {
    flex: 1;
    background: transparent;
    border: none;
    font-size: 14px;
    padding: 8px;
    outline: none;
    color: #111827;
  }
  .kairo-send {
    background: #2563EB;
    border: none;
    border-radius: 7px;
    color: #FFFFFF;
    cursor: pointer;
    font-weight: 600;
    padding: 0 16px;
  }

  #kairo-response {
    display: none;
    font-size: 15px;
    line-height: 1.6;
    max-height: 250px;
    overflow-y: auto;
    padding: 4px 0;
    word-wrap: break-word;
  }
  #kairo-response.active { display: block; }

  .kairo-loader {
    display: none;
    align-items: center;
    gap: 10px;
    color: #6B7280;
    font-size: 14px;
  }
  .kairo-loader.active { display: flex; }

  .kairo-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    border-top: 1px solid #F3F4F6;
    padding-top: 12px;
  }
  .kairo-footer-btn {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
  }
  .kairo-footer-btn.primary { background: #2563EB; color: #FFFFFF; border: none; }
`;

const ICONS = {
  summarize: `<svg viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`,
  explain: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  rewrite: `<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  reply: `<svg viewBox="0 0 24 24"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>`,
  translate: `<svg viewBox="0 0 24 24"><path d="M2 5h7M9 3v2c0 4.418-2.239 8-5 8"/><path d="M14 21l3-7 3 7M15.5 18h3"/><path d="M22 5h-8M18 3v2c0 4.418 2.239 8 5 8"/></svg>`,
  fix: `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
};

class KairoShadow {
  constructor() {
    this.currentText = '';
    this.isVisible = false;
    this.init();
  }

  init() {
    // Create host and shadow root
    this.host = document.createElement('div');
    this.host.id = 'kairo-ai-shadow-host';
    document.documentElement.appendChild(this.host);
    this.shadow = this.host.attachShadow({ mode: 'closed' });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = KAIRO_STYLES;
    this.shadow.appendChild(style);

    // Create UI
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'kairo-wrapper';
    
    this.panel = document.createElement('div');
    this.panel.id = 'kairo-panel';

    this.panel.innerHTML = `
      <div class="kairo-preview" id="kairo-preview-text"></div>
      <div class="kairo-grid">
        <button class="kairo-btn" data-action="summarize">${ICONS.summarize}<span>Summarize</span></button>
        <button class="kairo-btn" data-action="explain">${ICONS.explain}<span>Explain</span></button>
        <button class="kairo-btn" data-action="rewrite">${ICONS.rewrite}<span>Rewrite</span></button>
        <button class="kairo-btn" data-action="reply">${ICONS.reply}<span>Reply</span></button>
        <button class="kairo-btn" data-action="translate">${ICONS.translate}<span>Translate</span></button>
        <button class="kairo-btn" data-action="fix_grammar">${ICONS.fix}<span>Fix Grammar</span></button>
      </div>
      <div class="kairo-custom">
        <input class="kairo-input" id="kairo-custom-input" placeholder="Ask Kairo anything...">
        <button class="kairo-send" id="kairo-send-btn">Ask</button>
      </div>
      <div class="kairo-loader" id="kairo-loader">Thinking...</div>
      <div id="kairo-response"></div>
      <div class="kairo-footer">
        <button class="kairo-footer-btn" id="kairo-close-btn">Close</button>
        <button class="kairo-footer-btn primary" id="kairo-copy-btn" style="display:none">Copy</button>
      </div>
    `;

    this.wrapper.appendChild(this.panel);
    this.shadow.appendChild(this.wrapper);

    this.bindInternalEvents();
    this.bindExternalEvents();
  }

  bindInternalEvents() {
    this.shadow.querySelectorAll('.kairo-btn').forEach(btn => {
      btn.onclick = () => this.handleAction(btn.dataset.action);
    });

    this.shadow.getElementById('kairo-send-btn').onclick = () => this.handleAction('custom');
    this.shadow.getElementById('kairo-close-btn').onclick = () => this.hide();
    this.shadow.getElementById('kairo-copy-btn').onclick = () => {
      const text = this.shadow.getElementById('kairo-response').textContent;
      navigator.clipboard.writeText(text);
      this.shadow.getElementById('kairo-copy-btn').textContent = 'Copied!';
      setTimeout(() => this.shadow.getElementById('kairo-copy-btn').textContent = 'Copy', 2000);
    };
  }

  bindExternalEvents() {
    document.addEventListener('mouseup', (e) => {
      if (this.isVisible && this.host.contains(e.target)) return;
      
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel.toString().trim();
        if (text.length > 5) {
          this.currentText = text;
          this.show(e.clientX, e.clientY);
        }
      }, 100);
    });
  }

  show(x, y) {
    this.isVisible = true;
    this.shadow.getElementById('kairo-preview-text').textContent = `"${this.currentText.substring(0, 50)}..."`;
    this.shadow.getElementById('kairo-response').classList.remove('active');
    this.shadow.getElementById('kairo-copy-btn').style.display = 'none';
    
    this.panel.style.display = 'flex';
    
    // Position check
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const panelX = Math.min(x, winW - 440);
    const panelY = Math.min(y + 20, winH - 400);

    this.panel.style.left = `${panelX}px`;
    this.panel.style.top = `${panelY}px`;

    requestAnimationFrame(() => this.panel.classList.add('visible'));
  }

  hide() {
    this.isVisible = false;
    this.panel.classList.remove('visible');
    setTimeout(() => { this.panel.style.display = 'none'; }, 200);
  }

  async handleAction(type) {
    const input = this.shadow.getElementById('kairo-custom-input');
    const instruction = input.value.trim();
    if (type === 'custom' && !instruction) return;

    const loader = this.shadow.getElementById('kairo-loader');
    const responseArea = this.shadow.getElementById('kairo-response');
    
    loader.classList.add('active');
    responseArea.classList.remove('active');

    chrome.runtime.sendMessage({
      action: 'GENERATE_AI_RESPONSE',
      payload: { context: this.currentText, actionType: type, customInstruction: instruction }
    }, (res) => {
      loader.classList.remove('active');
      if (res?.status === 'success') {
        responseArea.textContent = res.data.data.result;
        responseArea.classList.add('active');
        this.shadow.getElementById('kairo-copy-btn').style.display = 'block';
      } else {
        responseArea.textContent = "Error: " + (res?.error || "Connection failed");
        responseArea.classList.add('active');
      }
    });
  }
}

// Only inject once
if (!window.KairoInjected) {
  new KairoShadow();
  window.KairoInjected = true;
}
