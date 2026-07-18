/**
 * Design tokens for the app. Single dark theme for v1 — kept as a flat token
 * object so a light theme / theme switching can be layered on later.
 */

export const colors = {
  // Surfaces
  bg: '#0B0F1A',
  surface: '#121826',
  surfaceAlt: '#1B2333',
  border: '#26304A',

  // Text
  text: '#F2F5FA',
  textMuted: '#9AA6BF',
  textFaint: '#5E6B87',

  // Brand / accents
  primary: '#5B8DEF',
  primaryDim: '#33507F',
  success: '#3FB984',
  warning: '#E0A63C',
  danger: '#E5657A',

  // Muscle-role chips
  rolePrimary: '#5B8DEF',
  roleSecondary: '#6B7794',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const font = {
  h1: 28,
  h2: 22,
  h3: 18,
  body: 15,
  small: 13,
  tiny: 11,
} as const;

export const theme = { colors, spacing, radius, font };
export type Theme = typeof theme;
