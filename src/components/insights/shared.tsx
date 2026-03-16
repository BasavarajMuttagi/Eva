import Icon, { Phosphor } from "@/src/components/Icon";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function Donut({
  actual,
  target,
  size,
  strokeWidth,
  color,
  label,
  unit,
  large,
}: {
  actual: number;
  target: number;
  size: number;
  strokeWidth: number;
  color: string;
  label: string;
  unit: string;
  large?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(actual / target, 1) : 0;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(pct, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [actual, target]);

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
              lineHeight: large ? 30 : 18,
            }}
            className="text-text-primary-light dark:text-text-primary-dark"
          >
            {Math.round(actual)}
          </Text>
          <View
            style={{
              height: 1,
              width: large ? 32 : 20,
              backgroundColor: "#888",
              opacity: 0.4,
              marginVertical: large ? 2 : 1,
            }}
          />
          <Text
            style={{
              fontSize: large ? 15 : 10,
              color: "#888",
              lineHeight: large ? 18 : 12,
            }}
          >
            ~{Math.round(target)}
          </Text>
          <Text
            style={{
              fontSize: large ? 11 : 9,
              color: "#888",
              marginTop: large ? 2 : 1,
            }}
          >
            {unit}
          </Text>
        </View>
      </View>
      <Text
        style={{ fontSize: large ? 15 : 12, fontWeight: "600" }}
        className="text-text-primary-light dark:text-text-primary-dark"
      >
        {label}
      </Text>
    </View>
  );
}

export function DonutSection({
  calories,
  protein,
  carbs,
  fat,
  targets,
  subtitle,
}: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  targets: { calories: number; protein: number; carbs: number; fat: number };
  subtitle?: string;
}) {
  return (
    <View style={{ gap: 24 }}>
      <View style={{ alignItems: "center" }}>
        <Donut
          actual={calories}
          target={targets.calories}
          size={160}
          strokeWidth={12}
          color="#6367FF"
          label="Calories"
          unit="kcal"
          large
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 8,
        }}
      >
        <Donut
          actual={protein}
          target={targets.protein}
          size={88}
          strokeWidth={7}
          color="#34D399"
          label="Protein"
          unit="g"
        />
        <Donut
          actual={carbs}
          target={targets.carbs}
          size={88}
          strokeWidth={7}
          color="#FBBF24"
          label="Carbs"
          unit="g"
        />
        <Donut
          actual={fat}
          target={targets.fat}
          size={88}
          strokeWidth={7}
          color="#F87171"
          label="Fat"
          unit="g"
        />
      </View>
      {subtitle && (
        <Text
          className="text-text-secondary-light dark:text-text-secondary-dark text-xs text-center"
          style={{ marginTop: -8 }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

export function NavHeader({
  label,
  onPrev,
  onNext,
  canGoNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  canGoNext: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between mb-6">
      <Pressable
        onPress={onPrev}
        className="bg-chip-light dark:bg-chip-dark p-2 rounded-full"
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <Icon
          icon={Phosphor.CaretLeftIcon}
          size={16}
          weight="bold"
          className="text-text-primary-light dark:text-text-primary-dark"
        />
      </Pressable>
      <Text className="text-text-primary-light dark:text-text-primary-dark font-semibold text-base">
        {label}
      </Text>
      <Pressable
        onPress={() => {
          if (canGoNext) onNext();
        }}
        className="bg-chip-light dark:bg-chip-dark p-2 rounded-full"
        style={({ pressed }) => ({
          opacity: canGoNext ? (pressed ? 0.6 : 1) : 0.3,
        })}
      >
        <Icon
          icon={Phosphor.CaretRightIcon}
          size={16}
          weight="bold"
          className="text-text-primary-light dark:text-text-primary-dark"
        />
      </Pressable>
    </View>
  );
}

export function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-border-light dark:border-border-dark">
      <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
        {label}
      </Text>
      <Text className="text-text-primary-light dark:text-text-primary-dark text-sm font-semibold">
        {value}
      </Text>
    </View>
  );
}
