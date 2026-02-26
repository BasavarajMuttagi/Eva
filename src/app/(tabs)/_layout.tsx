import HeaderTitle from "@/src/components/HeaderTitle";
import Icon, { Phosphor } from "@/src/components/Icon";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShadowVisible: false,
        animation: "shift",
        headerTitle: ({ children }) => <HeaderTitle title={children} />,
      }}
    >
      <Tabs.Screen
        name="index"
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
            <Icon icon={Phosphor.Gear} size={24} color={color} weight="fill" />
          ),
        }}
      />
    </Tabs>
  );
}
