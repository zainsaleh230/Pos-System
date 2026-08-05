/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
            850: '#1e293b', // Custom dark if needed
            900: '#0f172a',
        },
        primary: '#0f172a', // Slate 900
        secondary: '#f1f5f9', // Slate 100
        accent: '#2563eb', // Blue 600
      }
    },
  },
  plugins: [],
}
