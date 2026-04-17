import Icon, { Phosphor } from "@/src/components/Icon";
import { parseStoredDate, toDayKey } from "@/src/lib/logDate";
import { useLogStore, type FoodLog } from "@/src/store/LogStore";
import { format, isToday, isYesterday } from "date-fns";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

type DayGroup = {
  date: string;
  title: string;
  firstLog: FoodLog;
  totalCalories: number;
  logCount: number;
};

function formatTitle(dateStr: string): string {
  const date = parseStoredDate(dateStr);
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEE, MMM d");
}

function DayItem({ item, onPress }: { item: DayGroup; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="py-4 border-b border-border-light dark:border-border-dark active:opacity-70"
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-text-primary-light dark:text-text-primary-dark font-semibold text-base">
          {item.title}
        </Text>
        <View className="flex-row items-center gap-1">
          <Icon
            icon={Phosphor.SparkleIcon}
            size={12}
            weight="fill"
            className="text-accent-light dark:text-accent-dark"
          />
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            {item.totalCalories > 0
              ? Math.round(item.totalCalories) + " kcal"
              : "—"}
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium"
      >
        {item.firstLog.rawText}
      </Text>

      {item.firstLog.explanation ? (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-0.5"
        >
          {item.firstLog.explanation}
        </Text>
      ) : null}

      <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mt-1.5">
        {item.logCount} {item.logCount === 1 ? "entry" : "entries"}
      </Text>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { logs, loadOlder, hasMore, syncing } = useLogStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerTitle: () => (
        <Text
          style={{ fontFamily: "LibreBaskerville_700Bold", fontSize: 20 }}
          className="text-text-primary-light dark:text-text-primary-dark"
        >
          History
        </Text>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => router.push("/history/log-missed-day")}
          className="bg-accent-light dark:bg-accent-dark p-2.5 rounded-full"
        >
          <View pointerEvents="none">
            <Icon
              icon={Phosphor.CalendarPlusIcon}
              size={24}
              weight="duotone"
              className="text-screen-light" // always light icon
            />
          </View>
        </Pressable>
      ),
    });
  }, [navigation, router]);

  const days = useMemo(() => {
    const groups: Record<string, FoodLog[]> = {};

    for (const log of logs) {
      const createdAt = parseStoredDate(log.createdAt);
      if (isToday(createdAt)) continue;
      const key = toDayKey(createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(log);
    }

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(
        ([date, dayLogs]): DayGroup => ({
          date,
          title: formatTitle(date),
          firstLog: dayLogs[0],
          totalCalories: dayLogs
            .filter((l) => l.state === "done")
            .reduce((sum, l) => sum + l.totalCalories, 0),
          logCount: dayLogs.length,
        }),
      );
  }, [logs]);

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark">
      <FlatList
        data={days}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <DayItem
            item={item}
            onPress={() =>
              router.push({
                pathname: "/history/selected-day",
                params: { date: item.date },
              })
            }
          />
        )}
        onEndReached={() => {
          if (hasMore) loadOlder();
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          days.length > 0 ? (
            <Text className="text-center text-text-secondary-light dark:text-text-secondary-dark text-sm py-6">
              {hasMore ? (syncing ? "Loading..." : "") : "No more history"}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center gap-3 pt-20">
            <Icon
              icon={Phosphor.ClockCounterClockwiseIcon}
              size={32}
              weight="duotone"
              className="text-text-secondary-light dark:text-text-secondary-dark opacity-40"
            />
            <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-medium">
              No history yet
            </Text>
            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm text-center px-8">
              Logs from previous days will appear here
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </View>
  );
}
