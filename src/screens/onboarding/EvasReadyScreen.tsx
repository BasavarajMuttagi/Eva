import Icon, { Phosphor } from "@/src/components/Icon";
import { apiClient } from "@/src/lib/apiClient";
import { authClient } from "@/src/lib/auth-client";
import { useOnboardingData } from "@/src/store/OnboardingData";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function EvasReadyScreen() {
  const router = useRouter();
  const { refetch } = authClient.useSession();
  const { heightCm, weightKg, age, gender, activityLevel, reset } =
    useOnboardingData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        waterTrackingEnabled: false,
        sleepTrackingEnabled: false,
      });
      reset();
      await refetch(); // ← this is what you need
      router.replace("/(tabs)/today");
    } catch (err) {
      console.warn("[EvasReady] failed to save preferences", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-6 pt-16 pb-8">
      {/* Main content fully centered */}
      <View className="flex-1 items-center justify-center">
        {/* Illustration */}
        <View className="w-72 h-72 rounded-full bg-card-light dark:bg-card-dark items-center justify-center mb-10">
          <Icon
            icon={Phosphor.LeafIcon}
            size={64}
            weight="fill"
            className="text-accent-light dark:text-accent-dark"
          />
        </View>

        {/* Text block */}
        <View className="px-4 items-center">
          <Text className="text-3xl font-extrabold text-text-primary-light dark:text-text-primary-dark text-center">
            Eva's ready.
          </Text>
          <Text className="mt-5 text-base leading-6 text-text-secondary-light dark:text-text-secondary-dark text-center">
            Now just tell Eva what you ate today.{"\n"}
            She'll take care of the rest.
          </Text>
          {error && (
            <Text className="mt-4 text-sm text-red-500 text-center">
              {error}
            </Text>
          )}
        </View>
      </View>

      {/* Bottom CTA */}
      <Pressable
        onPress={handleStart}
        disabled={loading}
        className={`self-stretch rounded-full py-4 px-6 items-center justify-center ${
          loading
            ? "bg-border-light dark:bg-border-dark"
            : "bg-text-primary-light dark:bg-text-primary-dark"
        }`}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-screen-light dark:text-screen-dark">
              Start journaling
            </Text>
            <Icon
              icon={Phosphor.ArrowRightIcon}
              size={16}
              weight="bold"
              className="text-screen-light dark:text-screen-dark"
            />
          </View>
        )}
      </Pressable>
    </View>
  );
}
