import Icon, { Phosphor } from "@/src/components/Icon";
import { useLogStore } from "@/src/store/LogStore";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

export default function LogDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { logs } = useLogStore();

  const log = logs.find((l) => l.id === id);

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
              className="text-screen-light" // always light
            />
          </View>
        </Pressable>
      ),
      headerTitle: () => (
        <Text
          style={{ fontFamily: "LibreBaskerville_700Bold", fontSize: 24 }}
          className="text-text-primary-light dark:text-text-primary-dark"
        >
          Log Details
        </Text>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => {
            if (log?.state === "processing") {
              Alert.alert("Still processing", "Please wait before editing.");
              return;
            }
            router.push({
              pathname: "/(sheets)/log-edit",
              params: { id: log?.id },
            });
          }}
          className="bg-accent-light dark:bg-accent-dark p-2.5 rounded-full"
        >
          <View pointerEvents="none">
            <Icon
              icon={Phosphor.PencilSimpleLineIcon}
              size={24}
              weight="fill"
              className="text-screen-light" // always light
            />
          </View>
        </Pressable>
      ),
    });
  }, [navigation, router, log]);

  if (!log) return null;

  const time = new Date(log.createdAt).toLocaleString("en-US", {
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
      {/* Header */}
      <Text className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark leading-snug">
        {log.rawText}
      </Text>
      <Text className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
        {time}
      </Text>

      {/* Explanation */}
      {log.explanation ? (
        <View className="flex-row items-start gap-2 mt-6">
          <Icon
            icon={Phosphor.SparkleIcon}
            size={14}
            weight="fill"
            className="text-accent-light dark:text-accent-dark mt-0.5"
          />
          <Text className="flex-1 text-sm leading-5 italic text-text-secondary-light dark:text-text-secondary-dark">
            {log.explanation}
          </Text>
        </View>
      ) : null}

      {/* Totals */}
      {log.state === "done" && (
        <View className="mt-8">
          <Text className="text-xs font-semibold tracking-widest uppercase text-text-secondary-light dark:text-text-secondary-dark mb-3">
            This meal
          </Text>
          <View className="bg-chip-light dark:bg-chip-dark rounded-xl px-4 py-3 flex-row">
            <View className="flex-1 items-center">
              <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                {Math.round(log.totalCalories)}
              </Text>
              <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                Calories
              </Text>
            </View>
            <View className="w-px bg-text-secondary-light/20 dark:bg-text-secondary-dark/20" />
            <View className="flex-1 items-center">
              <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                {Math.round(log.totalProtein)}g
              </Text>
              <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                Protein
              </Text>
            </View>
            <View className="w-px bg-text-secondary-light/20 dark:bg-text-secondary-dark/20" />
            <View className="flex-1 items-center">
              <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                {Math.round(log.totalCarbs)}g
              </Text>
              <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                Carbs
              </Text>
            </View>
            <View className="w-px bg-text-secondary-light/20 dark:bg-text-secondary-dark/20" />
            <View className="flex-1 items-center">
              <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                {Math.round(log.totalFat)}g
              </Text>
              <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                Fat
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Breakdown */}
      {log.items.length > 0 && (
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
            {log.items.map((item, index) => (
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

                {index < log.items.length - 1 && (
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
