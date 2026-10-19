import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#0B1220',
  surface: '#111827',
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  accent: '#22D3EE',
  muted: '#94A3B8',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  border: '#1F2937',
  white: '#FFFFFF',
  text: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const globalStyles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  row: {
    flexDirection: 'row',
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWhite: {
    color: colors.white,
  },
  textMuted: {
    color: colors.muted,
  },
  textPrimary: {
    color: colors.primary,
  },
});
