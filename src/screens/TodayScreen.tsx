import Icon, { Phosphor } from "@/src/components/Icon";
import { db } from "@/src/db";
import { foodLogs } from "@/src/db/schema";
import { fetchAndSyncFromServer } from "@/src/lib/sync";
import { desc, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Swipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import "react-native-get-random-values";
import { SharedValue } from "react-native-reanimated";
import { v4 as uuidv4 } from "uuid";
import { apiClient } from "../lib/apiClient";
import { authClient } from "../lib/auth-client";

type FoodLog = typeof foodLogs.$inferSelect;

function RightActions({
  dragX,
  item,
  deletingId,
  onEdit,
  onDelete,
}: {
  dragX: SharedValue<number>;
  item: FoodLog;
  deletingId: string | null;
  onEdit: (log: FoodLog) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <View className="w-[180px] flex-row items-center pl-2 pr-1 gap-2">
      <TouchableOpacity
        onPress={() => onEdit(item)}
        className="flex-1 h-full bg-blue-500 justify-center items-center gap-1 rounded-md"
      >
        <Icon
          icon={Phosphor.PencilSimpleLineIcon}
          size={18}
          weight="bold"
          className="text-white"
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onDelete(item.id)}
        disabled={deletingId === item.id}
        className="flex-1 h-full bg-red-500 justify-center items-center gap-1 rounded-md"
      >
        {deletingId === item.id ? (
          <Icon
            icon={Phosphor.SpinnerGapIcon}
            size={18}
            weight="bold"
            className="text-white p-2"
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

function SwipeableRow({
  item,
  deletingId,
  renderRight,
  onEdit,
  onDelete,
}: {
  item: FoodLog;
  deletingId: string | null;
  renderRight: (log: FoodLog) => React.ReactNode;
  onEdit: (log: FoodLog, close: () => void) => void;
  onDelete: (id: string, close: () => void) => void;
}) {
  const router = useRouter();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const close = () => swipeableRef.current?.close();

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={(_progress, dragX) => (
        <RightActions
          dragX={dragX}
          item={item}
          deletingId={deletingId}
          onEdit={(log) => onEdit(log, close)}
          onDelete={(id) => onDelete(id, close)}
        />
      )}
    >
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(sheets)/detailed-log",
            params: { id: item.id },
          })
        }
        className="flex-row items-center justify-between py-3 bg-screen-light dark:bg-screen-dark"
      >
        <Text
          numberOfLines={1}
          className="flex-1 pr-4 text-text-primary-light dark:text-text-primary-dark text-base"
        >
          {item.rawText}
        </Text>
        {renderRight(item)}
      </Pressable>
    </Swipeable>
  );
}

export default function TodayScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? "";

  const { data: logs = [], updatedAt } = useLiveQuery(
    db.query.foodLogs.findMany({
      orderBy: desc(foodLogs.createdAt),
    }),
  );

  const [input, setInput] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const isLoading = updatedAt === undefined;

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAndSyncFromServer();
    setRefreshing(false);
  };

  const addLog = async () => {
    if (!input.trim()) return;

    const id = uuidv4();
    const now = new Date();

    await db.insert(foodLogs).values({
      id,
      userId,
      rawText: input.trim(),
      state: "pending",
      version: 1,
      syncedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    setInput("");
  };

  const handleDelete = (logId: string, close?: () => void) => {
    close?.();
    Alert.alert("Delete Log", "Remove this food entry? This can't be undone.", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => close?.(),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeletingId(logId);
          try {
            await db.delete(foodLogs).where(eq(foodLogs.id, logId));
            apiClient
              .delete(`/api/log/${logId}`)
              .catch((err) =>
                console.warn("[Delete] server delete failed:", err),
              );
          } catch (error) {
            console.error("Delete failed:", error);
            Alert.alert("Error", "Failed to delete log. Try again.");
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const handleEdit = (log: FoodLog, close?: () => void) => {
    close?.();
    router.push({
      pathname: "/(sheets)/edit-log",
      params: {
        id: log.id,
        rawText: log.rawText,
        version: String(log.version),
      },
    });
  };

  const renderRight = (log: FoodLog) => {
    if (log.state === "pending" || log.state === "processing") {
      return (
        <View className="flex-row items-center gap-1">
          <Icon
            icon={Phosphor.SparkleIcon}
            size={14}
            weight="fill"
            className="text-accent-light dark:text-accent-dark"
          />
          <Text className="text-text-secondary-light dark:text-text-secondary-dark capitalize">
            {log.state}
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
          <TouchableOpacity
            onPress={async () => {
              await db
                .update(foodLogs)
                .set({
                  state: "pending",
                  errorMessage: null,
                  syncedAt: null,
                  updatedAt: new Date(),
                })
                .where(eq(foodLogs.id, log.id));
            }}
          >
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
          {log.totalCalories > 0
            ? Math.round(log.totalCalories) + " kcal"
            : "—"}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: FoodLog }) => (
    <SwipeableRow
      item={item}
      deletingId={deletingId}
      renderRight={renderRight}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 gap-y-5 bg-screen-light dark:bg-screen-dark p-5">
        <View className="flex-row items-center justify-between border-border-light dark:border-border-dark">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="What did you eat?"
            placeholderTextColor="#6B6B6B"
            placeholderClassName="text-lg"
            className="flex-1 text-lg text-text-primary-light dark:text-text-primary-dark"
            style={{ lineHeight: undefined }}
            onSubmitEditing={addLog}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={addLog}
            disabled={!input.trim()}
            className={`px-4 py-2 rounded-full ${
              input.trim()
                ? "bg-accent-light dark:bg-accent-dark"
                : "bg-accent-light/40 dark:bg-accent-dark/40"
            }`}
          >
            <Text className="text-white text-sm">Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center gap-3">
              {isLoading ? (
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
                    Nothing logged yet
                  </Text>
                  <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm text-center px-8">
                    Type what you ate above and tap Add
                  </Text>
                </>
              )}
            </View>
          }
        />
      </View>
    </GestureHandlerRootView>
  );
}
