import { Stack } from "expo-router";

export default function HistoryLayout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="selected-day" />
      <Stack.Screen
        name="log-missed-day"
        options={{
          presentation: "formSheet",
          animation: "slide_from_bottom",
          sheetCornerRadius: 30,
        }}
      />
    </Stack>
  );
}
