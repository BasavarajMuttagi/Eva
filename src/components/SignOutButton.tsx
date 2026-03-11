import Icon, { Phosphor } from "@/src/components/Icon";
import { useLogStore } from "@/src/store/LogStore";
import React from "react";
import { Pressable, Text } from "react-native";
import { authClient } from "../lib/auth-client";

export function SignOutButton() {
  const { clear } = useLogStore();

  const handleSignOut = async () => {
    clear();
    await authClient.signOut();
  };

  return (
    <Pressable
      onPress={handleSignOut}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      className="mt-2 flex-row items-center bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl py-4 px-5"
    >
      <Text className="text-[15px] font-semibold text-text-primary-light dark:text-text-primary-dark flex-1 text-center">
        Sign out
      </Text>
      <Icon
        icon={Phosphor.SignOutIcon}
        size={18}
        weight="regular"
        className="text-text-secondary-light dark:text-text-secondary-dark"
      />
    </Pressable>
  );
}
