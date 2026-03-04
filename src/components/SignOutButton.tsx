import Icon, { Phosphor } from "@/src/components/Icon";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { authClient } from "../lib/auth-client";
import { clearLocalDb } from "../lib/helper";

export function SignOutButton() {
  const handleSignOut = async () => {
    clearLocalDb();
    await authClient.signOut();
  };

  return (
    <Pressable
      onPress={handleSignOut}
      className="mt-2 self-stretch items-center justify-center rounded-full bg-chip-light dark:bg-chip-dark p-4"
    >
      <View className="flex-row items-center gap-2">
        <Icon
          icon={Phosphor.SignOutIcon}
          size={16}
          weight="bold"
          className="text-text-primary-light dark:text-text-primary-dark"
        />
        <Text className="text-text-primary-light dark:text-text-primary-dark font-semibold text-md">
          Sign out
        </Text>
      </View>
    </Pressable>
  );
}
