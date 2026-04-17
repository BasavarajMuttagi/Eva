import Icon, { Phosphor } from "@/src/components/Icon";
import { SignOutButton } from "@/src/components/SignOutButton";
import { authClient } from "@/src/lib/auth-client";
import { useLogStore } from "@/src/store/LogStore";
import { usePreferencesStore } from "@/src/store/PreferencesStore";
import { useSavedMealStore } from "@/src/store/SavedMealStore";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

type SettingsRowProps = {
  icon: Phosphor.Icon;
  iconBg: string;
  iconColor: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  destructive?: boolean;
};

function SettingsRow({
  icon,
  iconBg,
  iconColor,
  label,
  subtitle,
  onPress,
  destructive,
}: SettingsRowProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center py-4 ">
      <View
        className="p-2 rounded-full mr-3"
        style={{ backgroundColor: iconBg }}
      >
        <Icon icon={icon} size={16} weight="fill" className={iconColor} />
      </View>
      <View className="flex-1">
        <Text
          className={`text-base ${
            destructive
              ? "text-danger-light dark:text-danger-dark"
              : "text-text-primary-light dark:text-text-primary-dark"
          }`}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-0.5">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const name = session?.user?.name;
  const email = session?.user?.email;
  const image = session?.user.image;
  const { sync, clear } = useLogStore();
  const clearPrefs = usePreferencesStore((state) => state.clear);
  const clearSavedMeals = useSavedMealStore((state) => state.clear);

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
      <View className="mb-8 items-center">
        <View className="w-16 h-16 bg-chip-light dark:bg-chip-dark rounded-full items-center justify-center">
          {image ? (
            <Image src={image} className="w-full h-full" />
          ) : (
            <Icon
              icon={Phosphor.UserIcon}
              size={28}
              weight="fill"
              className="text-accent-light dark:text-accent-dark"
            />
          )}
        </View>
        <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-semibold mt-3">
          {name}
        </Text>
        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-0.5">
          {email}
        </Text>
      </View>

      {/* Account */}
      <Text className="text-xs font-semibold tracking-widest uppercase text-text-secondary-light dark:text-text-secondary-dark mb-1 px-1">
        Account
      </Text>
      <View>
        <SettingsRow
          icon={Phosphor.UserIcon}
          iconBg="#E8E6FA"
          iconColor="text-accent-light dark:text-accent-dark"
          label="Profile"
          subtitle="Height, weight, age & activity"
          onPress={() => router.push("/(sheets)/profile")}
        />
      </View>

      {/* App */}
      <Text className="text-xs font-semibold tracking-widest uppercase text-text-secondary-light dark:text-text-secondary-dark mt-8 mb-1 px-1">
        App
      </Text>
      <View>
        <SettingsRow
          icon={Phosphor.BookmarksSimpleIcon}
          iconBg="#E8E6FA"
          iconColor="text-accent-light dark:text-accent-dark"
          label="Saved Meals"
          subtitle="Create and manage reusable meals"
          onPress={() => router.push("/saved-meals")}
        />
        <SettingsRow
          icon={Phosphor.KeyholeIcon}
          iconBg="#E8E6FA"
          iconColor="text-accent-light dark:text-accent-dark"
          label="Data & Privacy"
          subtitle="Export, delete, permissions"
        />
        <SettingsRow
          icon={Phosphor.InfoIcon}
          iconBg="#E8E6FA"
          iconColor="text-accent-light dark:text-accent-dark"
          label="About Eva"
          subtitle="Version, credits, support"
        />
      </View>

      {/* Danger zone */}
      <Text className="text-xs font-semibold tracking-widest uppercase text-text-secondary-light dark:text-text-secondary-dark mt-8 mb-1 px-1">
        Danger zone
      </Text>
      <View>
        <SettingsRow
          icon={Phosphor.TrashIcon}
          iconBg="#FFE4E4"
          iconColor="text-danger-light dark:text-danger-dark"
          label="Delete account"
          subtitle="Permanently remove your data"
          onPress={() => {
            Alert.alert(
              "Delete account?",
              "Your account and all data will be permanently deleted. This cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete account",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await authClient.deleteUser();
                      clear();
                      clearPrefs();
                      clearSavedMeals();
                      console.log("[Settings] account deleted successfully");
                    } catch {
                      Alert.alert(
                        "Failed to delete account",
                        "Please try again.",
                      );
                    }
                  },
                },
              ],
            );
          }}
          destructive
        />
      </View>

      <View className="mt-6 mb-4">
        <SignOutButton />
      </View>
    </ScrollView>
  );
}
