// Central design system for Qwen Hospital Management System.
// Import this anywhere instead of hardcoding colors, so the whole app
// stays visually consistent and can be re-themed from one place.

export const colors = {
  primary: '#15803d',       // hospital green - main brand color
  primaryDark: '#14532d',
  primaryLight: '#22c55e',
  accent: '#34d399',        // soft emerald accent
  success: '#16a34a',
  successBg: '#dcfce7',
  warning: '#f39c12',
  warningBg: '#fff8e1',
  danger: '#e74c3c',
  dangerBg: '#fdecea',
  info: '#0d9488',
  infoBg: '#ccfbf1',

  bgPage: '#f3f8f4',        // page background
  bgCard: '#ffffff',
  bgSidebar: '#38bdf8',     // ice blue sidebar, as requested
  bgSidebarActive: '#0ea5e9',

  textPrimary: '#1a2e22',
  textSecondary: '#5c6f76',
  textMuted: '#9aa8ad',
  textOnDark: '#e8f1f2',

  border: '#dfe9e2',
};

export const gradients = {
  header: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
  accent: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primaryLight} 100%)`,
};

export const shadow = {
  card: '0 2px 10px rgba(18, 44, 52, 0.08)',
  cardHover: '0 6px 18px rgba(18, 44, 52, 0.14)',
};

export const fontStack = "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

// Reusable style objects for common elements, so pages don't each
// reinvent card/button/badge styling slightly differently.
export const cardStyle = {
  background: colors.bgCard,
  borderRadius: '10px',
  boxShadow: shadow.card,
  padding: '24px',
};

export const primaryButton = {
  padding: '10px 20px',
  background: colors.primary,
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '14px',
};

export const secondaryButton = {
  ...primaryButton,
  background: '#fff',
  color: colors.primary,
  border: `1px solid ${colors.primary}`,
};

export function statusBadge(status) {
  const map = {
    SCHEDULED: { bg: '#ccfbf1', fg: '#0f766e' },
    COMPLETED: { bg: '#dcfce7', fg: '#166534' },
    CANCELLED: { bg: '#fdecea', fg: '#c62828' },
    PENDING: { bg: '#fff8e1', fg: '#f57f17' },
    PAID: { bg: '#e8f5e9', fg: '#2e7d32' },
    PARTIALLY_PAID: { bg: '#fff3e0', fg: '#e65100' },
    REFUNDED: { bg: '#ede7f6', fg: '#5e35b1' },
    WAITING: { bg: '#fff8e1', fg: '#f57f17' },
    IN_PROGRESS: { bg: '#ccfbf1', fg: '#0f766e' },
    DONE: { bg: '#e8f5e9', fg: '#2e7d32' },
  };
  const c = map[status] || { bg: '#eceff1', fg: '#546e7a' };
  return {
    background: c.bg,
    color: c.fg,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 700,
    display: 'inline-block',
  };
}
