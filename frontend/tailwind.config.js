/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts,css}',
    './public/**/*.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        soft: '0 12px 30px -12px rgb(15 23 42 / 0.25)'
      }
    }
  }
};
