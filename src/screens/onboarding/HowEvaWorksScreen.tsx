// HowEvaWorksScreen.tsx
import Icon, { Phosphor } from "@/src/components/Icon";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function HowEvaWorksScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push("/(onboarding)/body");
  };

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-8 pt-16 pb-10">
      {/* Top bar: chip back button */}
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

      {/* Main content */}
      <View className="flex-1">
        {/* Title */}
        <View className="pr-6 mb-10">
          <Text
            style={{
              fontFamily: "LibreBaskerville_700Bold",
              letterSpacing: -1,
            }}
            className="text-4xl text-text-primary-light dark:text-text-primary-dark leading-tight"
          >
            How Eva works
          </Text>
        </View>

        {/* Bullets */}
        <View className="gap-6">
          <View className="flex-row items-start gap-3 pr-6">
            <View className="mt-1 bg-chip-light dark:bg-chip-dark rounded-full p-2">
              <Icon
                icon={Phosphor.PencilSimpleLineIcon}
                size={14}
                weight="bold"
                className="text-accent-light dark:text-accent-dark"
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                Tell Eva what you ate.
              </Text>
              <Text className="mt-1 text-base leading-6 text-text-secondary-light dark:text-text-secondary-dark">
                A sentence is enough. She fills in the rest.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-3 pr-6">
            <View className="mt-1 bg-chip-light dark:bg-chip-dark rounded-full p-2">
              <Icon
                icon={Phosphor.ChartLineUpIcon}
                size={14}
                weight="bold"
                className="text-accent-light dark:text-accent-dark"
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                Calculated, not measured.
              </Text>
              <Text className="mt-1 text-base leading-6 text-text-secondary-light dark:text-text-secondary-dark">
                close enough to be useful, clear enough to be trusted.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-3 pr-6">
            <View className="mt-1 bg-chip-light dark:bg-chip-dark rounded-full p-2">
              <Icon
                icon={Phosphor.CalendarDotsIcon}
                size={14}
                weight="bold"
                className="text-accent-light dark:text-accent-dark"
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                Weeks reveal what days hide.
              </Text>
              <Text className="mt-1 text-base leading-6 text-text-secondary-light dark:text-text-secondary-dark">
                Log consistently. The picture gets clearer over time.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom CTA */}
      <Pressable
        onPress={handleContinue}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        className="flex-row items-center bg-accent-light dark:bg-accent-dark rounded-2xl py-4 px-6"
      >
        <Text className="text-[15px] font-semibold text-screen-light flex-1 text-center">
          Got it
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
