/**
 * design-tokens.js
 * Core UI variables for Kairo AI (Claude-inspired)
 */

export const DESIGN_TOKENS = {
  colors: {
    bg: '#FFFFFF',
    surface: '#F7F7F7',
    border: '#E5E7EB',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    accent: '#2563EB',
    accentHover: '#1D4ED8',
    accentLight: '#DBEAFE',
    error: '#DC2626',
    errorBg: '#FEE2E2',
    errorBorder: '#FECACA',
    success: '#16A34A',
    hover: '#F3F4F6'
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
    fontSizeDisplay: '24px',
    fontSizeBody: '16px',
    fontSizeSmall: '14px',
    fontSizeCode: '13px',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightBold: '600',
    lineHeightDisplay: '1.3',
    lineHeightBody: '1.6',
    lineHeightCode: '1.5'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '20px',
    xl: '24px'
  },
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px'
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 40px rgba(0, 0, 0, 0.1)'
  },
  transitions: {
    fast: '150ms ease',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms ease-in'
  }
};
