import { Tabs } from "expo-router";
import { CalendarIcon, FileTextIcon, GearIcon } from "phosphor-react-native";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShadowVisible: false,
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => (
            <CalendarIcon size={24} color={color} weight="fill" />
          ),
        }}
      />

      <Tabs.Screen
        name="logs"
        options={{
          title: "Logs",
          tabBarIcon: ({ color }) => (
            <FileTextIcon size={24} color={color} weight="fill" />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <GearIcon size={24} color={color} weight="fill" />
          ),
        }}
      />
    </Tabs>
  );
}
