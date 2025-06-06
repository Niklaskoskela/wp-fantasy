export const navMaxWidth = 1300;
export const contentMaxWidth = 1100;

// Common spacing values
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Common border radius values
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

// Common elevation/shadow levels
export const shadows = {
  card: '0 2px 12px rgba(0, 0, 0, 0.08)',
  cardHover: '0 4px 20px rgba(0, 0, 0, 0.12)',
  navbar: '0 2px 12px rgba(0, 0, 0, 0.1)',
  button: '0 2px 8px rgba(0, 0, 0, 0.15)',
  buttonHover: '0 4px 12px rgba(0, 0, 0, 0.15)',
} as const;

// Water polo specific colors for stats, positions, etc.
export const waterPoloColors = {
  positions: {
    goalkeeper: '#ff6b35',
    defender: '#004e89',
    midfielder: '#1a659e',
    attacker: '#f77b55',
  },
  stats: {
    goals: '#2e7d32',
    assists: '#1565c0',
    saves: '#7b1fa2',
    fouls: '#d32f2f',
  },
  teamColors: [
    '#1976d2', // Blue
    '#388e3c', // Green
    '#f57c00', // Orange
    '#7b1fa2', // Purple
    '#d32f2f', // Red
    '#0097a7', // Teal
    '#455a64', // Blue Grey
    '#8d6e63', // Brown
  ],
} as const;

// Typography scales
export const typography = {
  scale: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
