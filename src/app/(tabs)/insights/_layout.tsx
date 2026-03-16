import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";

const { Navigator } = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Navigator);

export default function InsightsLayout() {
  return (
    <TopTabs
      screenOptions={{
        tabBarActiveTintColor: "#6367FF",
        tabBarInactiveTintColor: "#888888",
        tabBarIndicatorStyle: {
          backgroundColor: "#6367FF",
          height: 2,
          borderRadius: 1,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
          textTransform: "capitalize",
        },
        tabBarStyle: {
          backgroundColor: "transparent",
          elevation: 0,
          shadowOpacity: 0,
          //   borderBottomWidth: 1,
          borderBottomColor: "#E0DED9",
        },
        tabBarPressColor: "transparent",
      }}
    >
      <TopTabs.Screen name="day" options={{ title: "Day" }} />
      <TopTabs.Screen name="week" options={{ title: "Week" }} />
      <TopTabs.Screen name="month" options={{ title: "Month" }} />
    </TopTabs>
  );
}
