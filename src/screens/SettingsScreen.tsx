import React from "react";
import { Pressable, Text, View } from "react-native";

export default function SettingsScreen() {
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
      </View>
    </View>
  );
}
