/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'selector', // 👈 关键：强制使用 class 类名来控制深色模式
  theme: {
    extend: {},
  },
  plugins: [],
}