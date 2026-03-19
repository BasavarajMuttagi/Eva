import Icon, { Phosphor } from "@/src/components/Icon";
import { apiClient } from "@/src/lib/apiClient";
import { authClient } from "@/src/lib/auth-client";
import { useOnboardingData } from "@/src/store/OnboardingData";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";

export default function EvasReadyScreen() {
  const router = useRouter();
  const { refetch } = authClient.useSession();
  const { heightCm, weightKg, age, gender, activityLevel, reset } =
    useOnboardingData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  const logoSource =
    colorScheme === "dark"
      ? require("@/assets/images/logo-dark.png")
      : require("@/assets/images/logo-light.png");

  const handleBack = () => {
    router.back();
  };

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/api/preferences", {
        heightCm,
        weightKg,
        age,
        gender,
        activityLevel,
      });
      reset();
      await refetch();
      router.replace("/(tabs)/today");
    } catch (err) {
      console.warn("[EvasReady] failed to save preferences", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-6 pt-16 pb-10">
      {/* Top bar: back button */}
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

      {/* Main content fully centered */}
      <View className="flex-1 items-center justify-center gap-6">
        <View className="items-center gap-3 px-2">
          <Image
            source={logoSource}
            className="w-56 h-56"
            contentFit="contain"
          />
          <Text className="text-base leading-6 text-text-secondary-light dark:text-text-secondary-dark text-center">
            You're all set. Start logging and Eva{"\n"}
            will take it from here.
          </Text>
          {error && (
            <Text className="text-sm text-danger-light dark:text-danger-dark text-center">
              {error}
            </Text>
          )}
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="gap-3">
        <View className="flex-row items-center gap-2 justify-center px-4">
          <Icon
            icon={Phosphor.InfoIcon}
            size={12}
            weight="regular"
            className="text-text-secondary-light dark:text-text-secondary-dark opacity-60"
          />
          <Text className="text-xs leading-5 text-text-secondary-light dark:text-text-secondary-dark opacity-60 flex-1">
            All calorie and nutrition figures are estimates.
          </Text>
        </View>

        <Pressable
          onPress={handleStart}
          disabled={loading}
          style={({ pressed }) => ({ opacity: pressed && !loading ? 0.7 : 1 })}
          className={`flex-row items-center rounded-2xl py-4 px-6 ${
            loading
              ? "bg-chip-light dark:bg-card-dark"
              : "bg-accent-light dark:bg-accent-dark"
          }`}
        >
          {loading ? (
            <ActivityIndicator size={18} color="#6367FF" className="flex-1" />
          ) : (
            <>
              <Text className="text-sm font-semibold text-screen-light flex-1 text-center">
                Start tracking
              </Text>
              <Icon
                icon={Phosphor.ArrowRightIcon}
                size={18}
                weight="regular"
                className="text-screen-light"
              />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
