import Icon, { Phosphor } from "@/src/components/Icon";
import { format } from "date-fns";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── helpers ──────────────────────────────────────────────────────────────────

function safeNum(v: string | string[] | undefined): number {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return isFinite(n) ? n : 0;
}

// ─── Donut ────────────────────────────────────────────────────────────────────

type DonutProps = {
  actual: number;
  target: number;
  size: number;
  strokeWidth: number;
  color: string;
  label: string;
  unit: string;
  large?: boolean;
};

function Donut({
  actual,
  target,
  size,
  strokeWidth,
  color,
  label,
  unit,
  large,
}: DonutProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(actual / target, 1) : 0;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(pct, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [pct]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={{ alignItems: "center", gap: large ? 8 : 6 }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeOpacity={0.15}
            fill="none"
          />
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
            rotation="-90"
            origin={`${cx}, ${cy}`}
          />
        </Svg>

        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: large ? 26 : 15,
              fontWeight: "700",
              color: "#F0F0F0",
              lineHeight: large ? 30 : 18,
            }}
          >
            {Math.round(actual)}
          </Text>

          <View
            style={{
              height: 1,
              width: large ? 32 : 20,
              backgroundColor: "#F0F0F0",
              opacity: 0.25,
              marginVertical: large ? 2 : 1,
            }}
          />

          <Text
            style={{
              fontSize: large ? 15 : 10,
              color: "#888888",
              lineHeight: large ? 18 : 12,
            }}
          >
            ~{Math.round(target)}
          </Text>

          <Text
            style={{
              fontSize: large ? 11 : 9,
              color: "#888888",
              marginTop: large ? 2 : 1,
            }}
          >
            {unit}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: large ? 15 : 12,
          fontWeight: "600",
          color: "#F0F0F0",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── NutritionScreen ──────────────────────────────────────────────────────────

export default function NutritionScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  const actual = {
    calories: safeNum(params.actualCalories),
    protein: safeNum(params.actualProtein),
    carbs: safeNum(params.actualCarbs),
    fat: safeNum(params.actualFat),
  };

  const target = {
    calories: safeNum(params.targetCalories),
    protein: safeNum(params.targetProtein),
    carbs: safeNum(params.targetCarbs),
    fat: safeNum(params.targetFat),
  };

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      {/* Drag handle */}
      <View style={{ alignItems: "center", paddingTop: 14, paddingBottom: 2 }}>
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: "#444444",
          }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 28,
          paddingTop: 24,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={{ alignItems: "center", marginBottom: 36 }}>
          <Text
            style={{
              fontFamily: "LibreBaskerville_700Bold",
              fontSize: 24,
              color: "#F0F0F0",
            }}
          >
            Today
          </Text>
          <Text style={{ fontSize: 13, color: "#888888", marginTop: 4 }}>
            {format(new Date(), "EEE, MMM d")}
          </Text>
        </View>

        {/* Calories donut */}
        <View style={{ alignItems: "center", marginBottom: 44 }}>
          <Donut
            actual={actual.calories}
            target={target.calories}
            size={180}
            strokeWidth={14}
            color="#6367FF"
            label="Calories"
            unit="kcal"
            large
          />
        </View>

        {/* Macro donuts */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 36,
            paddingHorizontal: 8,
          }}
        >
          <Donut
            actual={actual.protein}
            target={target.protein}
            size={96}
            strokeWidth={8}
            color="#34D399"
            label="Protein"
            unit="g"
          />
          <Donut
            actual={actual.carbs}
            target={target.carbs}
            size={96}
            strokeWidth={8}
            color="#FBBF24"
            label="Carbs"
            unit="g"
          />
          <Donut
            actual={actual.fat}
            target={target.fat}
            size={96}
            strokeWidth={8}
            color="#F87171"
            label="Fat"
            unit="g"
          />
        </View>

        {/* Eva's note */}
        <View
          style={{
            backgroundColor: "#252525",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <View
            style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}
          >
            <Icon
              icon={Phosphor.SparkleIcon}
              size={13}
              weight="fill"
              color="#6367FF"
              style={{ marginTop: 2 }}
            />
            <Text
              style={{
                fontSize: 13,
                lineHeight: 20,
                color: "#888888",
                fontStyle: "italic",
                flex: 1,
              }}
            >
              The ~ next to each target means these are approximate — based on
              your body data, not a precise prescription.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
