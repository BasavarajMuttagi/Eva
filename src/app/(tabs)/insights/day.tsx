import {
  DonutSection,
  NavHeader,
  StatRow,
} from "@/src/components/insights/shared";
import { useAccountStart } from "@/src/lib/accountStart";
import { useInsightsStore } from "@/src/store/InsightsStore";
import { useLogStore } from "@/src/store/LogStore";
import { usePreferencesStore } from "@/src/store/PreferencesStore";
import { addDays, format, isToday, subDays } from "date-fns";
import { ScrollView, View } from "react-native";

export default function DayScreen() {
  const { logs } = useLogStore();
  const { prefs } = usePreferencesStore();
  const { selectedDate, setSelectedDate } = useInsightsStore();
  const accountStart = useAccountStart();

  const targets = {
    calories: prefs?.targetCalories ?? 0,
    protein: prefs?.targetProtein ?? 0,
    carbs: prefs?.targetCarbs ?? 0,
    fat: prefs?.targetFat ?? 0,
  };

  const dayKey = format(selectedDate, "yyyy-MM-dd");
  const dayLogs = logs.filter(
    (l) =>
      format(new Date(l.createdAt), "yyyy-MM-dd") === dayKey &&
      l.state === "done",
  );

  const actual = {
    calories: dayLogs.reduce((s, l) => s + l.totalCalories, 0),
    protein: dayLogs.reduce((s, l) => s + l.totalProtein, 0),
    carbs: dayLogs.reduce((s, l) => s + l.totalCarbs, 0),
    fat: dayLogs.reduce((s, l) => s + l.totalFat, 0),
  };

  const canGoNext = !isToday(selectedDate);
  const canGoPrev = selectedDate > accountStart;

  return (
    <ScrollView
      className="flex-1 bg-screen-light dark:bg-screen-dark"
      contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <NavHeader
        label={
          isToday(selectedDate) ? "Today" : format(selectedDate, "EEE, MMM d")
        }
        onPrev={() => {
          if (canGoPrev) {
            setSelectedDate(subDays(selectedDate, 1));
          }
        }}
        onNext={() => setSelectedDate(addDays(selectedDate, 1))}
        canGoNext={canGoNext}
      />

      <DonutSection
        calories={actual.calories}
        protein={actual.protein}
        carbs={actual.carbs}
        fat={actual.fat}
        targets={targets}
      />

      <View className="bg-chip-light dark:bg-chip-dark rounded-2xl px-4 mt-6">
        <StatRow label="Meals logged" value={`${dayLogs.length}`} />
      </View>
    </ScrollView>
  );
}
