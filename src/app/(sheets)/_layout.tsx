import { Stack } from "expo-router";
import React from "react";

export default function SheetLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="search"
        options={{
          headerTitle: "Search Logs",
          animation: "slide_from_bottom",
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
