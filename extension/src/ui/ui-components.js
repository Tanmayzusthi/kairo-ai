/**
 * ui-components.js
 * Reusable UI components for Kairo AI (Claude-inspired)
 */

export class KairoUIComponents {
  static createCard(title, content) {
    return `
      <div class="kairo-card" style="
        background: #FFFFFF;
        border: 1px solid #E5E7EB;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      ">
        <h3 style="margin-top:0; font-size:16px; font-weight:600; color:#1F2937;">${title}</h3>
        <div style="color:#4B5563; font-size:14px; line-height:1.6;">${content}</div>
      </div>
    `;
  }

  static createButton(label, variant = 'secondary') {
    const isPrimary = variant === 'primary';
    return `
      <button class="kairo-button-${variant}" style="
        background: ${isPrimary ? '#2563EB' : '#F3F4F6'};
        color: ${isPrimary ? '#FFFFFF' : '#374151'};
        border: 1px solid ${isPrimary ? '#2563EB' : '#D1D5DB'};
        border-radius: 8px;
        padding: 10px 16px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 150ms ease;
      ">${label}</button>
    `;
  }
}
