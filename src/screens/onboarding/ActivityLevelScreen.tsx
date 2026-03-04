import Icon, { Phosphor } from "@/src/components/Icon";
import { ACTIVITY_VALUES } from "@/src/db/schema";
import { useOnboardingData } from "@/src/store/OnboardingData";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";

type ActivityLevel = (typeof ACTIVITY_VALUES)[number];

const OPTIONS: { key: ActivityLevel; title: string; subtitle: string }[] = [
  { key: "sedentary", title: "Sedentary", subtitle: "Mostly sitting" },
  { key: "light", title: "Light", subtitle: "Some walking" },
  { key: "moderate", title: "Moderate", subtitle: "Active most days" },
  { key: "active", title: "Active", subtitle: "Regular workouts" },
  {
    key: "very_active",
    title: "Very Active",
    subtitle: "Intense daily training",
  },
];

export default function ActivityLevelScreen() {
  const router = useRouter();
  const activityLevel = useOnboardingData((s) => s.activityLevel);
  const setActivityLevel = useOnboardingData((s) => s.setActivityLevel);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push("/(onboarding)/ready");
  };

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-6 pt-16 pb-8">
      {/* Top bar: chip back */}
      <View className="flex-row items-center justify-between mb-8">
        <Pressable
          onPress={handleBack}
          className="bg-chip-light dark:bg-chip-dark p-2 rounded-full -ml-2"
          hitSlop={8}
        >
          <Icon
            icon={Phosphor.ArrowLeftIcon}
            size={18}
            weight="bold"
            className="text-text-primary-light dark:text-text-primary-dark"
          />
        </Pressable>
      </View>

      {/* Title + subtitle */}
      <View className="pr-6 mb-8">
        <Text className="text-4xl font-extrabold text-text-primary-light dark:text-text-primary-dark leading-tight">
          How active are{"\n"}you?
        </Text>
        <Text className="mt-4 text-base leading-6 text-text-secondary-light dark:text-text-secondary-dark">
          Not your gym schedule — just your typical day.
        </Text>
      </View>

      {/* Options list */}
      <FlatList
        data={OPTIONS}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const isSelected = activityLevel === item.key;

          return (
            <Pressable
              onPress={() => setActivityLevel(item.key)}
              className={`flex-row items-center justify-between rounded-xl p-4 ${
                isSelected ? "bg-accent-light/10 dark:bg-accent-dark/10" : ""
              }`}
            >
              <View className="flex-1">
                <Text className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {item.title}
                </Text>
                <Text className="mt-0.5 text-base text-text-secondary-light dark:text-text-secondary-dark">
                  {item.subtitle}
                </Text>
              </View>
              {isSelected && (
                <Icon
                  icon={Phosphor.CheckIcon}
                  size={18}
                  weight="bold"
                  className="text-accent-light dark:text-accent-dark"
                />
              )}
            </Pressable>
          );
        }}
      />

      {/* Bottom CTA */}
      <Pressable
        onPress={handleContinue}
        className="self-stretch rounded-full bg-text-primary-light dark:bg-text-primary-dark py-4 px-6 items-center justify-center"
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-semibold text-screen-light dark:text-screen-dark">
            Continue
          </Text>
          <Icon
            icon={Phosphor.ArrowRightIcon}
            size={16}
            weight="bold"
            className="text-screen-light dark:text-screen-dark"
          />
        </View>
      </Pressable>
    </View>
  );
}
