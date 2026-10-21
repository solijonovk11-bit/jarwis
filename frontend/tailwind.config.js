/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          dark: '#030712',
          navy: '#060d1a',
          cyan: '#00f3ff',
          blue: '#0066ff',
          glow: 'rgba(0, 243, 255, 0.4)',
          border: 'rgba(0, 243, 255, 0.25)',
          surface: 'rgba(6, 13, 26, 0.75)',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'spin-reverse': 'spin-reverse 15s linear infinite',
      },
      keyframes: {
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        }
      }
    },
  },
  plugins: [],
}
