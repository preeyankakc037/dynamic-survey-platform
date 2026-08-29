/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
        },
        accent: '#06B6D4',
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
        },
        border: '#E2E8F0',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
      }
    },
  },
  plugins: [],
}
