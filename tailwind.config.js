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
          light: "#1B8C8C",
          dark: "#20BFBF",
        },

        // app background
        screen: {
          light: "#F5F4EF",
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

        danger: "#E05A2B",
      },
    },
  },
  plugins: [],
};
