/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0D0D0D',
        card: '#1C1C1E',
        accent: '#FF6B35',
        success: '#34C759',
        info: '#007AFF',
        'text-primary': '#FFFFFF',
        'text-secondary': '#8E8E93',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
