import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ink: "#070713",
        void: "#101322",
        porcelain: "#f6f4ef",
        aurora: "#56f0b2",
        ion: "#7b61ff",
        nova: "#ffb84d",
        ember: "#ff6b6b",
      },
      boxShadow: {
        glow: "0 0 80px rgba(123, 97, 255, 0.28)",
        glass: "0 24px 80px rgba(0, 0, 0, 0.22)",
      },
      fontFamily: {
        display: [
          "Satoshi",
          "Space Grotesk",
          "Inter",
          "ui-sans-serif",
          "system-ui",
        ],
        body: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "SFMono-Regular", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
