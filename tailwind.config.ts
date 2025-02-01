import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#363B3D",
        "border-hover": "#494F52",
        background: "#181A1B",
        "background-lite": "#25282A",
        "background-hover": "#1B1D1E",
        "text-lite": "#E8E6E3",
        primary: "#063A27",
        "primary-dark": "#022C22",
      },
    },
  },
  plugins: [],
} satisfies Config;
