// src/components/LogList.tsx
import Icon, { Phosphor } from "@/src/components/Icon";
import { apiClient } from "@/src/lib/apiClient";
import { authClient } from "@/src/lib/auth-client";
import { buildCreatedAtIsoForDay } from "@/src/lib/logDate";
import type { FoodLog } from "@/src/store/LogStore";
import { useLogStore } from "@/src/store/LogStore";
import { usePreferencesStore } from "@/src/store/PreferencesStore";
import { format } from "date-fns";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Swipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

// ─── Swipeable helpers ────────────────────────────────────────────────────────

function RightActions({
  item,
  deletingId,
  onDelete,
}: {
  item: FoodLog;
  deletingId: string | null;
  onDelete: (id: string) => void;
}) {
  return (
    <View className="w-[80px] flex-row items-center pl-2 pr-1">
      <TouchableOpacity
        onPress={() => onDelete(item.id)}
        disabled={deletingId === item.id}
        className="flex-1 h-full bg-danger-light dark:bg-danger-dark justify-center items-center rounded-md"
      >
        {deletingId === item.id ? (
          <Icon
            icon={Phosphor.SpinnerGapIcon}
            size={18}
            weight="bold"
            className="text-white"
          />
        ) : (
          <Icon
            icon={Phosphor.TrashSimpleIcon}
            size={18}
            weight="bold"
            className="text-white"
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

function LogRowMeta({ log }: { log: FoodLog }) {
  const { retryLog } = useLogStore();

  if (log.state === "processing") {
    return (
      <View className="flex-row items-center gap-1">
        <Icon
          icon={Phosphor.SparkleIcon}
          size={14}
          weight="fill"
          className="text-accent-light dark:text-accent-dark"
        />
        <Text className="text-text-secondary-light dark:text-text-secondary-dark capitalize">
          Processing
        </Text>
      </View>
    );
  }

  if (log.state === "error") {
    return (
      <View className="flex-row items-center gap-2">
        <Icon
          icon={Phosphor.SparkleIcon}
          size={14}
          weight="fill"
          className="text-red-500"
        />
        <TouchableOpacity onPress={() => retryLog(log.id)}>
          <Text className="text-blue-500">Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-1">
      <Icon
        icon={Phosphor.SparkleIcon}
        size={14}
        weight="fill"
        className="text-accent-light dark:text-accent-dark"
      />
      <Text className="text-text-secondary-light dark:text-text-secondary-dark">
        {log.totalCalories > 0 ? Math.round(log.totalCalories) + " kcal" : "—"}
      </Text>
    </View>
  );
}

function SwipeableRow({
  item,
  deletingId,
  onDelete,
}: {
  item: FoodLog;
  deletingId: string | null;
  onDelete: (id: string, close: () => void) => void;
}) {
  const router = useRouter();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const isSwiping = useRef(false);
  const close = () => swipeableRef.current?.close();

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      onSwipeableWillOpen={() => (isSwiping.current = true)}
      onSwipeableClose={() => (isSwiping.current = false)}
      renderRightActions={() => (
        <RightActions
          item={item}
          deletingId={deletingId}
          onDelete={(id) => onDelete(id, close)}
        />
      )}
    >
      <Pressable
        onPress={() => {
          if (isSwiping.current) return;
          router.push({
            pathname: "/(sheets)/log-detail",
            params: { id: item.id },
          });
        }}
        className="flex-row items-center justify-between py-3 bg-screen-light dark:bg-screen-dark"
      >
        <Text
          numberOfLines={1}
          className="flex-1 pr-4 text-text-primary-light dark:text-text-primary-dark text-base"
        >
          {item.rawText}
        </Text>
        <LogRowMeta log={item} />
      </Pressable>
    </Swipeable>
  );
}

// ─── LogList ──────────────────────────────────────────────────────────────────

type Props = {
  date: Date;
  showRefresh?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
};

export function LogList({
  date,
  showRefresh = false,
  emptyTitle = "Nothing logged",
  emptySubtitle = "No entries found for this day",
}: Props) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? "";
  const { logs, addLog, removeLog, sync, syncing } = useLogStore();
  const { prefs } = usePreferencesStore();
  const navigation = useNavigation();
  const router = useRouter();

  const [input, setInput] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const dateKey = format(date, "yyyy-MM-dd");

  const dayLogs = useMemo(
    () =>
      logs.filter(
        (l) => format(new Date(l.createdAt), "yyyy-MM-dd") === dateKey,
      ),
    [logs, dateKey],
  );

  const actual = useMemo(() => {
    const done = dayLogs.filter((l) => l.state === "done");
    return {
      calories: done.reduce((s, l) => s + l.totalCalories, 0),
      protein: done.reduce((s, l) => s + l.totalProtein, 0),
      carbs: done.reduce((s, l) => s + l.totalCarbs, 0),
      fat: done.reduce((s, l) => s + l.totalFat, 0),
    };
  }, [dayLogs]);

  const target = useMemo(
    () => ({
      calories: prefs?.targetCalories ?? 0,
      protein: prefs?.targetProtein ?? 0,
      carbs: prefs?.targetCarbs ?? 0,
      fat: prefs?.targetFat ?? 0,
    }),
    [prefs],
  );

  const hasAnyDone = dayLogs.some((l) => l.state === "done");
  const isSlashOnly = input.trim() === "/";

  const openNutrition = () => {
    router.push({
      pathname: "/(sheets)/nutrition",
      params: {
        actualCalories: actual.calories,
        actualProtein: actual.protein,
        actualCarbs: actual.carbs,
        actualFat: actual.fat,
        targetCalories: target.calories,
        targetProtein: target.protein,
        targetCarbs: target.carbs,
        targetFat: target.fat,
      },
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight:
        hasAnyDone && prefs
          ? () => (
              <Pressable
                onPress={openNutrition}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <View className="bg-chip-light dark:bg-chip-dark flex-row items-baseline gap-1 px-4 py-2 rounded-full">
                  <Text className="text-text-primary-light dark:text-text-primary-dark text-md font-bold">
                    {Math.round(actual.calories).toLocaleString()}
                  </Text>
                  <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs font-normal">
                    kcal
                  </Text>
                </View>
              </Pressable>
            )
          : undefined,
    });
  }, [hasAnyDone, prefs, actual.calories]);

  const addRawTextAsLog = async (rawText: string) => {
    const id = uuidv4();
    const createdAtIso = buildCreatedAtIsoForDay(date);
    setInput("");
    await addLog(id, rawText, userId, createdAtIso);
  };

  const handleAdd = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (isSlashOnly) {
      router.push({
        pathname: "/(sheets)/saved-meal-picker",
        params: { date: format(date, "yyyy-MM-dd") },
      });
      return;
    }
    await addRawTextAsLog(trimmed);
  };

  const handleDelete = (logId: string, close?: () => void) => {
    close?.();
    Alert.alert("Delete Log", "Remove this food entry? This can't be undone.", [
      { text: "Cancel", style: "cancel", onPress: () => close?.() },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeletingId(logId);
          try {
            await apiClient.delete(`/api/log/${logId}`);
            removeLog(logId);
          } catch {
            Alert.alert("Error", "Failed to delete log. Try again.");
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 gap-y-5 bg-screen-light dark:bg-screen-dark p-5">
      {/* Input */}
      <View className="flex-row items-center justify-between">
        <TextInput
          value={input}
          onChangeText={(text) => {
            // If user types "/" as the first non-space char, open picker sheet.
            const next = text.trimStart();
            if (next === "/") {
              setInput("");
              router.push({
                pathname: "/(sheets)/saved-meal-picker",
                params: { date: format(date, "yyyy-MM-dd") },
              });
              return;
            }
            setInput(text);
          }}
          placeholder="What did you eat?"
          placeholderTextColor="#6B6B6B"
          className="flex-1 text-lg text-text-primary-light dark:text-text-primary-dark"
          style={{ lineHeight: undefined }}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          onPress={handleAdd}
          disabled={!input.trim()}
          className={`px-4 py-2 rounded-full ${
            input.trim()
              ? "bg-accent-light dark:bg-accent-dark"
              : "bg-accent-light/40 dark:bg-accent-dark/40"
          }`}
        >
          <Text className="text-white text-sm font-semibold">Add</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={dayLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SwipeableRow
            item={item}
            deletingId={deletingId}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          showRefresh ? (
            <RefreshControl refreshing={syncing} onRefresh={sync} />
          ) : undefined
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center gap-3">
            {showRefresh && syncing ? (
              <>
                <Icon
                  icon={Phosphor.SparkleIcon}
                  size={32}
                  weight="fill"
                  className="text-accent-light dark:text-accent-dark opacity-40"
                />
                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                  Loading...
                </Text>
              </>
            ) : (
              <>
                <Icon
                  icon={Phosphor.ForkKnifeIcon}
                  size={32}
                  weight="duotone"
                  className="text-text-secondary-light dark:text-text-secondary-dark opacity-40"
                />
                <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-medium">
                  {emptyTitle}
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm text-center px-8">
                  {emptySubtitle}
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}
