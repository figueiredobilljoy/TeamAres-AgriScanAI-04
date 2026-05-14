/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f3f8ef',
          100: '#deecd5',
          200: '#bfd9ae',
          300: '#97bf7e',
          400: '#6fa14f',
          500: '#568a38',
          600: '#416d2a',
          700: '#345724',
          800: '#2c4721',
          900: '#243b1d',
        },
        soil: '#7a5a38',
      },
      boxShadow: {
        soft: '0 24px 70px -30px rgba(36, 59, 29, 0.35)',
      },
    },
  },
  plugins: [],
};
