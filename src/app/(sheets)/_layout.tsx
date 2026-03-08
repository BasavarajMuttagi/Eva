import { Stack } from "expo-router";

export default function SheetLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        animation: "slide_from_bottom",
      }}
    >
      <Stack.Screen name="log-detail" />
      <Stack.Screen name="log-edit" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="search" />
    </Stack>
  );
}
