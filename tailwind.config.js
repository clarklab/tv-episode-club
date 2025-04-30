/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'special-gothic': ['Special Gothic', 'sans-serif'],
        'special-gothic-condensed': ['Special Gothic Condensed One', 'sans-serif'],
        'special-gothic-expanded': ['Special Gothic Expanded One', 'sans-serif']
      }
    },
  },
  plugins: [],
} 