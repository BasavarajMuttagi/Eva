import Icon, { Phosphor } from "@/src/components/Icon";
import { useSavedMealStore } from "@/src/store/SavedMealStore";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

export default function SavedMealDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { savedMeals, fetchById } = useSavedMealStore();
  const [resolvedMissing, setResolvedMissing] = useState(false);

  const meal = useMemo(
    () => savedMeals.find((savedMeal) => savedMeal.id === id),
    [savedMeals, id],
  );

  useEffect(() => {
    if (!id || meal) return;
    let cancelled = false;
    (async () => {
      const fetched = await fetchById(id);
      if (cancelled) return;
      if (!fetched) {
        setResolvedMissing(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, meal, fetchById]);

  useEffect(() => {
    if (meal) setResolvedMissing(false);
  }, [meal]);

  useLayoutEffect(() => {
    navigation.setOptions({
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
          Saved Meal
        </Text>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => {
            if (!meal) return;
            if (meal.state === "processing") {
              Alert.alert("Still processing", "Please wait before editing.");
              return;
            }
            router.push({
              pathname: "/saved-meal-editor",
              params: { id: meal.id },
            });
          }}
          className="bg-accent-light dark:bg-accent-dark p-2.5 rounded-full"
        >
          <View pointerEvents="none">
            <Icon
              icon={Phosphor.PencilSimpleLineIcon}
              size={24}
              weight="fill"
              className="text-screen-light"
            />
          </View>
        </Pressable>
      ),
    });
  }, [navigation, router, meal]);

  if (!meal && !resolvedMissing) {
    return (
      <View className="flex-1 items-center justify-center bg-screen-light dark:bg-screen-dark">
        <Text className="text-text-secondary-light dark:text-text-secondary-dark">
          Loading...
        </Text>
      </View>
    );
  }

  if (!meal && resolvedMissing) {
    return (
      <View className="flex-1 items-center justify-center bg-screen-light dark:bg-screen-dark px-8 gap-3">
        <Text className="text-base text-text-primary-light dark:text-text-primary-dark font-medium">
          Saved meal not found
        </Text>
        <Pressable
          onPress={() => router.dismiss()}
          className="bg-accent-light dark:bg-accent-dark px-4 py-2 rounded-full"
        >
          <Text className="text-screen-light font-semibold">Go back</Text>
        </Pressable>
      </View>
    );
  }

  const currentMeal = meal!;

  const time = new Date(currentMeal.updatedAt).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "short",
    day: "numeric",
  });

  return (
    <ScrollView
      className="flex-1 p-5 bg-screen-light dark:bg-screen-dark"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark leading-snug">
        {currentMeal.rawText}
      </Text>
      <Text className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
        {time}
      </Text>

      {currentMeal.explanation ? (
        <View className="flex-row items-start gap-2 mt-6">
          <Icon
            icon={Phosphor.SparkleIcon}
            size={14}
            weight="fill"
            className="text-accent-light dark:text-accent-dark mt-0.5"
          />
          <Text className="flex-1 text-sm leading-5 italic text-text-secondary-light dark:text-text-secondary-dark">
            {currentMeal.explanation}
          </Text>
        </View>
      ) : null}

      {currentMeal.state === "processing" && (
        <View className="mt-6 rounded-lg bg-chip-light dark:bg-chip-dark px-3 py-2">
          <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            AI analysis is still processing for this saved meal.
          </Text>
        </View>
      )}

      {currentMeal.state === "error" && (
        <View className="mt-6 rounded-lg bg-chip-light dark:bg-chip-dark px-3 py-2">
          <Text className="text-sm text-danger-light dark:text-danger-dark">
            AI analysis failed. Edit and save to retry.
          </Text>
        </View>
      )}

      {currentMeal.state === "done" && (
        <View className="mt-8">
          <Text className="text-xs font-semibold tracking-widest uppercase text-text-secondary-light dark:text-text-secondary-dark mb-3">
            This meal
          </Text>
          <View className="bg-chip-light dark:bg-chip-dark rounded-xl px-4 py-3 flex-row">
            <View className="flex-1 items-center">
              <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                {Math.round(currentMeal.totalCalories)}
              </Text>
              <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                Calories
              </Text>
            </View>
            <View className="w-px bg-text-secondary-light/20 dark:bg-text-secondary-dark/20" />
            <View className="flex-1 items-center">
              <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                {Math.round(currentMeal.totalProtein)}g
              </Text>
              <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                Protein
              </Text>
            </View>
            <View className="w-px bg-text-secondary-light/20 dark:bg-text-secondary-dark/20" />
            <View className="flex-1 items-center">
              <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                {Math.round(currentMeal.totalCarbs)}g
              </Text>
              <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                Carbs
              </Text>
            </View>
            <View className="w-px bg-text-secondary-light/20 dark:bg-text-secondary-dark/20" />
            <View className="flex-1 items-center">
              <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                {Math.round(currentMeal.totalFat)}g
              </Text>
              <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                Fat
              </Text>
            </View>
          </View>
        </View>
      )}

      {currentMeal.items.length > 0 && (
        <View className="mt-10">
          <View className="flex-row items-center gap-2 mb-4">
            <Icon
              icon={Phosphor.ForkKnifeIcon}
              size={13}
              weight="duotone"
              className="text-text-secondary-light dark:text-text-secondary-dark"
            />
            <Text className="text-xs font-semibold tracking-widest uppercase text-text-secondary-light dark:text-text-secondary-dark">
              Breakdown
            </Text>
          </View>

          <View>
            {currentMeal.items.map((item, index) => (
              <View key={item.id}>
                <View className="py-4">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="flex-1 pr-4 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                      {item.foodName}
                    </Text>
                    <Text className="text-md font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                      {item.quantityTotal}
                      {item.unit}
                    </Text>
                  </View>

                  <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-3">
                    {item.quantityDescription}
                  </Text>

                  <View className="flex-row gap-2">
                    {[
                      {
                        value: `${Math.round(item.calories)}`,
                        label: "Calories",
                      },
                      {
                        value: `${Math.round(item.protein)}g`,
                        label: "Protein",
                      },
                      { value: `${Math.round(item.carbs)}g`, label: "Carbs" },
                      { value: `${Math.round(item.fat)}g`, label: "Fat" },
                    ].map((chip) => (
                      <View
                        key={chip.label}
                        style={{ minWidth: 65 }}
                        className="bg-chip-light dark:bg-chip-dark rounded-lg p-1 items-center"
                      >
                        <Text className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark">
                          {chip.value}
                        </Text>
                        <Text className="text-[9px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                          {chip.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {index < currentMeal.items.length - 1 && (
                  <View className="h-px bg-border-light dark:bg-border-dark" />
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
