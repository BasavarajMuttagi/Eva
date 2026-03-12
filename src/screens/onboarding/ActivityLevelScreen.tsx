import Icon, { Phosphor } from "@/src/components/Icon";
import { ACTIVITY_VALUES } from "@/src/store/LogStore";
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
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-6 pt-16 pb-10">
      {/* Top bar: chip back */}
      <View className="flex-row items-center justify-between mb-8">
        <Pressable
          onPress={handleBack}
          className="bg-accent-light dark:bg-accent-dark p-2 rounded-full -ml-2"
          hitSlop={8}
        >
          <Icon
            icon={Phosphor.ArrowLeftIcon}
            size={24}
            weight="regular"
            className="text-screen-light"
          />
        </Pressable>
      </View>

      {/* Title + subtitle */}
      <View className="pr-6 mb-8">
        <Text
          style={{ fontFamily: "LibreBaskerville_700Bold", letterSpacing: -1 }}
          className="text-4xl text-text-primary-light dark:text-text-primary-dark leading-tight"
        >
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
              className={`flex-row items-center justify-between rounded-2xl p-4 mb-2 border ${
                isSelected
                  ? "bg-[#FFDBFD]/90 border-[#FFDBFD] dark:bg-[#FFDBFD] dark:border-[#FFDBFD]"
                  : "bg-transparent border-transparent"
              }`}
            >
              <View className="flex-1">
                <Text
                  className={`text-lg font-semibold ${
                    isSelected
                      ? "text-text-primary-light dark:text-[#111111]"
                      : "text-text-primary-light dark:text-text-primary-dark"
                  }`}
                >
                  {item.title}
                </Text>
                <Text
                  className={`mt-0.5 text-base ${
                    isSelected
                      ? "text-text-secondary-light dark:text-[#222222]"
                      : "text-text-secondary-light dark:text-text-secondary-dark"
                  }`}
                >
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
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        className="flex-row items-center bg-accent-light dark:bg-accent-dark rounded-2xl py-4 px-5"
      >
        <Text className="text-[15px] font-semibold text-screen-light flex-1 text-center">
          Continue
        </Text>
        <Icon
          icon={Phosphor.ArrowRightIcon}
          size={18}
          weight="regular"
          className="text-screen-light"
        />
      </Pressable>
    </View>
  );
}
