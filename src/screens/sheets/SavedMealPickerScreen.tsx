import Icon, { Phosphor } from "@/src/components/Icon";
import { buildCreatedAtIsoForDay, parseDateParamToLocalDay } from "@/src/lib/logDate";
import { useLogStore } from "@/src/store/LogStore";
import { useSavedMealStore } from "@/src/store/SavedMealStore";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

export default function SavedMealPickerScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const date = Array.isArray(params.date) ? params.date[0] : params.date;

  const { savedMeals, sync, syncing } = useSavedMealStore();
  const { addSavedMealLog } = useLogStore();

  const [query, setQuery] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  const createdAtIso = useMemo(() => {
    const day = parseDateParamToLocalDay(date);
    return buildCreatedAtIsoForDay(day);
  }, [date]);

  useEffect(() => {
    sync();
  }, [sync]);

  const suggestions = useMemo(() => {
    const meals = savedMeals.filter((meal) => meal.state === "done");
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return meals;
    }

    return meals.filter((meal) => meal.rawText.toLowerCase().includes(normalizedQuery));
  }, [query, savedMeals]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerLeft: () => (
        <Pressable
          onPress={() => router.dismiss()}
          className="bg-accent-light dark:bg-accent-dark p-2.5 rounded-full"
        >
          <View pointerEvents="none">
            <Icon
              icon={Phosphor.XIcon}
              size={24}
              weight="regular"
              className="text-screen-light"
            />
          </View>
        </Pressable>
      ),
      headerTitle: () => (
        <Text
          style={{ fontFamily: "LibreBaskerville_700Bold", fontSize: 20 }}
          className="text-text-primary-light dark:text-text-primary-dark"
        >
          Saved Meals
        </Text>
      ),
    });
  }, [navigation, router]);

  const handlePick = async (savedMealId: string) => {
    if (addingId) return;

    setAddingId(savedMealId);
    try {
      await addSavedMealLog(savedMealId, createdAtIso);
      router.dismiss();
    } finally {
      setAddingId(null);
    }
  };

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark">
      <View className="px-5 pt-5 pb-4 bg-screen-light dark:bg-screen-dark">
        <View className="bg-chip-light dark:bg-chip-dark rounded-2xl px-4 py-3">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search saved meals"
            placeholderTextColor="#6B6B6B"
            className="text-base text-text-primary-light dark:text-text-primary-dark"
          />
        </View>
      </View>

      {syncing ? (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-text-secondary-light dark:text-text-secondary-dark">
            Loading saved meals...
          </Text>
        </View>
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handlePick(item.id)}
              disabled={!!addingId}
              className="py-4 border-b border-border-light dark:border-border-dark active:opacity-70"
            >
              <Text
                numberOfLines={1}
                className="text-base font-medium text-text-primary-light dark:text-text-primary-dark"
              >
                {item.rawText}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <Icon
                  icon={Phosphor.SparkleIcon}
                  size={12}
                  weight="fill"
                  className="text-accent-light dark:text-accent-dark"
                />
                <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {addingId === item.id ? "Adding..." : `${Math.round(item.totalCalories)} kcal`}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="pt-16 items-center px-5">
              <Icon
                icon={Phosphor.BookmarksSimpleIcon}
                size={28}
                weight="duotone"
                className="text-text-secondary-light dark:text-text-secondary-dark opacity-50"
              />
              <Text className="mt-3 text-base font-medium text-text-primary-light dark:text-text-primary-dark">
                No saved meals found
              </Text>
              <Text className="mt-1 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Create a saved meal in Settings to use it here.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
