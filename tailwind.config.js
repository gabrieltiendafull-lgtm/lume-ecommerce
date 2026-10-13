/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lume: {
          50: '#faf7f2',
          100: '#f4ede1',
          200: '#e8dcbe',
          300: '#dac594',
          400: '#caab6c',
          500: '#b8944f',
          600: '#9d7940',
          700: '#7e5e34',
          800: '#674c2e',
          900: '#543f29',
          950: '#2e2013',
        },
        sand: '#F7F5F0',
        charcoal: '#1A1817',
        terracotta: '#C86D51',
        warmgold: '#D4AF37'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
