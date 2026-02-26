import Icon, { Phosphor } from "@/src/utils/icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

type LogDay = {
  id: string;
  dateLabel: string;
  preview: string;
  calories: number;
};

const DATA: LogDay[] = [
  { id: "1", dateLabel: "Today", preview: "Filter coffee", calories: 1450 },
  {
    id: "2",
    dateLabel: "Yesterday",
    preview: "Masala dosa with chutney",
    calories: 1620,
  },
  {
    id: "3",
    dateLabel: "Mon, 24 Feb",
    preview: "2 rotis and paneer butter masala",
    calories: 1310,
  },
];

export default function LogsScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text
          style={{ fontFamily: "LibreBaskerville_700Bold" }}
          className="text-3xl text-text-primary-light dark:text-text-primary-dark"
        >
          Logs
        </Text>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => router.push("/search")}
          className="bg-chip-light dark:bg-chip-dark p-2 rounded-full"
        >
          <View pointerEvents="none">
            <Icon
              icon={Phosphor.MagnifyingGlassIcon}
              size={20}
              weight="bold"
              className="text-text-primary-light dark:text-text-primary-dark"
            />
          </View>
        </Pressable>
      ),
      headerRightContainerStyle: { paddingRight: 14 },
    });
  }, [navigation, router]);

  const renderItem = ({ item }: { item: LogDay }) => (
    <Pressable className="py-4 border-b border-border-light dark:border-border-dark">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-4">
          <Text className="text-text-primary-light dark:text-text-primary-dark text-base">
            {item.preview}
          </Text>
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
            {item.dateLabel}
          </Text>
        </View>
        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
          {item.calories} kcal
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-5">
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
