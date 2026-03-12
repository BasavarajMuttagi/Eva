/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/screens/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: {
          light: "#6367FF", // ColorHunt primary
          dark: "#6367FF",
        },

        // app background
        screen: {
          light: "#FFF4FF", // lighter FFDBFD-style pastel bg
          dark: "#111111",
        },

        // raised surfaces (cards, sheets)
        card: {
          light: "#EDECEA",
          dark: "#1C1C1C",
        },

        chip: {
          light: "#E8E7E2",
          dark: "#252525",
        },

        border: {
          light: "#E0DED9",
          dark: "#2A2A2A",
        },

        text: {
          primary: {
            light: "#1A1A1A",
            dark: "#F0F0F0",
          },
          secondary: {
            light: "#6B6B6B",
            dark: "#888888",
          },
        },

        danger: {
          light: "#F96B6B",
          dark: "#F96B6B",
        },
      },
    },
  },
  plugins: [],
};
