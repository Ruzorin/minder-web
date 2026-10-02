/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./script.js"],
  theme: {
    extend: {
      colors: {
        'minder-bg': '#0a0e1a',
        'minder-surface': '#111726',
        'minder-line': '#1b2440',
        'minder-accent': '#7c5cff',
        'minder-accent2': '#22d3ee',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
