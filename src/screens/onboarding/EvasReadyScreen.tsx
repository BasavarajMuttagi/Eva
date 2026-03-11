import Icon, { Phosphor } from "@/src/components/Icon";
import { apiClient } from "@/src/lib/apiClient";
import { authClient } from "@/src/lib/auth-client";
import { useOnboardingData } from "@/src/store/OnboardingData";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

cssInterop(Image, {
  className: {
    target: "style",
  },
});

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
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-8 pt-16 pb-10">
      {/* Main content fully centered */}
      <View className="flex-1 items-center justify-center gap-6">
        <Image
          source={require("@/assets/images/icon.png")}
          className="w-28 h-28"
        />

        {/* Text block */}
        <View className="items-center gap-3">
          <Text
            style={{
              fontFamily: "LibreBaskerville_700Bold",
              letterSpacing: -1,
            }}
            className="text-4xl text-text-primary-light dark:text-text-primary-dark text-center"
          >
            Eva's ready.
          </Text>
          <Text className="text-base leading-6 text-text-secondary-light dark:text-text-secondary-dark text-center">
            Now just tell Eva what you ate today.{"\n"}
            She'll take care of the rest.
          </Text>
          {error && (
            <Text className="text-sm text-red-500 text-center">{error}</Text>
          )}
        </View>
      </View>

      {/* Bottom CTA */}
      <Pressable
        onPress={handleStart}
        disabled={loading}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        className="flex-row items-center bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl py-4 px-5"
      >
        {loading ? (
          <ActivityIndicator className="flex-1" />
        ) : (
          <>
            <Text className="text-[15px] font-semibold text-text-primary-light dark:text-text-primary-dark flex-1 text-center">
              Start journaling
            </Text>
            <Icon
              icon={Phosphor.ArrowRightIcon}
              size={18}
              weight="regular"
              className="text-text-secondary-light dark:text-text-secondary-dark"
            />
          </>
        )}
      </Pressable>
    </View>
  );
}
