// src/components/DbMigrations.tsx
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import migrations from "../../drizzle/migrations";
import { db } from "../db";

type Props = { children: React.ReactNode };

export function DbMigrations({ children }: Props) {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-red-950 px-6">
        <View className="w-full max-w-sm rounded-2xl bg-red-900/80 p-6">
          <Text className="text-center text-lg font-semibold text-red-50 mb-2">
            Database error
          </Text>
          <Text className="text-center text-sm text-red-100">
            {error.message}
          </Text>
        </View>
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-sm items-center rounded-2xl p-6">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-base font-semibold">
            Preparing your data
          </Text>
          <Text className="mt-1 text-center text-xs">
            Setting up the local database…
          </Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}
