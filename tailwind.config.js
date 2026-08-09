/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          pink: '#FF10F0',
          purple: '#9D4EDD',
          light: '#E0AAFF',
          dark: '#5A189A',
        },
        neutral: {
          black: '#0F0F1E',
          darkGray: '#1A1A2E',
          gray: '#2D2D44',
          lightGray: '#E8E8F0',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-delay': 'float 7s ease-in-out infinite 1s',
        'float-delay-2': 'float 8s ease-in-out infinite 2s',
        pulse: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        slideIn: 'slideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        slideInDelay1: 'slideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards',
        slideInDelay2: 'slideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s forwards',
        slideInDelay3: 'slideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
};
