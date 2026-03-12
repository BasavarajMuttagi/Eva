import Icon, { Phosphor } from "@/src/components/Icon";
import { SignOutButton } from "@/src/components/SignOutButton";
import { apiClient } from "@/src/lib/apiClient";
import { authClient } from "@/src/lib/auth-client";
import { useLogStore } from "@/src/store/LogStore";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { data: session, refetch } = authClient.useSession();
  const name = session?.user?.name;
  const email = session?.user?.email;
  const { sync, clear } = useLogStore();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await sync();
    setRefreshing(false);
  }, [sync]);

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
        <View className="w-16 h-16 bg-[#E5D4FF] dark:bg-chip-dark rounded-full items-center justify-center">
          <Icon
            icon={Phosphor.UserIcon}
            size={24}
            weight="fill"
            className="text-text-primary-light dark:text-text-primary-dark"
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
              <View className="bg-[#D4F8D4] dark:bg-chip-dark p-2 rounded-full">
                <View pointerEvents="none">
                  <Icon
                    icon={Phosphor.UserIcon}
                    size={16}
                    weight="fill"
                    className="text-[#15803d]"
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

        {/* Data & Privacy */}
        <Pressable className="flex-row items-center justify-between py-4 border-b border-border-light dark:border-border-dark">
          <View className="flex-1">
            <View className="flex-row items-center gap-3">
              <View className="bg-[#E5D4FF] dark:bg-chip-dark p-2 rounded-full">
                <View pointerEvents="none">
                  <Icon
                    icon={Phosphor.KeyholeIcon}
                    size={16}
                    weight="fill"
                    className="text-[#6d28d9]"
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
              <View className="bg-[#E5E7EB] dark:bg-chip-dark p-2 rounded-full">
                <View pointerEvents="none">
                  <Icon
                    icon={Phosphor.InfoIcon}
                    size={16}
                    weight="fill"
                    className="text-[#4b5563]"
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
      </View>

      {/* Reset + Sign out */}
      <View className="mt-8 gap-3">
        <TouchableOpacity
          onPress={async () => {
            await apiClient.post("/api/onboarding/reset");
            clear();
            await refetch();
          }}
          className="self-stretch rounded-full border border-border-light dark:border-border-dark py-3 px-6 items-center justify-center"
        >
          <Text className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
            Reset onboarding
          </Text>
        </TouchableOpacity>
      </View>

      <SignOutButton />
    </ScrollView>
  );
}
