/* ─── Kairo AI Content Script ───────────────────────────────────────────────
   Injects a Claude-inspired floating action panel on text selection.
   Design: Minimalist, Typography-first, Refined.
──────────────────────────────────────────────────────────────────────────── */

const KAIRO_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  #kairo-ai-root {
    position: absolute;
    z-index: 2147483647;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    pointer-events: none;
    line-height: 1.6;
  }

  #kairo-ai-panel {
    width: 420px;
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
    color: #1F2937;
  }

  #kairo-ai-panel.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── Selection Preview ── */
  .kairo-selection-preview {
    font-size: 13px;
    color: #6B7280;
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-bottom: 8px;
    border-bottom: 1px solid #F3F4F6;
  }

  /* ── Action Grid ── */
  .kairo-action-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .kairo-btn {
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    color: #374151;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 150ms ease;
    user-select: none;
  }

  .kairo-btn:hover {
    background: #F3F4F6;
    border-color: #D1D5DB;
    color: #111827;
  }

  .kairo-btn:active {
    transform: scale(0.97);
  }

  .kairo-btn svg {
    width: 16px;
    height: 16px;
    stroke-width: 2;
  }

  /* ── Custom Input ── */
  .kairo-custom-row {
    display: flex;
    gap: 8px;
    background: #F9FAFB;
    padding: 4px;
    border-radius: 10px;
    border: 1px solid #E5E7EB;
  }
  .kairo-custom-input {
    flex: 1;
    background: transparent;
    border: none;
    font-size: 14px;
    padding: 8px 12px;
    outline: none;
    color: #111827;
  }
  .kairo-custom-input::placeholder { color: #9CA3AF; }
  .kairo-custom-send {
    background: #2563EB;
    border: none;
    border-radius: 7px;
    color: #FFFFFF;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    padding: 0 16px;
    transition: background 150ms ease;
  }
  .kairo-custom-send:hover { background: #1D4ED8; }

  /* ── Response Area ── */
  #kairo-response-area {
    display: none;
    font-size: 15px;
    line-height: 1.6;
    color: #1F2937;
    max-height: 300px;
    overflow-y: auto;
    padding: 4px 0;
  }
  #kairo-response-area.active {
    display: block;
    animation: kairoFadeIn 300ms ease-out;
  }

  #kairo-response-area code {
    background: #F3F4F6;
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 13px;
  }

  /* ── Loader ── */
  .kairo-loader {
    display: none;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    color: #6B7280;
    font-size: 14px;
  }
  .kairo-loader.active { display: flex; }
  .kairo-dots { display: flex; gap: 4px; }
  .kairo-dot {
    width: 4px; height: 4px;
    background: #9CA3AF;
    border-radius: 50%;
    animation: kairoPulse 1s infinite alternate;
  }
  .kairo-dot:nth-child(2) { animation-delay: 0.2s; }
  .kairo-dot:nth-child(3) { animation-delay: 0.4s; }

  /* ── Footer ── */
  .kairo-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid #F3F4F6;
  }
  .kairo-footer-btn {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    color: #4B5563;
    transition: all 150ms ease;
  }
  .kairo-footer-btn:hover { background: #F9FAFB; border-color: #D1D5DB; }
  .kairo-footer-btn.primary {
    background: #2563EB;
    border-color: #2563EB;
    color: #FFFFFF;
  }
  .kairo-footer-btn.primary:hover { background: #1D4ED8; }

  @keyframes kairoFadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes kairoPulse {
    from { opacity: 0.3; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1.1); }
  }

  /* ── Mobile ── */
  @media (max-width: 480px) {
    #kairo-ai-panel { width: 320px; padding: 16px; }
    .kairo-action-grid { grid-template-columns: 1fr 1fr; }
  }
`;

const ICONS = {
  summarize: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`,
  explain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  rewrite: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  reply: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>`,
  translate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 5h7M9 3v2c0 4.418-2.239 8-5 8"/><path d="M14 21l3-7 3 7M15.5 18h3"/><path d="M22 5h-8M18 3v2c0 4.418 2.239 8 5 8"/></svg>`,
  fix: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>`,
};

class KairoUI {
  constructor() {
    this.currentSelection = '';
    this.isProcessing = false;
    this.injectStyles();
    this.createDOM();
    this.bindEvents();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = KAIRO_STYLES;
    document.head.appendChild(style);
  }

  createDOM() {
    this.root = document.createElement('div');
    this.root.id = 'kairo-ai-root';
    this.root.style.top = '-9999px';
    this.root.style.left = '-9999px';

    this.panel = document.createElement('div');
    this.panel.id = 'kairo-ai-panel';

    // Preview
    this.preview = document.createElement('div');
    this.preview.className = 'kairo-selection-preview';
    this.panel.appendChild(this.preview);

    // Actions
    const grid = document.createElement('div');
    grid.className = 'kairo-action-grid';
    const actions = [
      { id: 'summarize', label: 'Summarize', icon: ICONS.summarize },
      { id: 'explain',   label: 'Explain',   icon: ICONS.explain },
      { id: 'rewrite',   label: 'Rewrite',   icon: ICONS.rewrite },
      { id: 'reply',     label: 'Reply',     icon: ICONS.reply },
      { id: 'translate', label: 'Translate', icon: ICONS.translate },
      { id: 'fix_grammar', label: 'Fix Grammar', icon: ICONS.fix },
    ];

    actions.forEach(act => {
      const btn = document.createElement('button');
      btn.className = 'kairo-btn';
      btn.innerHTML = `${act.icon}<span>${act.label}</span>`;
      btn.onclick = () => this.handleAction(act.id);
      grid.appendChild(btn);
    });
    this.panel.appendChild(grid);

    // Custom
    const customRow = document.createElement('div');
    customRow.className = 'kairo-custom-row';
    this.input = document.createElement('input');
    this.input.className = 'kairo-custom-input';
    this.input.placeholder = 'Ask anything about this text...';
    this.input.onkeydown = (e) => e.key === 'Enter' && this.handleAction('custom');
    
    const send = document.createElement('button');
    send.className = 'kairo-custom-send';
    send.textContent = 'Ask';
    send.onclick = () => this.handleAction('custom');

    customRow.appendChild(this.input);
    customRow.appendChild(send);
    this.panel.appendChild(customRow);

    // Loader
    this.loader = document.createElement('div');
    this.loader.className = 'kairo-loader';
    this.loader.innerHTML = `
      <div class="kairo-dots"><div class="kairo-dot"></div><div class="kairo-dot"></div><div class="kairo-dot"></div></div>
      <span>Kairo is thinking...</span>
    `;
    this.panel.appendChild(this.loader);

    // Response
    this.response = document.createElement('div');
    this.response.id = 'kairo-response-area';
    this.panel.appendChild(this.response);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'kairo-footer';
    
    const close = document.createElement('button');
    close.className = 'kairo-footer-btn';
    close.textContent = 'Close';
    close.onclick = () => this.hide();

    this.copy = document.createElement('button');
    this.copy.className = 'kairo-footer-btn primary';
    this.copy.textContent = 'Copy';
    this.copy.style.display = 'none';
    this.copy.onclick = () => this.handleCopy();

    footer.appendChild(close);
    footer.appendChild(this.copy);
    this.panel.appendChild(footer);

    this.root.appendChild(this.panel);
    document.body.appendChild(this.root);
  }

  bindEvents() {
    document.addEventListener('mouseup', (e) => {
      // Small timeout to allow the selection to stabilize
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel.toString().trim();
        
        // Only show if it's a real selection (at least 5 characters)
        // and we are not clicking inside the panel itself
        if (text && text.length > 5 && !this.panel.contains(e.target)) {
          this.currentSelection = text;
          this.show(e);
        }
      }, 50);
    });

    // AUTO-HIDE REMOVED: The panel will now stay open until you click 'Close'
    // This prevents it from vanishing while you are trying to use it.
  }

  show(e) {
    this.preview.textContent = `“${this.currentSelection.substring(0, 60)}...”`;
    this.response.classList.remove('active');
    this.copy.style.display = 'none';
    this.input.value = '';
    
    const x = e.pageX;
    const y = e.pageY + 20;
    
    this.root.style.left = `${Math.min(x, window.innerWidth - 440)}px`;
    this.root.style.top = `${y}px`;
    
    requestAnimationFrame(() => this.panel.classList.add('visible'));
  }

  hide() {
    this.panel.classList.remove('visible');
    setTimeout(() => {
      this.root.style.top = '-9999px';
    }, 2000);
  }

  async handleAction(type) {
    if (this.isProcessing) return;
    const instruction = this.input.value.trim();
    if (type === 'custom' && !instruction) return;

    this.isProcessing = true;
    this.loader.classList.add('active');
    this.response.classList.remove('active');
    this.copy.style.display = 'none';

    chrome.runtime.sendMessage({
      action: 'GENERATE_AI_RESPONSE',
      payload: {
        context: this.currentSelection,
        actionType: type,
        customInstruction: instruction
      }
    }, (res) => {
      this.isProcessing = false;
      this.loader.classList.remove('active');
      
      if (res && res.status === 'success') {
        this.response.textContent = res.data.data.result;
        this.response.classList.add('active');
        this.copy.style.display = 'block';
      } else {
        this.response.textContent = "Error: " + (res?.error || "Unknown error");
        this.response.classList.add('active');
      }
    });
  }

  handleCopy() {
    navigator.clipboard.writeText(this.response.textContent);
    const old = this.copy.textContent;
    this.copy.textContent = 'Copied!';
    setTimeout(() => this.copy.textContent = old, 2000);
  }
}

new KairoUI();
