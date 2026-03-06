import Icon, { Phosphor } from "@/src/components/Icon";
import { apiClient } from "@/src/lib/apiClient";
import { authClient } from "@/src/lib/auth-client";
import type { FoodLog } from "@/src/store/LogStore";
import { useLogStore } from "@/src/store/LogStore";
import { format, isYesterday } from "date-fns";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Swipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { SharedValue } from "react-native-reanimated";

function formatDayTitle(dateStr: string): string {
  const date = new Date(dateStr);
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEE, MMM d");
}

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

export default function DayLogsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? "";

  const { logs, retryLog, removeLog, addLog } = useLogStore();

  const dayLogs = logs.filter(
    (l) => format(new Date(l.createdAt), "yyyy-MM-dd") === date,
  );

  const [input, setInput] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      animation: "slide_from_bottom",
      headerShadowVisible: false,
      headerLeft: () => (
        <Pressable
          onPress={() => router.dismiss()}
          className="bg-chip-light dark:bg-chip-dark p-2.5 rounded-full"
        >
          <View pointerEvents="none">
            <Icon
              icon={Phosphor.XIcon}
              size={24}
              weight="regular"
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
          {date ? formatDayTitle(date) : ""}
        </Text>
      ),
    });
  }, [navigation, router, date]);

  const handleAdd = async () => {
    if (!input.trim()) return;
    const id = crypto.randomUUID();
    setInput("");
    await addLog(id, input.trim(), userId);
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

  const handleEdit = (log: FoodLog, close?: () => void) => {
    if (log.state === "processing") {
      Alert.alert("Still processing", "Please wait before editing.");
      return;
    }
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
            <Text className="text-white text-sm">Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={dayLogs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center gap-3">
              <Icon
                icon={Phosphor.ForkKnifeIcon}
                size={32}
                weight="duotone"
                className="text-text-secondary-light dark:text-text-secondary-dark opacity-40"
              />
              <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-medium">
                Nothing logged
              </Text>
              <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm text-center px-8">
                No entries found for this day
              </Text>
            </View>
          }
        />
      </View>
    </GestureHandlerRootView>
  );
}
