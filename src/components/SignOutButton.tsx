import Icon, { Phosphor } from "@/src/components/Icon";
import { useLogStore } from "@/src/store/LogStore";
import React from "react";
import { Pressable, Text } from "react-native";
import { authClient } from "../lib/auth-client";
import { usePreferencesStore } from "../store/PreferencesStore";

export function SignOutButton() {
  const handleSignOut = async () => {
    useLogStore.getState().clear();
    usePreferencesStore.getState().clear();
    await authClient.signOut();
  };

  return (
    <Pressable
      onPress={handleSignOut}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      className="mt-2 flex-row items-center rounded-2xl py-4 px-5 
                 bg-danger-light dark:bg-danger-dark"
    >
      <Text className="text-[15px] font-semibold text-screen-light flex-1 text-center">
        Sign out
      </Text>
      <Icon
        icon={Phosphor.SignOutIcon}
        size={18}
        weight="regular"
        className="text-screen-light"
      />
    </Pressable>
  );
}
