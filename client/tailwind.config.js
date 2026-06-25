/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pink-150': '#f9e7f7',
        'ink': '#1a1a1a',
        'magenta': '#e33286',
        'line': 'rgba(0, 0, 0, 0.1)'
      },
      fontFamily: {
        body: ['Outfit', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
      }
    },
  },
  plugins: [],
}
