import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export const FONTS = {
  regular: 'System',
  bold: 'System',
};

export const TYPE = StyleSheet.create({
  heading1: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textGold,
    letterSpacing: 0.5,
  },
  heading2: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textWhite,
    letterSpacing: 0.3,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textCream,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textCream,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  sanskrit: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textGold,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
});
