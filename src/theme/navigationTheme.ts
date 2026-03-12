import { DarkTheme, DefaultTheme } from "@react-navigation/native";

export const EvaLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6367FF",
    background: "#FFF4FF", // lighter FFDBFD
    card: "#FFF4FF",
    text: "#1A1A1A",
    border: "#E0DED9",
  },
};

export const EvaDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#6367FF",
    background: "#111111",
    card: "#111111",
    text: "#F0F0F0",
    border: "#2A2A2A",
  },
};
