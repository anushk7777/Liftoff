/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0F0F11',
        card: '#18181B',
        'card-border': '#27272A',
        primary: {
          DEFAULT: '#6366F1', // slate-blue / indigo accent
          hover: '#4F46E5',
        },
        text: {
          DEFAULT: '#F4F4F5', // zinc-100
          muted: '#A1A1AA',   // zinc-400
          subtle: '#52525B',  // zinc-600
        }
      },
    },
  },
  plugins: [],
}
