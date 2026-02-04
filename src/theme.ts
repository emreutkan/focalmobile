// theme.ts
export const theme = {
    colors: {
      // Primary palette
      primary: '#007AFF',
      primaryDark: '#0051D5',
      primaryLight: '#4DA2FF',

      // Secondary palette
      secondary: '#5856D6',
      secondaryDark: '#3634A3',
      secondaryLight: '#7D7AEA',

      // Neutrals
      background: '#fffdf5',
      surface: '#F2F2F7',
      card: '#FFFFFF',
      white: '#FFFFFF',

      // Text
      text: '#000000',
      textSecondary: '#3C3C43',
      textTertiary: '#8E8E93',
      placeholder: '#C7C7CC',

      // Semantic colors
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      info: '#007AFF',

      // Delete stage colors (escalating red tones)
      errorLight: '#FF6B6B',
      errorMedium: '#FF5252',
      errorDark: '#FF1744',
      errorDarkest: '#D50000',

      // Borders & dividers
      border: '#C6C6C8',
      divider: '#E5E5EA',

      // Overlays
      overlay: 'rgba(0, 0, 0, 0.5)',
      overlayLight: 'rgba(0, 0, 0, 0.1)',
      overlayDark: 'rgba(0, 0, 0, 0.7)',
      backdrop: 'rgba(0, 0, 0, 0.3)',
      whiteTranslucent: 'rgba(255, 255, 255, 0.9)',

      // Pro/Premium
      pro: '#FFD700',
      proDark: '#B8860B',
      proLight: '#FFE55C',
      proOverlay: 'rgba(255, 215, 0, 0.3)',
      proOverlayMedium: 'rgba(255, 215, 0, 0.4)',
      proOverlayLight: 'rgba(255, 215, 0, 0.2)',
    },

    // Accent card colors
    card: {
      dailySummary: '#4ecdc4',
      dailySummaryOverlay: 'rgba(78, 205, 196, 0.25)',
      proteinCard: '#ff9f1c',
      proteinCardOverlay: 'rgba(255, 159, 28, 0.25)',
      carbCard: '#CBF3F0',
      fatCard: '#ff6b6b',
      fatCardOverlay: 'rgba(255, 107, 107, 0.2)',
      yellowAccent: '#FFE66D',
    },

    spacing: {
      xxs: 2,
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },

    borderRadius: {
      none: 0,
      xs: 6,
      sm: 8,
      md: 12,
      lg: 14,
      xl: 16,
      '2xl': 20,
      '3xl': 24,
      full: 9999,
    },

    borderWidth: {
      thin: 1,
      base: 2,
      medium: 3,
      thick: 4,
    },

    // Component sizes
    sizes: {
      iconSm: 16,
      iconMd: 20,
      iconLg: 24,
      iconXl: 28,
      icon2xl: 32,
      icon3xl: 40,
      icon4xl: 44,
      icon5xl: 48,

      // Circular elements
      buttonSm: 36,
      buttonMd: 40,
      buttonLg: 44,
      buttonXl: 48,

      // Feature/card elements
      featureIcon: 52,
      heroIcon: 80,
      heroRing: 100,
      heroContainer: 110,
      orb: 120,

      // Progress dots
      progressDot: 12,
    },

    // Shadow offset values
    offsets: {
      sm: 4,
      md: 5,
    },

    typography: {
      // Font families
      fontFamily: {
        regular: 'Helvetica',
        medium: 'Helvetica-Medium',
        semibold: 'Helvetica-Semibold',
        bold: 'Helvetica-Bold',
      },

      // Font sizes
      fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 28,
        '4xl': 32,
        '5xl': 36,
        '6xl': 48,
        '7xl': 80,
      },

      // Line heights
      lineHeight: {
        none: 1,
        tight: 1.2,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.75,
        // Specific values
        xs: 18,
        sm: 22,
        base: 24,
        price: 52,
      },

      // Letter spacing
      letterSpacing: {
        tight: 1,
        normal: 2,
        wide: 3,
        wider: 4,
      },

      // Font weights
      fontWeight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
      },
    },

    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
      },
    },

    components: {
      button: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        minHeight: 48,
      },
      input: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        minHeight: 48,
      },
      card: {
        padding: 16,
        borderRadius: 12,
        gap: 12,
      },
    },

    layout: {
      containerPadding: 16,
      screenPadding: 20,
      maxWidth: 428, // iPhone 14 Pro Max width
    },

    animation: {
      duration: {
        fast: 150,
        normal: 300,
        slow: 500,
        slower: 600,
        slowest: 1500,
        drift: 2000,
        driftSlow: 3000,
      },
    },
  } as const;

  // Type helper
  export type Theme = typeof theme;
