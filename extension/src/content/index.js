/* ─── Kairo AI Content Script ───────────────────────────────────────────────
   Injects a floating action panel on text selection.
   Supports 6 one-click actions + a custom prompt input.
   All styling is injected inline to avoid conflicts with page CSS.
──────────────────────────────────────────────────────────────────────────── */

const KAIRO_STYLES = `
  #kairo-ai-root {
    position: absolute;
    z-index: 2147483647;
    font-family: system-ui, -apple-system, sans-serif;
    pointer-events: none;
  }

  #kairo-ai-panel {
    background: #111;
    border: 1px solid #2A2A2A;
    border-radius: 14px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 320px;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(10px) scale(0.95);
    transition: opacity 140ms ease, transform 140ms cubic-bezier(0.16, 1, 0.3, 1);
    color: #EDEDED;
  }

  #kairo-ai-panel.kairo-visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  /* ── Header ── */
  .kairo-header {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 2px 4px 6px;
    border-bottom: 1px solid #222;
  }
  .kairo-logo {
    width: 16px;
    height: 16px;
    fill: #7C6AF7;
  }
  .kairo-title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: #aaa;
    text-transform: uppercase;
  }
  .kairo-close {
    margin-left: auto;
    background: none;
    border: none;
    color: #555;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    padding: 0 2px;
    transition: color 120ms;
  }
  .kairo-close:hover { color: #ddd; }

  /* ── Action Buttons Grid ── */
  .kairo-action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 5px;
  }

  .kairo-btn {
    background: #1C1C1C;
    border: 1px solid #2E2E2E;
    color: #DADADA;
    border-radius: 8px;
    padding: 7px 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    transition: background 120ms, border-color 120ms, transform 100ms;
    user-select: none;
  }
  .kairo-btn:hover {
    background: #252525;
    border-color: #3A3A3A;
  }
  .kairo-btn:active { transform: scale(0.95); }
  .kairo-btn svg {
    width: 15px;
    height: 15px;
    stroke: currentColor;
    fill: none;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* ── Custom Input ── */
  .kairo-custom-row {
    display: flex;
    gap: 5px;
  }
  .kairo-custom-input {
    flex: 1;
    background: #1C1C1C;
    border: 1px solid #2E2E2E;
    border-radius: 8px;
    color: #EDEDED;
    font-size: 12px;
    padding: 7px 9px;
    outline: none;
    transition: border-color 120ms;
  }
  .kairo-custom-input::placeholder { color: #555; }
  .kairo-custom-input:focus { border-color: #7C6AF7; }
  .kairo-custom-send {
    background: #7C6AF7;
    border: none;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    padding: 7px 12px;
    transition: background 120ms, transform 100ms;
  }
  .kairo-custom-send:hover { background: #6a5ae0; }
  .kairo-custom-send:active { transform: scale(0.95); }

  /* ── Response Area ── */
  #kairo-response-area {
    display: none;
    font-size: 13px;
    line-height: 1.6;
    padding: 10px;
    background: #161616;
    border-radius: 8px;
    border: 1px solid #252525;
    max-height: 220px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
  #kairo-response-area.kairo-active { display: block; animation: kairoFadeIn 140ms ease forwards; }
  #kairo-response-area.kairo-error { color: #f87171; }

  /* ── Loader ── */
  .kairo-loader {
    display: none;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    font-size: 12px;
    color: #666;
  }
  .kairo-loader.kairo-active { display: flex; }
  .kairo-spinner {
    width: 14px; height: 14px;
    border: 2px solid #333;
    border-top-color: #7C6AF7;
    border-radius: 50%;
    animation: kairoSpin 0.7s linear infinite;
  }

  @keyframes kairoFadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes kairoSpin {
    to { transform: rotate(360deg); }
  }
`;

// ─── SVG Icons (stroke-based, no fill) ────────────────────────────────────────

const ICONS = {
  logo:       `<svg viewBox="0 0 24 24" fill="#7C6AF7" stroke="none"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z"/></svg>`,
  summarize:  `<svg viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`,
  explain:    `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  rewrite:    `<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  reply:      `<svg viewBox="0 0 24 24"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>`,
  translate:  `<svg viewBox="0 0 24 24"><path d="M2 5h7M9 3v2c0 4.418-2.239 8-5 8"/><path d="M14 21l3-7 3 7M15.5 18h3"/><path d="M22 5h-8M18 3v2c0 4.418 2.239 8 5 8"/></svg>`,
  fix_grammar:`<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
};

// ─── Main Class ───────────────────────────────────────────────────────────────

class KairoContentUI {
  constructor() {
    this.currentSelection = '';
    this.selectionTimeout = null;
    this.isProcessing = false;

    this.injectStyles();
    this.createDOM();
    this.bindEvents();
  }

  // ── Styles ──────────────────────────────────────────────────────────────────

  injectStyles() {
    if (document.getElementById('kairo-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'kairo-styles';
    styleEl.textContent = KAIRO_STYLES;
    document.head.appendChild(styleEl);
  }

  // ── DOM Creation ─────────────────────────────────────────────────────────────

  createDOM() {
    this.root = document.createElement('div');
    this.root.id = 'kairo-ai-root';

    this.panel = document.createElement('div');
    this.panel.id = 'kairo-ai-panel';
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-label', 'Kairo AI Assistant');

    // Header
    const header = document.createElement('div');
    header.className = 'kairo-header';
    header.innerHTML = `${ICONS.logo}<span class="kairo-title">Kairo AI</span>`;
    this.closeBtn = document.createElement('button');
    this.closeBtn.className = 'kairo-close';
    this.closeBtn.innerHTML = '&times;';
    this.closeBtn.setAttribute('aria-label', 'Close Kairo AI panel');
    header.appendChild(this.closeBtn);

    // Action grid — 6 one-click actions
    const grid = document.createElement('div');
    grid.className = 'kairo-action-grid';
    const actions = [
      { key: 'summarize',   label: 'Summarize',  icon: ICONS.summarize  },
      { key: 'explain',     label: 'Explain',    icon: ICONS.explain    },
      { key: 'rewrite',     label: 'Rewrite',    icon: ICONS.rewrite    },
      { key: 'reply',       label: 'Reply',      icon: ICONS.reply      },
      { key: 'translate',   label: 'Translate',  icon: ICONS.translate  },
      { key: 'fix_grammar', label: 'Fix Grammar',icon: ICONS.fix_grammar},
    ];
    actions.forEach(({ key, label, icon }) => {
      const btn = this.createActionButton(label, icon, key);
      grid.appendChild(btn);
    });

    // Custom prompt row
    const customRow = document.createElement('div');
    customRow.className = 'kairo-custom-row';
    this.customInput = document.createElement('input');
    this.customInput.className = 'kairo-custom-input';
    this.customInput.type = 'text';
    this.customInput.placeholder = 'Custom prompt…';
    this.customInput.maxLength = 500;
    this.customSend = document.createElement('button');
    this.customSend.className = 'kairo-custom-send';
    this.customSend.textContent = 'Go';
    customRow.appendChild(this.customInput);
    customRow.appendChild(this.customSend);

    // Loader
    this.loader = document.createElement('div');
    this.loader.className = 'kairo-loader';
    this.loader.innerHTML = '<div class="kairo-spinner"></div><span>Generating…</span>';

    // Response
    this.responseArea = document.createElement('div');
    this.responseArea.id = 'kairo-response-area';

    this.panel.appendChild(header);
    this.panel.appendChild(grid);
    this.panel.appendChild(customRow);
    this.panel.appendChild(this.loader);
    this.panel.appendChild(this.responseArea);
    this.root.appendChild(this.panel);
    document.body.appendChild(this.root);
  }

  createActionButton(label, icon, actionKey) {
    const btn = document.createElement('button');
    btn.className = 'kairo-btn';
    btn.id = `kairo-btn-${actionKey}`;
    btn.innerHTML = `${icon}<span>${label}</span>`;
    btn.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); });
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.handleAction(actionKey);
    });
    return btn;
  }

  // ── Events ───────────────────────────────────────────────────────────────────

  bindEvents() {
    document.addEventListener('mouseup', e => this.handleSelectionChange(e));

    document.addEventListener('mousedown', e => {
      if (!this.root.contains(e.target)) this.hidePanel();
    });

    this.closeBtn.addEventListener('click', () => this.hidePanel());

    // Custom prompt: send on Enter or button click
    this.customInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.handleCustomAction();
    });
    this.customSend.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); });
    this.customSend.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.handleCustomAction();
    });
  }

  handleSelectionChange(e) {
    clearTimeout(this.selectionTimeout);
    this.selectionTimeout = setTimeout(() => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : '';

      if (text.length > 5 && !this.root.contains(e.target)) {
        this.currentSelection = text.substring(0, 5000);
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        this.showPanel(
          rect.left + window.scrollX + rect.width / 2,
          rect.bottom + window.scrollY + 12
        );
      } else if (text.length === 0 && !this.root.contains(e.target)) {
        this.hidePanel();
      }
    }, 50);
  }

  // ── Panel Show/Hide ──────────────────────────────────────────────────────────

  showPanel(x, y) {
    const panelWidth = 320;
    const leftPos = Math.max(10, Math.min(x - panelWidth / 2, window.innerWidth - panelWidth - 10));
    this.root.style.left = `${leftPos + window.scrollX}px`;
    this.root.style.top = `${y}px`;

    this.resetResponseArea();
    this.customInput.value = '';

    requestAnimationFrame(() => {
      this.panel.classList.add('kairo-visible');
    });
  }

  hidePanel() {
    this.panel.classList.remove('kairo-visible');
    setTimeout(() => {
      this.root.style.top = '-9999px';
      this.root.style.left = '-9999px';
    }, 150);
  }

  resetResponseArea() {
    this.responseArea.classList.remove('kairo-active', 'kairo-error');
    this.responseArea.textContent = '';
    this.loader.classList.remove('kairo-active');
  }

  // ── Action Handling ──────────────────────────────────────────────────────────

  handleAction(actionKey, customInstruction = '') {
    if (!this.currentSelection || this.isProcessing) return;
    this.isProcessing = true;
    this.resetResponseArea();
    this.loader.classList.add('kairo-active');

    chrome.runtime.sendMessage(
      {
        action: 'GENERATE_AI_RESPONSE',
        payload: {
          context: this.currentSelection,
          actionType: actionKey,
          customInstruction,
          url: window.location.href,
        },
      },
      response => {
        this.isProcessing = false;
        this.loader.classList.remove('kairo-active');
        this.responseArea.classList.add('kairo-active');

        if (response && response.status === 'success') {
          this.responseArea.classList.remove('kairo-error');
          this.responseArea.textContent = response.data.data.result;
        } else {
          this.responseArea.classList.add('kairo-error');
          this.responseArea.textContent =
            (response && response.error)
              ? response.error
              : 'Failed to generate response. Please try again.';
        }
      }
    );
  }

  handleCustomAction() {
    const instruction = this.customInput.value.trim();
    if (!instruction) {
      this.customInput.focus();
      return;
    }
    this.handleAction('custom', instruction);
  }
}

// ─── Initialise once ──────────────────────────────────────────────────────────

if (!window.__kairoLoaded) {
  window.__kairoLoaded = true;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new KairoContentUI());
  } else {
    new KairoContentUI();
  }
}
