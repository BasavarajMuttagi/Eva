import "@/global.css";
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_700Bold,
} from "@expo-google-fonts/libre-baskerville";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppServices } from "../components/AppServices";
import { OfflineBanner } from "../components/OfflineBanner";
import { authClient } from "../lib/auth-client";
import { EvaDarkTheme, EvaLightTheme } from "../theme/navigationTheme";
function RootNavigator() {
  const { data: session, isPending } = authClient.useSession();
  const isLoggedIn = !!session;
  const isOnboarded = (session?.user as any)?.isOnboarded ?? false;

  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      {isLoggedIn && <AppServices />}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "default",
        }}
      >
        <Stack.Protected guard={isLoggedIn && !isOnboarded}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
        <Stack.Protected guard={isLoggedIn && isOnboarded}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="(sheets)"
            options={{
              presentation: "formSheet",
              animation: "slide_from_bottom",
              sheetCornerRadius: 30,
              contentStyle: {
                height: "100%",
              },
            }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    LibreBaskerville_700Bold,
    LibreBaskerville_400Regular,
  });

  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    Purchases.configure({ apiKey: "" });
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={isDark ? EvaDarkTheme : EvaLightTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <OfflineBanner />
        <SafeAreaProvider>
          <StatusBar style={isDark ? "light" : "dark"} />
          <RootNavigator />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
