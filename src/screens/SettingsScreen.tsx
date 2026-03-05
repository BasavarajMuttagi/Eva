import Icon, { Phosphor } from "@/src/components/Icon";
import { db } from "@/src/db";
import { userPreferences } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SignOutButton } from "../components/SignOutButton";
import { apiClient } from "../lib/apiClient";
import { authClient } from "../lib/auth-client";
import { fetchAndSyncPreferences } from "../lib/sync";

type ToggledPrefs = {
  waterTrackingEnabled: boolean;
  sleepTrackingEnabled: boolean;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { data: session, refetch } = authClient.useSession();
  const userId = session?.user?.id;
  const name = session?.user?.name;
  const email = session?.user?.email;
  const [refreshing, setRefreshing] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<ToggledPrefs>({
    waterTrackingEnabled: false,
    sleepTrackingEnabled: false,
  });

  const { data: prefs } = useLiveQuery(
    db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId ?? "")),
    [userId],
  );

  const pref = prefs?.[0];

  useEffect(() => {
    if (!pref) return;
    setLocalPrefs({
      waterTrackingEnabled: pref.waterTrackingEnabled,
      sleepTrackingEnabled: pref.sleepTrackingEnabled,
    });
  }, [pref?.waterTrackingEnabled, pref?.sleepTrackingEnabled]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAndSyncPreferences();
    setRefreshing(false);
  }, []);

  const toggle = (field: keyof ToggledPrefs) => {
    if (!userId) return;
    const newValue = !localPrefs[field];

    setLocalPrefs((prev) => ({ ...prev, [field]: newValue }));

    apiClient
      .patch("/api/preferences/toggles", { [field]: newValue })
      .catch((err) => {
        console.warn("[Settings] toggle failed, reverting", err);
        setLocalPrefs((prev) => ({ ...prev, [field]: !newValue }));
      });
  };

  return (
    <ScrollView
      className="flex-1 p-5 bg-screen-light dark:bg-screen-dark"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Profile card */}
      <View className="mb-6 items-center">
        <View className="w-16 h-16 bg-chip-light dark:bg-chip-dark rounded-full items-center justify-center">
          <Icon
            icon={Phosphor.UserIcon}
            size={24}
            weight="fill"
            className="text-text-secondary-light dark:text-text-secondary-dark"
          />
        </View>
        <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-semibold mt-3">
          {name}
        </Text>
        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-0.5">
          {email}
        </Text>
      </View>

      <View className="gap-0">
        {/* Profile */}
        <Pressable
          onPress={() => router.push("/(sheets)/profile")}
          className="flex-row items-center justify-between py-4 border-b border-border-light dark:border-border-dark"
        >
          <View className="flex-1">
            <View className="flex-row items-center gap-3">
              <View className="bg-chip-light dark:bg-chip-dark p-2 rounded-full">
                <View pointerEvents="none">
                  <Icon
                    icon={Phosphor.UserIcon}
                    size={16}
                    weight="fill"
                    className="text-green-400"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary-light dark:text-text-primary-dark text-base">
                  Profile
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-0.5">
                  Height, weight, age & activity
                </Text>
              </View>
            </View>
          </View>
          <Icon
            icon={Phosphor.CaretRightIcon}
            size={16}
            weight="bold"
            className="text-text-secondary-light dark:text-text-secondary-dark"
          />
        </Pressable>

        {/* Water Tracking */}
        <View className="flex-row items-center justify-between py-4 border-b border-border-light dark:border-border-dark">
          <View className="flex-1">
            <View className="flex-row items-center gap-3">
              <View className="bg-chip-light dark:bg-chip-dark p-2 rounded-full">
                <View pointerEvents="none">
                  <Icon
                    icon={Phosphor.DropIcon}
                    size={16}
                    weight="fill"
                    className="text-blue-400"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary-light dark:text-text-primary-dark text-base">
                  Water Tracking
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-0.5">
                  Log daily water intake
                </Text>
              </View>
            </View>
          </View>
          <Switch
            value={localPrefs.waterTrackingEnabled}
            onValueChange={() => toggle("waterTrackingEnabled")}
          />
        </View>

        {/* Sleep Tracking */}
        <View className="flex-row items-center justify-between py-4 border-b border-border-light dark:border-border-dark">
          <View className="flex-1">
            <View className="flex-row items-center gap-3">
              <View className="bg-chip-light dark:bg-chip-dark p-2 rounded-full">
                <View pointerEvents="none">
                  <Icon
                    icon={Phosphor.MoonIcon}
                    size={16}
                    weight="fill"
                    className="text-indigo-400"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary-light dark:text-text-primary-dark text-base">
                  Sleep Tracking
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-0.5">
                  Log nightly sleep duration
                </Text>
              </View>
            </View>
          </View>
          <Switch
            value={localPrefs.sleepTrackingEnabled}
            onValueChange={() => toggle("sleepTrackingEnabled")}
          />
        </View>

        {/* Food Logging Reminders - DUMMY */}
        <View className="flex-row items-center justify-between py-4 border-b border-border-light dark:border-border-dark">
          <View className="flex-1">
            <View className="flex-row items-center gap-3">
              <View className="bg-chip-light dark:bg-chip-dark p-2 rounded-full">
                <View pointerEvents="none">
                  <Icon
                    icon={Phosphor.ClockIcon}
                    size={16}
                    weight="fill"
                    className="text-orange-400"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary-light dark:text-text-primary-dark text-base">
                  Food Logging Reminders
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-0.5">
                  Nudge to log meals daily (coming soon)
                </Text>
              </View>
            </View>
          </View>
          <Switch disabled value={false} />
        </View>

        {/* Data & Privacy */}
        <Pressable className="flex-row items-center justify-between py-4 border-b border-border-light dark:border-border-dark">
          <View className="flex-1">
            <View className="flex-row items-center gap-3">
              <View className="bg-chip-light dark:bg-chip-dark p-2 rounded-full">
                <View pointerEvents="none">
                  <Icon
                    icon={Phosphor.KeyholeIcon}
                    size={16}
                    weight="fill"
                    className="text-purple-400"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary-light dark:text-text-primary-dark text-base">
                  Data & Privacy
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-0.5">
                  Export, delete, permissions
                </Text>
              </View>
            </View>
          </View>
          <Icon
            icon={Phosphor.CaretRightIcon}
            size={16}
            weight="bold"
            className="text-text-secondary-light dark:text-text-secondary-dark"
          />
        </Pressable>

        {/* About */}
        <Pressable className="flex-row items-center justify-between py-4 border-b border-border-light dark:border-border-dark">
          <View className="flex-1">
            <View className="flex-row items-center gap-3">
              <View className="bg-chip-light dark:bg-chip-dark p-2 rounded-full">
                <View pointerEvents="none">
                  <Icon
                    icon={Phosphor.InfoIcon}
                    size={16}
                    weight="fill"
                    className="text-gray-400"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary-light dark:text-text-primary-dark text-base">
                  About Eva
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-0.5">
                  Version, credits, support
                </Text>
              </View>
            </View>
          </View>
          <Icon
            icon={Phosphor.CaretRightIcon}
            size={16}
            weight="bold"
            className="text-text-secondary-light dark:text-text-secondary-dark"
          />
        </Pressable>

        {/* Reset + Sign out */}
        <View className="mt-8 gap-3">
          <TouchableOpacity
            onPress={async () => {
              (await apiClient.post("/api/onboarding/reset"), await refetch());
            }}
            className="self-stretch rounded-full border border-border-light dark:border-border-dark py-3 px-6 items-center justify-center"
          >
            <Text className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Reset onboarding
            </Text>
          </TouchableOpacity>
        </View>
        <SignOutButton />
      </View>
    </ScrollView>
  );
}
