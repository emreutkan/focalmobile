// theme.ts

const primitives = {
  // 9-Step Neutral Scale (slightly tinted)
  neutral: {
    100: '#F5F5F7',
    200: '#EBEBEF',
    300: '#D1D1D6',
    400: '#AEAEB2',
    500: '#8E8E93',
    600: '#636366',
    700: '#48484A',
    800: '#3A3A3C',
    900: '#1C1C1E',
  },
  // Primary (Brand Blue)
  primary: {
    100: '#E5F1FF',
    300: '#99CBFF',
    500: '#007AFF',
    700: '#0051D5',
    900: '#002B73',
  },
  success: { 500: '#34C759' },
  warning: { 500: '#FF9500' },
  error: { 100: '#FFEBEB', 500: '#FF3B30', 700: '#D50000' },
  accent: {
    cyan: '#4ecdc4',
    orange: '#ff9f1c',
    teal: '#CBF3F0',
    yellow: '#FFE66D',
    gold: '#FFD700',
  }
};

const sharedTypography = {
  fontSize: {
    xs: 12,
    sm: 13,
    base: 16,
    lg: 20,
    xl: 25,
    '2xl': 31,
    '3xl': 39,
    '4xl': 49,
  },
  lineHeight: {
    tight: 20,
    snug: 24,
    normal: 28,
    loose: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  letterSpacing: {
    normal: 0,
    wide: 1,
  }
};

const sharedSpacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  '3xl': 48,
  '4xl': 56,
  '5xl': 64,
};

export const lightTheme = {
  dark: false,
  colors: {
    background: primitives.neutral[100],
    surface: '#FFFFFF',
    card: '#FFFFFF',
    border: primitives.neutral[300],
    divider: primitives.neutral[200],
    text: primitives.neutral[900],
    textSecondary: primitives.neutral[600],
    textTertiary: primitives.neutral[400],
    textInverse: '#FFFFFF',
    primary: primitives.primary[500],
    primaryHover: primitives.primary[700],
    primaryActive: primitives.primary[900],
    success: primitives.success[500],
    warning: primitives.warning[500],
    error: primitives.error[500],
    errorActive: primitives.error[700],
    // Darkened shadows for light mode as requested (0.3 instead of 0.2)
    overlayLight: 'rgba(28, 28, 30, 0.3)',
    overlayMedium: 'rgba(28, 28, 30, 0.5)',
    overlayDark: 'rgba(28, 28, 30, 0.8)',
  },
  card: {
    dailySummary: primitives.accent.cyan,
    proteinCard: primitives.accent.orange,
    carbCard: primitives.accent.teal,
    fatCard: '#FF6B6B',
    yellowAccent: primitives.accent.yellow,
    pro: primitives.accent.gold,
  },
  spacing: sharedSpacing,
  typography: sharedTypography,
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
    raised: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    }
  },
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
  interaction: {
    minTouchTarget: 44,
    buttonPaddingVertical: 12,
    buttonPaddingHorizontal: 24,
  }
};

export const darkTheme = {
  dark: true,
  colors: {
    background: '#000000',
    surface: primitives.neutral[900],
    card: primitives.neutral[800],
    border: primitives.neutral[700],
    divider: primitives.neutral[800],
    text: primitives.neutral[100],
    textSecondary: primitives.neutral[400],
    textTertiary: primitives.neutral[500],
    textInverse: primitives.neutral[900],
    primary: primitives.primary[500],
    primaryHover: primitives.primary[300],
    primaryActive: primitives.primary[100],
    success: primitives.success[500],
    warning: primitives.warning[500],
    error: primitives.error[500],
    errorActive: primitives.error[700],
    overlayLight: 'rgba(255, 255, 255, 0.1)',
    overlayMedium: 'rgba(255, 255, 255, 0.3)',
    overlayDark: 'rgba(255, 255, 255, 0.5)',
  },
  card: {
    dailySummary: primitives.accent.cyan,
    proteinCard: primitives.accent.orange,
    carbCard: primitives.accent.teal,
    fatCard: primitives.error[700],
    yellowAccent: primitives.accent.yellow,
    pro: primitives.accent.gold,
  },
  spacing: sharedSpacing,
  typography: sharedTypography,
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.4,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 12,
    },
    raised: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 4,
    }
  },
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
  interaction: {
    minTouchTarget: 44,
    buttonPaddingVertical: 12,
    buttonPaddingHorizontal: 24,
  }
};

// Default export for backward compatibility during migration
export const theme = lightTheme;
export type Theme = typeof lightTheme;