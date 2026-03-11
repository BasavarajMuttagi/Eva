import Icon, { Phosphor } from "@/src/components/Icon";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React from "react";
import { Pressable, Text, View } from "react-native";

cssInterop(Image, {
  className: {
    target: "style",
  },
});

export default function WelcomeScreen() {
  const router = useRouter();

  const handleMeetEva = () => {
    router.push("/(onboarding)/workings");
  };

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-8 pt-16 pb-10">
      {/* Center content */}
      <View className="flex-1 items-center justify-center gap-6">
        <Image
          source={require("@/assets/images/icon.png")}
          className="w-28 h-28"
        />

        <View className="items-center gap-3">
          <Text
            style={{
              fontFamily: "LibreBaskerville_700Bold",
              letterSpacing: -1,
            }}
            className="text-5xl text-text-primary-light dark:text-text-primary-dark"
          >
            Eva
          </Text>
          <Text className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark text-center">
            Just you, remembered.
          </Text>
          <Text className="text-base leading-6 text-text-secondary-light dark:text-text-secondary-dark text-center mt-1">
            Eva is a food journal. Not a tracker. Not a coach. Just a quiet
            companion that notices what you eat and reflects it back, warmly.
          </Text>
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="gap-3">
        <Pressable
          onPress={handleMeetEva}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          className="flex-row items-center bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl py-4 px-5"
        >
          <Text className="text-[15px] font-semibold text-text-primary-light dark:text-text-primary-dark flex-1 text-center">
            Meet Eva
          </Text>
          <Icon
            icon={Phosphor.ArrowRightIcon}
            size={18}
            weight="regular"
            className="text-text-secondary-light dark:text-text-secondary-dark"
          />
        </Pressable>
      </View>
    </View>
  );
}
