import {
  LibreBaskerville_400Regular,
  LibreBaskerville_700Bold,
} from "@expo-google-fonts/libre-baskerville";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
import { authClient } from "../lib/auth-client";
import { EvaDarkTheme, EvaLightTheme } from "../theme/navigationTheme";
function RootNavigator() {
  const { data: session, isPending } = authClient.useSession();
  const isLoggedIn = !!session;

  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "default" }}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(sheets)"
          options={{
            presentation: "fullScreenModal",
            sheetGrabberVisible: true,
            gestureEnabled: false,
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

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
        <RootNavigator />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
