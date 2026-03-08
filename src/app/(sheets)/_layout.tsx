import { Stack } from "expo-router";
import React from "react";

export default function SheetLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="history"
        options={{
          headerShadowVisible: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="day-logs"
        options={{
          headerShadowVisible: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="detailed-log"
        options={{
          headerShadowVisible: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="edit-log"
        options={{
          headerShadowVisible: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShadowVisible: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          headerShadowVisible: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="today"
        options={{
          headerShadowVisible: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="log-past-day"
        options={{
          headerShadowVisible: false,
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
