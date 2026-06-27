/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nest: {
          50: '#fff1fa',
          100: '#ffe4f6',
          400: '#f65fbd',
          500: '#e93da7',
          600: '#c9278b',
          900: '#44113c',
          950: '#190b24',
        },
        coral: {
          50: '#fff1ed',
          100: '#ffe1d9',
          200: '#ffc3b6',
          300: '#ff9d8e',
          400: '#fb7268',
          500: '#f05b56',
          600: '#dc3f44',
        },
      },
      boxShadow: {
        glow: '0 20px 80px rgba(217, 70, 239, 0.22)',
        soft: '0 18px 45px rgba(244, 114, 98, 0.16)',
      },
    },
  },
  plugins: [],
};
