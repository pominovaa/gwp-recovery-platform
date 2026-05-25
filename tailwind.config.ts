import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15201f",
        calm: "#117863",
        blush: "#c44853",
        paper: "#f7faf8"
      },
      boxShadow: {
        soft: "0 18px 54px rgba(15, 23, 42, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
