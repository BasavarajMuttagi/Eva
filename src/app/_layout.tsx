import {
  LibreBaskerville_400Regular,
  LibreBaskerville_700Bold,
} from "@expo-google-fonts/libre-baskerville";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { EvaDarkTheme, EvaLightTheme } from "../theme/navigationTheme";

import "../../global.css";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    LibreBaskerville_700Bold,
    LibreBaskerville_400Regular,
  });

  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={isDark ? EvaDarkTheme : EvaLightTheme}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="(sheets)"
            options={{
              presentation: "fullScreenModal",
              sheetGrabberVisible: true,
              gestureEnabled: false,
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
