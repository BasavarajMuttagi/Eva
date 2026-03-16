import { NavHeader, StatRow } from "@/src/components/insights/shared";
import { useAccountStart } from "@/src/lib/accountStart";
import { useInsightsStore } from "@/src/store/InsightsStore";
import { useLogStore } from "@/src/store/LogStore";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

// ─── ConsistencyCalendar ──────────────────────────────────────────────────────

function ConsistencyCalendar({
  month,
  loggedDays,
  onDayPress,
  accountStart,
}: {
  month: Date;
  loggedDays: Set<string>;
  onDayPress: (date: Date) => void;
  accountStart: Date;
}) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const weekStart = startOfWeek(start, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(end, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const dayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <View>
      {/* Day labels */}
      <View className="flex-row justify-between mb-2">
        {dayLabels.map((d) => (
          <Text
            key={d}
            className="text-text-secondary-light dark:text-text-secondary-dark text-xs text-center"
            style={{ width: "14.28%" }}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      <View className="flex-row flex-wrap">
        {allDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, month);
          const logged = loggedDays.has(key);
          const todayDay = isToday(day);
          const future = day > new Date();
          const beforeStart = day < accountStart;

          return (
            <Pressable
              key={key}
              onPress={() => {
                if (logged && !beforeStart) onDayPress(day);
              }}
              style={{ width: "14.28%", alignItems: "center", marginBottom: 6 }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: logged ? "#6367FF" : "transparent",
                  borderWidth: todayDay && !logged ? 1.5 : 0,
                  borderColor: "#6367FF",
                  opacity: !inMonth || future || beforeStart ? 0.2 : 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: logged ? "700" : "400",
                    color: logged ? "#ffffff" : "#888888",
                  }}
                >
                  {format(day, "d")}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── MonthScreen ──────────────────────────────────────────────────────────────

export default function MonthScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { logs } = useLogStore();
  const { selectedMonth, setSelectedMonth, setSelectedDate, setSelectedWeek } =
    useInsightsStore();
  const accountStart = useAccountStart();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text
          style={{ fontFamily: "LibreBaskerville_700Bold", fontSize: 24 }}
          className="text-text-primary-light dark:text-text-primary-dark"
        >
          Insights
        </Text>
      ),
      headerShadowVisible: false,
    });
  }, [navigation]);

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const daysInMonth = monthEnd.getDate();

  const monthLogs = logs.filter(
    (l) =>
      new Date(l.createdAt) >= monthStart &&
      new Date(l.createdAt) <= monthEnd &&
      l.state === "done",
  );

  const loggedDaysSet = new Set(
    monthLogs.map((l) => format(new Date(l.createdAt), "yyyy-MM-dd")),
  );

  // Most eaten food this month
  const allItems = monthLogs.flatMap((l) => l.items ?? []);
  const foodFreq: Record<string, number> = {};
  for (const item of allItems) {
    const name = item.foodName.toLowerCase();
    foodFreq[name] = (foodFreq[name] ?? 0) + 1;
  }
  const topFood =
    Object.entries(foodFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const mostEaten =
    topFood !== "—" ? topFood.charAt(0).toUpperCase() + topFood.slice(1) : "—";

  const canGoNext = !isSameMonth(selectedMonth, new Date());
  const canGoPrev = !isSameMonth(selectedMonth, accountStart);

  const handleDayPress = (date: Date) => {
    // Sync both selectedDate and selectedWeek so Day and Week tabs
    // are on the right period when navigated to
    setSelectedDate(date);
    setSelectedWeek(date);
    router.push("/(tabs)/insights/day");
  };

  return (
    <ScrollView
      className="flex-1 bg-screen-light dark:bg-screen-dark"
      contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <NavHeader
        label={format(selectedMonth, "MMMM yyyy")}
        onPrev={() => {
          if (canGoPrev) {
            setSelectedMonth(subMonths(selectedMonth, 1));
          }
        }}
        onNext={() => setSelectedMonth(addMonths(selectedMonth, 1))}
        canGoNext={canGoNext}
      />

      <ConsistencyCalendar
        month={selectedMonth}
        loggedDays={loggedDaysSet}
        onDayPress={handleDayPress}
        accountStart={accountStart}
      />

      <View className="bg-chip-light dark:bg-chip-dark rounded-2xl px-4 mt-6">
        <StatRow
          label="Days logged"
          value={`${loggedDaysSet.size} of ${daysInMonth}`}
        />
        <StatRow label="Meals logged" value={`${monthLogs.length}`} />
        <StatRow label="Most eaten" value={mostEaten} />
      </View>
    </ScrollView>
  );
}
