// app/(swipe)/index.tsx

import Icon, { Phosphor } from "@/src/utils/icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

type Entry = {
  id: string;
  text: string;
  calories?: number;
  state: "ready" | "processing" | "error";
};

export default function TodayScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text
          style={{ fontFamily: "LibreBaskerville_700Bold" }}
          className="text-3xl text-text-primary-light dark:text-text-primary-dark"
        >
          Today
        </Text>
      ),
      headerRightContainerStyle: { paddingRight: 14 },
    });
  }, [navigation, router]);

  const [entries] = useState<Entry[]>([
    { id: "1", text: "Filter coffee", calories: 90, state: "ready" },
    { id: "2", text: "Masala dosa with chutney", state: "processing" },
    { id: "3", text: "Random text", state: "error" },
  ]);

  const renderRight = (item: Entry) => {
    if (item.state === "processing") {
      return (
        <View className="flex-row items-center gap-1">
          <Icon
            icon={Phosphor.SparkleIcon}
            size={14}
            weight="fill"
            className="text-accent-light dark:text-accent-dark"
          />
          <Text className="text-text-secondary-light dark:text-text-secondary-dark">
            Thinking
          </Text>
        </View>
      );
    }

    if (item.state === "error") {
      return (
        <Text className="text-text-secondary-light dark:text-text-secondary-dark">
          Try again
        </Text>
      );
    }

    return (
      <View className="flex-row items-center gap-1">
        <Icon
          icon={Phosphor.SparkleIcon}
          size={14}
          weight="fill"
          className="text-accent-light dark:text-accent-dark"
        />
        <Text className="text-text-secondary-light dark:text-text-secondary-dark">
          {item.calories} kcal
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Entry }) => (
    <Pressable className="flex-row items-center justify-between py-3">
      <Text
        numberOfLines={1}
        className="flex-1 pr-4 text-text-primary-light dark:text-text-primary-dark text-base"
      >
        {item.text}
      </Text>
      {renderRight(item)}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-5">
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
