/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./src/popup/**/*.{js,jsx}",
    "./src/content/**/*.{js,jsx}",
    "./src/background/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      // Custom colors for your Labubu theme
      colors: {
        labubu: {
          primary: '#007bff',
          secondary: '#6c757d',
          accent: '#ff6b6b'
        }
      },
      // Custom sizing for popup
      width: {
        'popup': '300px'
      },
      height: {
        'popup': '400px'
      }
    },
  },
  plugins: [],
} 