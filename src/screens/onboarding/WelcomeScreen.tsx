// WelcomeScreen.tsx
import Icon, { Phosphor } from "@/src/components/Icon";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View, useColorScheme } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleContinue = () => {
    router.push("/(onboarding)/workings");
  };

  const logoSource =
    colorScheme === "dark"
      ? require("@/assets/images/logo-dark.png")
      : require("@/assets/images/logo-light.png");

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-6 pt-16 pb-10">
      {/* Center content */}
      <View className="flex-1 items-center justify-center gap-6">
        <Image source={logoSource} className="w-56 h-56" contentFit="contain" />
      </View>

      {/* Bottom CTA */}
      <Pressable
        onPress={handleContinue}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        className="flex-row items-center bg-accent-light dark:bg-accent-dark rounded-2xl py-4 px-6"
      >
        <Text className="text-sm font-semibold text-screen-light flex-1 text-center">
          Get started
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
