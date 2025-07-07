/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Enhanced color system matching original CSS variables
      colors: {
        // Priority colors from original system
        priority: {
          1: '#ff1744', // Critical
          2: '#ff6d00', // High  
          3: '#ffc107', // Medium
          4: '#00c853', // Low
          5: '#00ffff', // Minimal
        },
        
        // Theme-aware colors (CSS custom properties)
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: 'var(--color-primary-alpha-2)',
          100: 'var(--color-primary-alpha-4)',
          200: 'var(--color-primary-alpha-8)',
          300: 'var(--color-primary-alpha-12)',
          400: 'var(--color-primary)',
          500: 'var(--color-primary)',
          600: 'var(--color-primary)',
          700: 'var(--color-primary)',
          800: 'var(--color-primary)',
          900: 'var(--color-primary)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          50: 'var(--color-secondary-alpha-2)',
          100: 'var(--color-secondary-alpha-4)',
          200: 'var(--color-secondary-alpha-8)',
          300: 'var(--color-secondary-alpha-12)',
          400: 'var(--color-secondary)',
          500: 'var(--color-secondary)',
          600: 'var(--color-secondary)',
          700: 'var(--color-secondary)',
          800: 'var(--color-secondary)',
          900: 'var(--color-secondary)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          50: 'var(--color-accent-alpha-2)',
          100: 'var(--color-accent-alpha-4)',
          200: 'var(--color-accent-alpha-8)',
          300: 'var(--color-accent-alpha-12)',
          400: 'var(--color-accent)',
          500: 'var(--color-accent)',
          600: 'var(--color-accent)',
          700: 'var(--color-accent)',
          800: 'var(--color-accent)',
          900: 'var(--color-accent)',
        },
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: {
          DEFAULT: 'var(--color-text)',
          primary: 'var(--color-text)',
          secondary: 'var(--color-textSecondary)',
          muted: 'var(--color-textSecondary)',
          disabled: 'var(--color-textSecondary)',
        },
        textSecondary: 'var(--color-textSecondary)', 
        border: 'var(--color-border)',
        error: {
          DEFAULT: 'var(--color-error)',
          400: 'var(--color-error)',
          500: 'var(--color-error)',
          600: 'var(--color-error)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          400: 'var(--color-warning)',
          500: 'var(--color-warning)',
          600: 'var(--color-warning)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          400: 'var(--color-success)',
          500: 'var(--color-success)',
          600: 'var(--color-success)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          400: 'var(--color-info)',
          500: 'var(--color-info)',
          600: 'var(--color-info)',
        },
        
        // Glass effect colors - using theme-aware CSS custom properties
        glass: {
          border: 'var(--color-border)',
          light: 'var(--color-primary-alpha-8)',
          medium: 'var(--color-primary-alpha-12)',
          dark: 'var(--color-primary-alpha-20)',
          overlay: 'var(--color-accent-alpha-2)',
        },
        
        // Background system - using theme-aware CSS custom properties
        background: {
          DEFAULT: 'var(--color-background)',
          primary: 'var(--color-background)',
          secondary: 'var(--color-surface)',
          tertiary: 'var(--color-background)',
        },
      },
      
      // Typography matching original font system
      fontFamily: {
        primary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      // Font sizes matching original --font-* variables  
      fontSize: {
        'xs': ['11px', '1.4'],
        'sm': ['13px', '1.5'],
        'base': ['15px', '1.6'],
        'md': ['16px', '1.6'],
        'lg': ['18px', '1.6'],
        'xl': ['20px', '1.6'],
        '2xl': ['24px', '1.5'],
        '3xl': ['28px', '1.4'],
        '4xl': ['32px', '1.3'],
        
        // Header-specific sizes
        'header-title': ['32px', '1.2'],
        'header-search': ['16px', '1.5'],
        'header-phrase': ['20px', '1.4'],
        'header-primary-info': ['28px', '1.2'],
        'header-secondary-info': ['16px', '1.4'],
        'header-weather-temp': ['20px', '1.3'],
        'header-weather-desc': ['14px', '1.4'],
      },
      
      // Font weights matching original system
      fontWeight: {
        primary: '600',
        secondary: '500', 
        tertiary: '400',
      },
      
      // Spacing system matching --space-* variables
      spacing: {
        'xs': '4px',
        'sm': '8px', 
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'xxl': '24px',
        
        // Additional Tailwind spacing
        '18': '4.5rem',
        '88': '22rem', 
        '112': '28rem',
        '128': '32rem',
      },
      
      // Border radius matching --radius-* variables
      borderRadius: {
        'sm': '4px',
        'md': '6px', 
        'lg': '8px',
        'xl': '12px',
        'full': '50%',
        '4xl': '2rem',
      },
      
      // Box shadow system matching original - using theme-aware CSS custom properties
      boxShadow: {
        'glass-sm': 'var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.1))',
        'glass-md': 'var(--shadow-md, 0 4px 20px rgba(0, 0, 0, 0.15))',
        'glass-lg': 'var(--shadow-lg, 0 8px 40px rgba(0, 0, 0, 0.2))',
        'glass-glow': 'var(--shadow-xl, 0 0 20px rgba(0, 0, 0, 0.6))',
        'glass-hover': '0 0 30px var(--color-primary-alpha-50)',
      },
      
      // Backdrop blur for glassmorphism
      backdropBlur: {
        'xs': '2px',
        'glass': '16px',
      },
      
      // Backdrop saturate for glassmorphism  
      backdropSaturate: {
        'glass': '180%',
      },
      
      // Animation system
      animation: {
        // Original animations
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out', 
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        
        // Particle and neural network animations
        'particle-float': 'particleFloat 10s infinite linear',
        'neural-pulse': 'neuralPulse 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        
        // Glass panel animations
        'glass-appear': 'glassAppear 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'glass-hover': 'glassHover 0.3s ease',
      },
      
      // Keyframes for animations
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
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        particleFloat: {
          '0%': { transform: 'translateY(100vh) translateX(0px)', opacity: '0' },
          '10%': { opacity: '0.3' },
          '90%': { opacity: '0.3' },
          '100%': { transform: 'translateY(-100px) translateX(100px)', opacity: '0' },
        },
        neuralPulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px var(--color-primary-alpha-30)' },
          '50%': { boxShadow: '0 0 40px var(--color-primary-alpha-60)' },
        },
        glassAppear: {
          '0%': { 
            opacity: '0', 
            transform: 'scale(0.95)',
            backdropFilter: 'blur(0px) saturate(100%)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale(1)',
            backdropFilter: 'blur(16px) saturate(180%)'
          },
        },
        glassHover: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-2px)' },
        },
      },
      
      // Transition timing
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms', 
        'slow': '500ms',
      },
      
      // Z-index system
      zIndex: {
        'background': '0',
        'neural': '1', 
        'content': '2',
        'header': '10',
        'modal': '1000',
        'notification': '1100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}