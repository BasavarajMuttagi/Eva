import HeaderTitle from "@/src/components/HeaderTitle";
import Icon, { Phosphor } from "@/src/components/Icon";
import { useSyncEngine } from "@/src/lib/useSyncEngine";
import { Tabs } from "expo-router";

export default function TabLayout() {
  useSyncEngine();
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        animation: "shift",
        headerTitle: ({ children }) => <HeaderTitle title={children} />,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => (
            <Icon
              icon={Phosphor.CalendarIcon}
              size={24}
              color={color}
              weight="fill"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: "Logs",
          tabBarIcon: ({ color }) => (
            <Icon
              icon={Phosphor.FileTextIcon}
              size={24}
              color={color}
              weight="fill"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Icon
              icon={Phosphor.GearIcon}
              size={24}
              color={color}
              weight="fill"
            />
          ),
        }}
      />
    </Tabs>
  );
}
