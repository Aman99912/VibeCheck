/**
 * Colors.js
 * Central color palette for Vibe-Match.
 * Import this file everywhere instead of hardcoding color strings.
 */

const Colors = {
  // ─── Brand / Primary ───────────────────────────────────────────────────────
  primary: '#246BFD',        // main brand blue
  primaryDark: '#1A56DB',
  primaryLight: '#E9F0FF',
  primaryGhost: 'rgba(36, 107, 253, 0.08)', // semi-transparent brand blue (8%)

  // ─── Secondary / Accent ────────────────────────────────────────────────────
  secondary: '#0A1629',      // dark navy for primary-dark elements / secondary buttons
  secondaryDark: '#070F1C',
  secondaryLight: '#E4E9F2',

  accent: '#10B981',         // vibrant green
  accentDark: '#059669',

  // ─── Neutral / Gray Scale ──────────────────────────────────────────────────
  white: '#FFFFFF',
  offWhite: '#F8F9FA',
  surface: '#F4F6F9',        // card / list / tab background
  border: '#E4E9F2',         // soft border
  placeholder: '#8F9BB3',
  disabled: '#C5CEE0',       // disabled buttons / inputs

  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E4E9F2',
  gray400: '#C5CEE0',
  gray500: '#8F9BB3',
  gray600: '#6B7280',
  gray700: '#4B5563',
  gray800: '#374151',
  gray900: '#1F2937',

  // ─── Text ──────────────────────────────────────────────────────────────────
  textPrimary: '#0A1629',    // dark navy text
  textSecondary: '#4A5468',  // slate grey text
  textMuted: '#8F9BB3',      // muted grey/blue text
  textInverse: '#FFFFFF',
  textLink: '#246BFD',

  // ─── Background ────────────────────────────────────────────────────────────
  background: '#FFFFFF',
  backgroundDark: '#0A1629',

  // ─── Semantic / Status ─────────────────────────────────────────────────────
  success: '#10B981',
  successLight: '#E6F9F0',
  warning: '#FF9500',
  warningLight: '#FFEEDB',
  error: '#EF4444',
  errorLight: '#FCE8E8',
  info: '#00A3FF',
  infoLight: '#E5F6FF',

  // ─── Transparent ───────────────────────────────────────────────────────────
  transparent: 'transparent',
  overlay: 'rgba(0,0,0,0.45)',
  overlayLight: 'rgba(0,0,0,0.15)',
};

export default Colors;
