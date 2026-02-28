import Icon, { Phosphor } from "@/src/components/Icon";
import { db } from "@/src/db";
import { foodLogs } from "@/src/db/schema";
import { desc, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import React, { useRef, useState } from "react";
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
import "react-native-get-random-values";
import { SharedValue } from "react-native-reanimated";
import { v4 as uuidv4 } from "uuid";

type FoodLogItem = {
  id: string;
  logId: string;
  foodName: string;
  quantityDescription: string;
  quantityTotal: number;
  unit: "g" | "ml";
  caloriesPer100: number;
  carbsPer100: number;
  proteinPer100: number;
  fatPer100: number;
  createdAt: Date;
  updatedAt: Date;
};

type FoodLog = {
  id: string;
  rawText: string;
  state: "pending" | "processing" | "done" | "error";
  errorMessage: string | null;
  version: number;
  syncedAt: number | null;
  createdAt: Date;
  updatedAt: Date;
  items: FoodLogItem[];
};

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
      <Pressable className="flex-row items-center justify-between py-3 bg-screen-light dark:bg-screen-dark">
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
  const { data: logs = [] } = useLiveQuery(
    db.query.foodLogs.findMany({
      orderBy: desc(foodLogs.createdAt),
      with: { items: true },
    }),
  );

  const [input, setInput] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalCalories = (log: FoodLog) => {
    if (!log.items || log.items.length === 0) return undefined;
    return log.items.reduce(
      (sum, item) => sum + (item.caloriesPer100 / 100) * item.quantityTotal,
      0,
    );
  };

  const addLog = async () => {
    if (!input.trim()) return;

    const id = uuidv4();
    const now = new Date();

    await db.insert(foodLogs).values({
      id,
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
    setInput(log.rawText);
    db.delete(foodLogs).where(eq(foodLogs.id, log.id));
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
        <View className="flex-row items-center gap-1">
          <Icon
            icon={Phosphor.WarningCircleIcon}
            size={14}
            weight="fill"
            className="text-red-500"
          />
          <Text className="text-red-500 capitalize">
            {log.errorMessage ?? "Error"}
          </Text>
        </View>
      );
    }

    const kcal = totalCalories(log);
    return (
      <View className="flex-row items-center gap-1">
        <Icon
          icon={Phosphor.SparkleIcon}
          size={14}
          weight="fill"
          className="text-accent-light dark:text-accent-dark"
        />
        <Text className="text-text-secondary-light dark:text-text-secondary-dark">
          {kcal ? Math.round(kcal) + " kcal" : "—"}
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
      <View className="flex-1 gap-y-5 bg-screen-light dark:bg-screen-dark px-5">
        <View className="flex-row items-center justify-between border-border-light dark:border-border-dark">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="What did you eat?"
            placeholderTextColor="#6B6B6B"
            className="flex-1 text-base text-text-primary-light dark:text-text-primary-dark"
            onSubmitEditing={addLog}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={addLog}
            className="bg-accent-light dark:bg-accent-dark px-4 py-2 rounded-full"
          >
            <Text className="text-white text-sm">Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={logs as FoodLog[]}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </GestureHandlerRootView>
  );
}
