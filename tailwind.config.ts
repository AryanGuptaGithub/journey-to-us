import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: { DEFAULT: "#ff7eb6", light: "#ffb3d1" },
        peach: "#ffb997",
        lavender: "#cdb4db",
        skyblue: "#a2d2ff",
        sunset: "#ff9f1c",
      },
      fontFamily: {
        pixel: ["'Press Start 2P'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;