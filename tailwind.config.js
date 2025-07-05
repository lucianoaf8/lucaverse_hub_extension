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
        // Original cyan/blue theme colors
        primary: {
          50: '#ecfeff',
          100: '#cffafe', 
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee', // --accent-primary: #00bcd4 equivalent
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        secondary: {
          50: '#f0fdff',
          100: '#ccf7fe',
          200: '#99eefd',
          300: '#66e2fa',
          400: '#22d3ee', // --accent-success: #00ffff equivalent
          500: '#00bcd4', // Original --accent-primary
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        accent: {
          50: '#f0fdff',
          100: '#ccf7fe',
          200: '#99eefd',
          300: '#66e2fa',
          400: '#22d3ee',
          500: '#00e5ff', // --accent-info
          600: '#00bcd4',
          700: '#0891b2',
          800: '#0e7490',
          900: '#164e63',
        },
        
        // Priority colors from original system
        priority: {
          1: '#ff1744', // Critical
          2: '#ff6d00', // High  
          3: '#ffc107', // Medium
          4: '#00c853', // Low
          5: '#00ffff', // Minimal
        },
        
        // Alert colors
        success: '#00ffff',
        warning: '#ffc107', 
        danger: '#ff1744',
        info: '#00e5ff',
        
        // Text colors matching original variables
        text: {
          primary: '#f4f4f5',
          secondary: '#d4d4d8',
          muted: 'rgba(244, 244, 245, 0.6)',
          disabled: 'rgba(244, 244, 245, 0.3)',
        },
        
        // Glass effect colors
        glass: {
          border: 'rgba(0, 255, 255, 0.1)',
          light: 'rgba(0, 255, 255, 0.08)',
          medium: 'rgba(0, 255, 255, 0.15)',
          dark: 'rgba(0, 255, 255, 0.25)',
          overlay: 'rgba(0, 229, 255, 0.02)',
        },
        
        // Background system
        background: {
          primary: '#0a0f1a',
          secondary: '#0f1419', 
          tertiary: '#050b12',
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
      
      // Box shadow system matching original
      boxShadow: {
        'glass-sm': '0 2px 8px rgba(0, 255, 255, 0.1)',
        'glass-md': '0 4px 20px rgba(0, 255, 255, 0.15)',
        'glass-lg': '0 8px 40px rgba(0, 255, 255, 0.2)',
        'glass-glow': '0 0 20px rgba(0, 255, 255, 0.6)',
        'glass-hover': '0 0 30px rgba(0, 255, 255, 0.5)',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 255, 0.6)' },
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