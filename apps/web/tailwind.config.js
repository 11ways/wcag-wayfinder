/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['variant', [
    '@media (prefers-color-scheme: dark) { :root:not(.theme-light) & }',
    ':root.theme-dark &',
    ':root.theme-solarized-dark &',
    ':root.theme-high-contrast &',
  ]],
  theme: {
    extend: {},
  },
  plugins: [],
}
