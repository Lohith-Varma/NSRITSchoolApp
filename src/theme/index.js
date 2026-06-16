import {MD3LightTheme} from 'react-native-paper';
import animations from './animations';
import colors from './colors';
import globalStyles from './globalStyles';
import radius from './radius';
import shadows from './shadows';
import spacing from './spacing';
import typography from './typography';

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.danger,
    outline: colors.border,
    outlineVariant: colors.border,
    onSurface: colors.text,
    onSurfaceVariant: colors.textMuted,
  },
  roundness: radius.md,
};

export {animations, colors, globalStyles, radius, shadows, spacing, typography};
