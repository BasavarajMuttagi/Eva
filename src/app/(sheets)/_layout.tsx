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
      <Stack.Screen
        name="edit-log"
        options={{
          headerTitle: "Edit Log",
          animation: "slide_from_bottom",
          headerShadowVisible: false,
          sheetAllowedDetents: [0.5],
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerTitle: "Profile",
          animation: "slide_from_bottom",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="detailed-log"
        options={{
          headerTitle: "DetailedLog",
          animation: "slide_from_bottom",
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
