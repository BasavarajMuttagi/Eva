import {
  DonutSection,
  NavHeader,
  StatRow,
} from "@/src/components/insights/shared";
import { useInsightsStore } from "@/src/store/InsightsStore";
import { useLogStore } from "@/src/store/LogStore";
import { usePreferencesStore } from "@/src/store/PreferencesStore";
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { ScrollView, View, useWindowDimensions } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

function BarChart({
  days,
  target,
}: {
  days: { label: string; calories: number; hasLogs: boolean }[];
  target: number;
}) {
  const { width } = useWindowDimensions();
  const chartW = width - 48;
  const chartH = 140;
  const padLeft = 40;
  const usableW = chartW - padLeft;
  const maxCal = Math.max(...days.map((d) => d.calories), target, 1);
  const barW = usableW / 7;
  const gap = 6;
  const targetY = target > 0 ? chartH - (target / maxCal) * chartH : -1;

  return (
    <Svg width={chartW} height={chartH + 40}>
      <SvgText
        x={padLeft - 6}
        y={8}
        textAnchor="end"
        fontSize={9}
        fill="#888888"
      >
        {Math.round(maxCal)}
      </SvgText>
      <SvgText
        x={padLeft - 6}
        y={chartH}
        textAnchor="end"
        fontSize={9}
        fill="#888888"
      >
        0
      </SvgText>

      {target > 0 && (
        <>
          <Line
            x1={padLeft}
            y1={targetY}
            x2={chartW}
            y2={targetY}
            stroke="#6367FF"
            strokeWidth={1}
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <SvgText
            x={padLeft + 4}
            y={targetY - 4}
            fontSize={9}
            fill="#6367FF"
            fillOpacity={0.7}
          >
            ~{Math.round(target)} kcal
          </SvgText>
        </>
      )}

      {days.map((day, i) => {
        const barH =
          day.calories > 0 ? Math.max((day.calories / maxCal) * chartH, 4) : 0;
        const x = padLeft + i * barW + gap / 2;
        const y = chartH - barH;
        const bw = barW - gap;

        return (
          <Svg key={i}>
            {!day.hasLogs && (
              <Rect
                x={x}
                y={0}
                width={bw}
                height={chartH}
                rx={4}
                fill="#6367FF"
                fillOpacity={0.06}
              />
            )}
            {day.hasLogs && (
              <>
                <Rect
                  x={x}
                  y={y}
                  width={bw}
                  height={barH}
                  rx={4}
                  fill="#6367FF"
                  fillOpacity={0.75}
                />
                <SvgText
                  x={x + bw / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#6367FF"
                >
                  {Math.round(day.calories)}
                </SvgText>
              </>
            )}
            <SvgText
              x={x + bw / 2}
              y={chartH + 16}
              textAnchor="middle"
              fontSize={10}
              fill="#888888"
            >
              {day.label}
            </SvgText>
          </Svg>
        );
      })}
    </Svg>
  );
}

export default function WeekScreen() {
  const { logs } = useLogStore();
  const { prefs } = usePreferencesStore();
  const { selectedWeek, setSelectedWeek } = useInsightsStore();

  const targets = {
    calories: prefs?.targetCalories ?? 0,
    protein: prefs?.targetProtein ?? 0,
    carbs: prefs?.targetCarbs ?? 0,
    fat: prefs?.targetFat ?? 0,
  };

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weekLogs = logs.filter(
    (l) =>
      new Date(l.createdAt) >= weekStart &&
      new Date(l.createdAt) <= weekEnd &&
      l.state === "done",
  );

  const weekDaysWithData = weekDays.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const dLogs = weekLogs.filter(
      (l) => format(new Date(l.createdAt), "yyyy-MM-dd") === key,
    );
    return {
      label: format(day, "EEE").slice(0, 2),
      calories: dLogs.reduce((s, l) => s + l.totalCalories, 0),
      hasLogs: dLogs.length > 0,
    };
  });

  const weekLoggedDays = weekDaysWithData.filter((d) => d.hasLogs).length;
  const weekAvgCalories =
    weekLoggedDays > 0
      ? weekLogs.reduce((s, l) => s + l.totalCalories, 0) / weekLoggedDays
      : 0;
  const weekAvgProtein =
    weekLoggedDays > 0
      ? weekLogs.reduce((s, l) => s + l.totalProtein, 0) / weekLoggedDays
      : 0;
  const weekAvgCarbs =
    weekLoggedDays > 0
      ? weekLogs.reduce((s, l) => s + l.totalCarbs, 0) / weekLoggedDays
      : 0;
  const weekAvgFat =
    weekLoggedDays > 0
      ? weekLogs.reduce((s, l) => s + l.totalFat, 0) / weekLoggedDays
      : 0;

  const canGoNext = weekEnd < new Date();

  return (
    <ScrollView
      className="flex-1 bg-screen-light dark:bg-screen-dark"
      contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <NavHeader
        label={`${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d")}`}
        onPrev={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
        onNext={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
        canGoNext={canGoNext}
      />

      <DonutSection
        calories={weekAvgCalories}
        protein={weekAvgProtein}
        carbs={weekAvgCarbs}
        fat={weekAvgFat}
        targets={targets}
        subtitle="Daily averages this week"
      />

      <View style={{ marginTop: 24 }}>
        <BarChart days={weekDaysWithData} target={targets.calories} />
      </View>

      <View className="bg-chip-light dark:bg-chip-dark rounded-2xl px-4 mt-6">
        <StatRow label="Days logged" value={`${weekLoggedDays} of 7`} />
        <StatRow label="Meals logged" value={`${weekLogs.length}`} />
      </View>
    </ScrollView>
  );
}
