import HeaderTitle from "@/src/components/HeaderTitle";
import Icon, { Phosphor } from "@/src/components/Icon";
import { Tabs } from "expo-router";

export default function TabLayout() {
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
        name="history"
        options={{
          title: "History",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon
              icon={Phosphor.ClockCounterClockwiseIcon}
              size={24}
              color={color}
              weight="fill"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) => (
            <Icon
              icon={Phosphor.ChartBarIcon}
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
