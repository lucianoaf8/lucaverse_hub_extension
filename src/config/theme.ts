/**
 * Core Theme Configuration
 * Centralized theme system with all design tokens
 */

export interface ThemeColors {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  success: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  warning: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  danger: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
}

export interface ThemeTypography {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeight: {
    thin: string;
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
  };
  lineHeight: {
    none: string;
    tight: string;
    snug: string;
    normal: string;
    relaxed: string;
    loose: string;
  };
}

export interface ThemeSpacing {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface ThemeShadows {
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

// Background system interface
export interface ThemeBackgrounds {
  gradients: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    hero: string;
    subtle: string;
  };
  patterns: {
    dots: string;
    grid: string;
    noise: string;
    diagonal: string;
  };
  backdrop: {
    blur: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    opacity: {
      light: string;
      medium: string;
      heavy: string;
    };
  };
}

export interface ThemeAnimations {
  keyframes: {
    fadeIn: Record<string, Record<string, string>>;
    fadeOut: Record<string, Record<string, string>>;
    slideUp: Record<string, Record<string, string>>;
    slideDown: Record<string, Record<string, string>>;
    slideLeft: Record<string, Record<string, string>>;
    slideRight: Record<string, Record<string, string>>;
    scaleIn: Record<string, Record<string, string>>;
    scaleOut: Record<string, Record<string, string>>;
    pulse: Record<string, Record<string, string>>;
    bounce: Record<string, Record<string, string>>;
    spin: Record<string, Record<string, string>>;
    ping: Record<string, Record<string, string>>;
  };
  duration: {
    fast: string;
    base: string;
    slow: string;
    slower: string;
  };
  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bouncy: string;
    elastic: string;
  };
}

// Interactive states interface
export interface ThemeInteractions {
  hover: {
    scale: string;
    brightness: string;
    shadow: string;
    transition: string;
  };
  focus: {
    ringWidth: string;
    ringColor: string;
    ringOpacity: string;
    ringOffset: string;
  };
  active: {
    scale: string;
    brightness: string;
  };
  disabled: {
    opacity: string;
    cursor: string;
    grayscale: string;
  };
}

export interface ThemeBreakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  backgrounds: ThemeBackgrounds;
  animations: ThemeAnimations;
  interactions: ThemeInteractions;
  breakpoints: ThemeBreakpoints;
}

export interface ThemeVariants {
  light: Theme;
  dark: Theme;
}

// Light theme configuration
const lightTheme: Theme = {
  colors: {
    primary: {
      50: '#f0fdff',
      100: '#ccf7fe',
      200: '#99eefd',
      300: '#5ce1fc',
      400: '#22c8f3',
      500: '#0070b9',
      600: '#0284b6',
      700: '#026b94',
      800: '#065879',
      900: '#0a4a67',
    },
    secondary: {
      50: '#e0ffff',
      100: '#b3ffff',
      200: '#80ffff',
      300: '#4dffff',
      400: '#26ffff',
      500: '#00ffff',
      600: '#00e6e6',
      700: '#00cccc',
      800: '#00b3b3',
      900: '#008080',
    },
    success: {
      50: '#e8f5e9',
      100: '#c8e6c9',
      200: '#a5d6a7',
      300: '#81c784',
      400: '#66bb6a',
      500: '#4caf50',
      600: '#43a047',
      700: '#388e3c',
      800: '#2e7d32',
      900: '#1b5e20',
    },
    warning: {
      50: '#fff8e1',
      100: '#ffecb3',
      200: '#ffe082',
      300: '#ffd54f',
      400: '#ffca28',
      500: '#ffc107',
      600: '#ffb300',
      700: '#ffa000',
      800: '#ff8f00',
      900: '#ff6f00',
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#dc2626',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      950: '#121212',
    },
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  backgrounds: {
    gradients: {
      primary: 'linear-gradient(135deg, #00bcd4 0%, #00acc1 100%)',
      secondary: 'linear-gradient(135deg, #00ffff 0%, #00e6e6 100%)',
      success: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      warning: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
      danger: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
      hero: 'radial-gradient(circle at top right, #00bcd4, #006064)',
      subtle: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    },
    patterns: {
      dots: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
      grid: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
      noise: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.4\'/%3E%3C/svg%3E")',
      diagonal: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #e2e8f0 2px, #e2e8f0 4px)',
    },
    backdrop: {
      blur: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },
      opacity: {
        light: '0.8',
        medium: '0.6',
        heavy: '0.4',
      },
    },
  },
  animations: {
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      fadeOut: {
        '0%': { opacity: '1' },
        '100%': { opacity: '0' },
      },
      slideUp: {
        '0%': { transform: 'translateY(10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideDown: {
        '0%': { transform: 'translateY(-10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideLeft: {
        '0%': { transform: 'translateX(10px)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      slideRight: {
        '0%': { transform: 'translateX(-10px)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      scaleOut: {
        '0%': { transform: 'scale(1)', opacity: '1' },
        '100%': { transform: 'scale(0.95)', opacity: '0' },
      },
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
      },
      bounce: {
        '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
        '40%, 43%': { transform: 'translate3d(0, -30px, 0)' },
        '70%': { transform: 'translate3d(0, -15px, 0)' },
      },
      spin: {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
      ping: {
        '75%, 100%': { transform: 'scale(2)', opacity: '0' },
      },
    },
    duration: {
      fast: '150ms',
      base: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },
  interactions: {
    hover: {
      scale: '1.05',
      brightness: '1.1',
      shadow: 'var(--shadow-lg)',
      transition: 'var(--animation-duration-base)',
    },
    focus: {
      ringWidth: '2px',
      ringColor: 'var(--color-primary-500)',
      ringOpacity: '0.5',
      ringOffset: '2px',
    },
    active: {
      scale: '0.98',
      brightness: '0.95',
    },
    disabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
      grayscale: '100%',
    },
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Dark theme configuration (cyan theme)
const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    primary: {
      50: '#f0fdff',
      100: '#ccf7fe',
      200: '#99eefd',
      300: '#5ce1fc',
      400: '#22c8f3',
      500: '#38bdf8',
      600: '#0ea5e9',
      700: '#0284b6',
      800: '#026b94',
      900: '#0a4a67',
    },
    secondary: {
      50: '#e0ffff',
      100: '#b3ffff',
      200: '#80ffff',
      300: '#4dffff',
      400: '#26ffff',
      500: '#00ffff',
      600: '#00e6e6',
      700: '#00cccc',
      800: '#00b3b3',
      900: '#008080',
    },
    success: {
      50: '#e0ffff',
      100: '#b3ffff',
      200: '#80ffff',
      300: '#4dffff',
      400: '#26ffff',
      500: '#00ffff',
      600: '#00e6e6',
      700: '#00cccc',
      800: '#00b3b3',
      900: '#008080',
    },
    warning: {
      50: '#fffde7',
      100: '#fff9c4',
      200: '#fff59d',
      300: '#fff176',
      400: '#ffee58',
      500: '#ffeb3b',
      600: '#fdd835',
      700: '#fbc02d',
      800: '#f9a825',
      900: '#f57f17',
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#dc2626',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#0a0f1a',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 255, 255, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 255, 255, 0.1), 0 1px 2px 0 rgba(0, 255, 255, 0.06)',
    md: '0 4px 6px -1px rgba(0, 255, 255, 0.1), 0 2px 4px -1px rgba(0, 255, 255, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 255, 255, 0.1), 0 4px 6px -2px rgba(0, 255, 255, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 255, 255, 0.1), 0 10px 10px -5px rgba(0, 255, 255, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 255, 255, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 255, 255, 0.06)',
    none: 'none',
  },
  backgrounds: {
    gradients: {
      primary: 'linear-gradient(135deg, #00bcd4 0%, #006064 100%)',
      secondary: 'linear-gradient(135deg, #00ffff 0%, #008080 100%)',
      success: 'linear-gradient(90deg, #00ffff 0%, #00cccc 100%)',
      warning: 'linear-gradient(90deg, #ffeb3b 0%, #f9a825 100%)',
      danger: 'linear-gradient(90deg, #e91e63 0%, #ad1457 100%)',
      hero: 'radial-gradient(circle at center, #00bcd4, #003d40)',
      subtle: 'linear-gradient(135deg, #0a0e17 0%, #0d111b 100%)',
    },
    patterns: {
      dots: 'radial-gradient(circle, #00bcd4 1px, transparent 1px)',
      grid: 'linear-gradient(#0d111b 1px, transparent 1px), linear-gradient(90deg, #0d111b 1px, transparent 1px)',
      noise: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.2\'/%3E%3C/svg%3E")',
      diagonal: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #0d111b 2px, #0d111b 4px)',
    },
    backdrop: {
      blur: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },
      opacity: {
        light: '0.9',
        medium: '0.7',
        heavy: '0.5',
      },
    },
  },
  interactions: {
    hover: {
      scale: '1.05',
      brightness: '1.2',
      shadow: 'var(--shadow-lg)',
      transition: 'var(--animation-duration-base)',
    },
    focus: {
      ringWidth: '2px',
      ringColor: 'var(--color-primary-500)',
      ringOpacity: '0.6',
      ringOffset: '2px',
    },
    active: {
      scale: '0.98',
      brightness: '0.9',
    },
    disabled: {
      opacity: '0.4',
      cursor: 'not-allowed',
      grayscale: '100%',
    },
  },
};

export const themeVariants: ThemeVariants = {
  light: lightTheme,
  dark: darkTheme,
};

export type ThemeVariant = keyof ThemeVariants;

export const defaultTheme: ThemeVariant = 'dark';