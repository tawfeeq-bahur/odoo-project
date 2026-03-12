// ─── TourJet Color Palette ───────────────────────────────────────────────────
export const COLORS = {
  // Primary brand
  primary: '#6366f1',       // indigo-500
  primaryDark: '#4f46e5',   // indigo-600
  primaryLight: '#818cf8',  // indigo-400
  primaryBg: '#eef2ff',     // indigo-50

  // Accent
  accent: '#06b6d4',        // cyan-500
  accentDark: '#0891b2',    // cyan-600

  // Semantic
  success: '#22c55e',       // green-500
  successBg: '#dcfce7',
  warning: '#f59e0b',       // amber-500
  warningBg: '#fef3c7',
  danger: '#ef4444',        // red-500
  dangerBg: '#fee2e2',
  info: '#3b82f6',          // blue-500
  infoBg: '#dbeafe',

  // Background layers
  background: '#0f172a',    // slate-900
  surface: '#1e293b',       // slate-800
  surfaceAlt: '#334155',    // slate-700
  card: '#1e293b',

  // Text
  textPrimary: '#f1f5f9',   // slate-100
  textSecondary: '#94a3b8', // slate-400
  textMuted: '#64748b',     // slate-500
  textInverse: '#0f172a',

  // Borders
  border: '#334155',        // slate-700
  borderLight: '#475569',   // slate-600

  // Status badges
  statusActive: '#22c55e',
  statusPending: '#f59e0b',
  statusCompleted: '#6366f1',
  statusCancelled: '#ef4444',
  statusOngoing: '#06b6d4',

  // Chart colors
  chart1: '#6366f1',
  chart2: '#06b6d4',
  chart3: '#22c55e',
  chart4: '#f59e0b',
  chart5: '#ec4899',
  chartBg: 'rgba(99,102,241,0.15)',

  // White / black
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // Dim/tinted backgrounds (dark-mode aware)
  primaryDim: 'rgba(99,102,241,0.15)',
  successDim: 'rgba(34,197,94,0.15)',
  warningDim: 'rgba(245,158,11,0.15)',
  dangerDim: 'rgba(239,68,68,0.15)',
};

// ─── Typography Scale ─────────────────────────────────────────────────────────
export const FONTS = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

// ─── Border Radius ────────────────────────────────────────────────────────────
export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
};
