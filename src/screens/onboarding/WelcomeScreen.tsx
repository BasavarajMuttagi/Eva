import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleMeetEva = () => {
    router.push("/(onboarding)/workings");
  };

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-6 pt-16 pb-8">
      {/* Main content vertically centered */}
      <View className="flex-1 items-center justify-center">
        {/* Logo mark */}
        <View className="items-center mb-8">
          <View className="w-12 h-12 rounded-full bg-card-light dark:bg-card-dark items-center justify-center">
            <Text className="text-text-primary-light dark:text-text-primary-dark text-xl">
              🌱
            </Text>
          </View>
        </View>

        {/* Text block */}
        <View className="items-center">
          <Text className="tracking-[0.22em] text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
            WELCOME TO
          </Text>

          <Text className="mt-3 text-5xl font-extrabold text-text-primary-light dark:text-text-primary-dark">
            Eva
          </Text>

          <Text className="mt-8 text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark text-center">
            Just you, remembered.
          </Text>

          <Text className="mt-5 text-base leading-6 text-text-secondary-light dark:text-text-secondary-dark text-center">
            Eva is a food journal. Not a tracker. Not a coach. Just a quiet
            companion that notices what you eat and reflects it back, warmly.
          </Text>
        </View>
      </View>

      {/* CTA pinned to bottom */}
      <View className="mt-auto">
        <Pressable
          onPress={handleMeetEva}
          className="self-stretch rounded-full bg-text-primary-light dark:bg-text-primary-dark py-4 px-6 items-center justify-center"
        >
          <Text className="text-base font-semibold text-screen-light dark:text-screen-dark">
            Meet Eva
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
