/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6ff',
          300: '#a4baf8',
          400: '#7a96f3',
          500: '#5572e8',
          600: '#3f54dc',
          700: '#3341c8',
          800: '#2c37a3',
          900: '#1e2461',
          950: '#0f1233',
        },
        teal: {
          50: '#f0fdfc',
          100: '#ccfbf8',
          200: '#99f6f0',
          300: '#5eeae3',
          400: '#2dd4cc',
          500: '#14b8b0',
          600: '#0d9490',
          700: '#0f7572',
          800: '#115e5b',
          900: '#134e4b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 16px 0 rgba(15, 18, 51, 0.08)',
        'card-hover': '0 8px 32px 0 rgba(15, 18, 51, 0.14)',
        'glow': '0 0 24px 0 rgba(13, 148, 144, 0.25)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #f0f4ff 0%, #f0fdfc 50%, #f8faff 100%)',
        'nav-blur': 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
