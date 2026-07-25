// Defines the shared GestaltView color palette used by the UI.
// New palette names are preferred, while legacy names stay available for compatibility.
export const colorPalette = {
  cyan: {
    accent: '#00E5FF',
    glow: 'rgba(0,229,255,0.22)',
  },
  teal: {
    accent: '#00FFD4',
    glow: 'rgba(0,255,212,0.22)',
  },
  emerald: {
    accent: '#32CD32',
    glow: 'rgba(50,205,50,0.22)',
  },
  electricPurple: {
    accent: '#B026FF',
    glow: 'rgba(176,38,255,0.22)',
  },
  neonPink: {
    accent: '#FF007F',
    glow: 'rgba(255,0,127,0.22)',
  },
  neonRed: {
    accent: '#FF2D55',
    glow: 'rgba(255,45,85,0.22)',
  },
  midnightBlue: {
    accent: '#191970',
    glow: 'rgba(25,25,112,0.22)',
  },
  blue: {
    accent: '#00D4FF',
    glow: 'rgba(0,212,255,0.22)',
  },
  purple: {
    accent: '#9945FF',
    glow: 'rgba(153,69,255,0.22)',
  },
  none: {
    accent: '#ffffff',
    glow: 'rgba(255,255,255,0.05)',
  },
} as const;

export type ColorName = keyof typeof colorPalette;
