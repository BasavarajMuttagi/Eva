import Icon, { Phosphor } from "@/src/components/Icon";
import { db } from "@/src/db";
import { userPreferences } from "@/src/db/schema";

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import React from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { SignOutButton } from "../components/SignOutButton";
import { authClient } from "../lib/auth-client";

export default function SettingsScreen() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const { data: prefs } = useLiveQuery(
    db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId ?? "")),
    [userId],
  );

  const pref = prefs?.[0];

  const toggle = async (
    field: "waterTrackingEnabled" | "sleepTrackingEnabled",
  ) => {
    if (!userId) return;
    const current = pref?.[field] ?? false;
    await db
      .insert(userPreferences)
      .values({
        userId,
        [field]: !current,
        // required notNull fields — use existing values or defaults
        heightCm: pref?.heightCm ?? 170,
        weightKg: pref?.weightKg ?? 70,
        age: pref?.age ?? 25,
        gender: pref?.gender ?? "other",
        activityLevel: pref?.activityLevel ?? "sedentary",
        waterTrackingEnabled:
          field === "waterTrackingEnabled"
            ? !current
            : (pref?.waterTrackingEnabled ?? false),
        sleepTrackingEnabled:
          field === "sleepTrackingEnabled"
            ? !current
            : (pref?.sleepTrackingEnabled ?? false),
      })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { [field]: !current, updatedAt: new Date() },
      });
  };

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-5">
      <View className="gap-6 mt-10">
        <Pressable className="py-4 border-b border-border-light dark:border-border-dark">
          <Text className="text-text-primary-light dark:text-text-primary-dark text-base">
            Body details
          </Text>
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
            Height, weight, goals
          </Text>
        </Pressable>

        <Pressable className="py-4 border-b border-border-light dark:border-border-dark">
          <Text className="text-text-primary-light dark:text-text-primary-dark text-base">
            Notifications
          </Text>
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
            Reminders & daily nudges
          </Text>
        </Pressable>

        {/* Water Tracking Toggle */}
        <View className="flex-row items-center justify-between py-4 border-b border-border-light dark:border-border-dark">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Icon
                icon={Phosphor.DropIcon}
                size={18}
                weight="fill"
                className="text-blue-400"
              />
              <Text className="text-text-primary-light dark:text-text-primary-dark text-base">
                Water Tracking
              </Text>
            </View>
            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
              Log daily water intake
            </Text>
          </View>
          <Switch
            value={pref?.waterTrackingEnabled ?? false}
            onValueChange={() => toggle("waterTrackingEnabled")}
          />
        </View>

        {/* Sleep Tracking Toggle */}
        <View className="flex-row items-center justify-between py-4 border-b border-border-light dark:border-border-dark">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Icon
                icon={Phosphor.MoonIcon}
                size={18}
                weight="fill"
                className="text-indigo-400"
              />
              <Text className="text-text-primary-light dark:text-text-primary-dark text-base">
                Sleep Tracking
              </Text>
            </View>
            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
              Log nightly sleep duration
            </Text>
          </View>
          <Switch
            value={pref?.sleepTrackingEnabled ?? false}
            onValueChange={() => toggle("sleepTrackingEnabled")}
          />
        </View>

        <Pressable className="py-4 border-b border-border-light dark:border-border-dark">
          <Text className="text-text-primary-light dark:text-text-primary-dark text-base">
            Data & privacy
          </Text>
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
            Export, delete, permissions
          </Text>
        </Pressable>

        <Pressable className="py-4">
          <Text className="text-text-primary-light dark:text-text-primary-dark text-base">
            About Eva
          </Text>
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
            Version, credits, support
          </Text>
        </Pressable>

        <SignOutButton />
      </View>
    </View>
  );
}
