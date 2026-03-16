import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fefbf3',
          100: '#fdf6e7',
          200: '#faebc4',
          300: '#f6d896',
          400: '#f1c05d',
          500: '#e8a832',
          600: '#d8921a',
          700: '#b37315',
          800: '#8f5a18',
          900: '#754a17',
        },
        champagne: {
          50: '#fefdfb',
          100: '#fdfaf5',
          200: '#faf3e6',
          300: '#f5e6cc',
          400: '#eed1a8',
          500: '#e4b87a',
          600: '#d99d5a',
          700: '#b87d45',
          800: '#96663a',
          900: '#7a5433',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
