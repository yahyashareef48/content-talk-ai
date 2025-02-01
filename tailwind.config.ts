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
        "border-lite": "#494F52",
        "border-hover": "#494F52",
        background: "#181A1B",
        "background-lite": "#25282A",
        "background-dark": "#121212",
        "background-hover": "#1B1D1E",
        "text-lite": "#E8E6E3",
        "text-dark": "#615E58",
        "text-washed": "#B1AAA0",
        primary: "#063A27",
        "primary-dark": "#022C22",
        "primary-lite": "#7AFBD6",
        "primary-washed": "#0D6245",
      },
    },
  },
  plugins: [],
} satisfies Config;
