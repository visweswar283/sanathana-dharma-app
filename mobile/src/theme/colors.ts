export const COLORS = {
  // App backgrounds
  bgDeep: '#0F0500',
  bgMid: '#1A0A00',
  bgLight: '#2D1500',

  // Sacred saffron / gold — Hanuma's palette
  saffron: '#FF6B00',
  saffronLight: '#FF8C42',
  gold: '#FFD700',
  goldDim: '#C8A000',

  // Text
  textWhite: '#FFFFFF',
  textCream: '#F5E6D0',
  textMuted: '#A08060',
  textGold: '#FFD700',

  // User chat bubble
  bubbleUser: 'rgba(255, 107, 0, 0.18)',
  bubbleUserBorder: 'rgba(255, 107, 0, 0.4)',

  // Deity chat bubble
  bubbleDeity: 'rgba(255, 215, 0, 0.08)',
  bubbleDeityBorder: 'rgba(255, 215, 0, 0.25)',

  // Input bar
  inputBg: 'rgba(255, 255, 255, 0.07)',
  inputBorder: 'rgba(255, 107, 0, 0.35)',

  // Dividers / borders
  divider: 'rgba(255, 215, 0, 0.12)',

  // Status
  error: '#FF4444',
  success: '#44BB44',

  // Deity-specific (for future deities)
  deities: {
    hanuma: { primary: '#FF6B00', accent: '#FFD700', glow: '#FF8C42' },
    shiva: { primary: '#6B7FFF', accent: '#C0C0FF', glow: '#8899FF' },
    vishnu: { primary: '#1A4FBF', accent: '#FFD700', glow: '#3366CC' },
    vinayaka: { primary: '#FF8C00', accent: '#FFD700', glow: '#FFAA33' },
    brahma: { primary: '#DC143C', accent: '#FFD700', glow: '#FF3366' },
  },
} as const;
