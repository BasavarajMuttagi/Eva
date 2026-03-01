import Icon, { Phosphor } from "@/src/components/Icon";
import { db } from "@/src/db";
import { foodLogs } from "@/src/db/schema";
import { apiClient } from "@/src/lib/apiClient";
import { eq } from "drizzle-orm";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditLogScreen() {
  const { id, rawText, version } = useLocalSearchParams<{
    id: string;
    rawText: string;
    version: string;
  }>();

  const router = useRouter();
  const navigation = useNavigation();

  const [text, setText] = useState(rawText ?? "");
  const [saving, setSaving] = useState(false);

  const hasChanged = text.trim() !== rawText?.trim();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => router.dismiss()}
          className="bg-chip-light dark:bg-chip-dark p-2 rounded-full"
        >
          <View pointerEvents="none">
            <Icon
              icon={Phosphor.XIcon}
              size={20}
              weight="bold"
              className="text-text-primary-light dark:text-text-primary-dark"
            />
          </View>
        </Pressable>
      ),
      headerTitle: () => (
        <Text
          style={{ fontFamily: "LibreBaskerville_700Bold", fontSize: 24 }}
          className="text-text-primary-light dark:text-text-primary-dark"
        >
          Edit Log
        </Text>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanged || saving}
          className={`px-4 py-2 rounded-full ${hasChanged && !saving ? "bg-accent-light dark:bg-accent-dark" : "bg-chip-light dark:bg-chip-dark"}`}
        >
          <Text
            className={`text-sm font-medium ${hasChanged && !saving ? "text-white" : "text-text-secondary-light dark:text-text-secondary-dark"}`}
          >
            {saving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, hasChanged, saving, text]);

  const handleSave = async () => {
    if (!hasChanged || saving) return;

    setSaving(true);
    const now = new Date();
    const newVersion = Number(version) + 1;

    try {
      // 1. update SQLite immediately — syncedAt = null triggers sync engine
      await db
        .update(foodLogs)
        .set({
          rawText: text.trim(),
          state: "pending",
          syncedAt: null,
          version: newVersion,
          updatedAt: now,
        })
        .where(eq(foodLogs.id, id));

      // 2. PATCH server directly (don't wait for sync engine for edits)
      // sync engine uses version > 1 to know this is a PATCH not POST
      // but for edits we push immediately since the log already exists on server
      await apiClient.patch(`/api/log/${id}`, {
        rawText: text.trim(),
        version: newVersion,
        updatedAt: now.getTime(),
      });

      // 3. mark synced
      await db
        .update(foodLogs)
        .set({ syncedAt: now })
        .where(eq(foodLogs.id, id));

      router.dismiss();
    } catch (err) {
      console.error("[EditLog] failed to save:", err);
      // leave syncedAt = null so sync engine retries
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 bg-screen-light dark:bg-screen-dark p-5">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="What did you eat?"
          placeholderTextColor="#6B6B6B"
          multiline
          autoFocus
          className="text-xl text-text-primary-light dark:text-text-primary-dark"
        />
      </View>
    </SafeAreaView>
  );
}
