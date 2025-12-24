/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vibe-dark': '#0a0a0a',
        'vibe-darker': '#050505',
        'vibe-gray': '#1a1a1a',
        'vibe-light-gray': '#2a2a2a',
        'vibe-blue': '#60a5fa',
        'vibe-purple': '#a855f7',
        'vibe-orange': '#f97316',
      },
    },
  },
  plugins: [],
}



