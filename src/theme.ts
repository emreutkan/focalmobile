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
      background: '#FFFFFF',
      surface: '#F2F2F7',
      card: '#FFFFFF',
      
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
      
      // Borders & dividers
      border: '#C6C6C8',
      divider: '#E5E5EA',
      
      // Overlays
      overlay: 'rgba(0, 0, 0, 0.5)',
      backdrop: 'rgba(0, 0, 0, 0.3)',
    },
    
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    
    borderRadius: {
      none: 0,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999,
    },
    
    typography: {
      // Font families
      fontFamily: {
        regular: 'System',
        medium: 'System-Medium',
        semibold: 'System-Semibold',
        bold: 'System-Bold',
      },
      
      // Font sizes
      fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
      },
      
      // Line heights
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
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
      },
    },
  } as const;
  
  // Type helper
  export type Theme = typeof theme;
 