/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EEF0FF',
          100: '#E0E3FF',
          DEFAULT: '#5B4FE9',
          600: '#4A40D0',
          700: '#3D35C0',
        },
        danger: {
          DEFAULT: '#E11D48',
          50:  '#FFF1F2',
          100: '#FFE4E8',
        },
      },
    },
  },
  plugins: [],
};
