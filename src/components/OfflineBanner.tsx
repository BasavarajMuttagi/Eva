import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon, { Phosphor } from "./Icon";

const BANNER_HEIGHT = 44;
const DURATION = 350;
const ONLINE_LINGER = 2000;

export const OfflineBanner = () => {
  const insets = useSafeAreaInsets();
  const netInfo = useNetInfo();
  const isOffline = !(netInfo.isConnected && netInfo.isInternetReachable);

  const initialised = useRef(false);
  const targetHeight = BANNER_HEIGHT + insets.top;

  // Shared values — driven entirely on UI thread
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);
  // 0 = hidden, 1 = offline (red), 2 = back online (green)
  const bannerState = useSharedValue(0);

  // Push JS state changes onto a shared value so worklets can react
  const isOfflineSV = useSharedValue(false);
  const initialisedSV = useSharedValue(false);

  useEffect(() => {
    if (!initialised.current) {
      initialised.current = true;
      initialisedSV.value = true;
      return;
    }
    isOfflineSV.value = isOffline;
  }, [isOffline]);

  useAnimatedReaction(
    () => isOfflineSV.value,
    (current, previous) => {
      "worklet";
      if (!initialisedSV.value) return;
      if (previous === null) return;

      if (current) {
        // Going offline
        bannerState.value = 1;
        height.value = withTiming(targetHeight, { duration: DURATION });
        opacity.value = withTiming(1, { duration: DURATION });
      } else if (previous === true) {
        // Coming back online
        bannerState.value = 2;
        height.value = withSequence(
          withTiming(targetHeight, { duration: DURATION }),
          withDelay(ONLINE_LINGER, withTiming(0, { duration: DURATION })),
        );
        opacity.value = withSequence(
          withTiming(1, { duration: DURATION }),
          withDelay(ONLINE_LINGER, withTiming(0, { duration: DURATION })),
        );
      }
    },
  );

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
    overflow: "hidden",
    backgroundColor: bannerState.value === 2 ? "#22c55e" : "#ef4444",
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="border-b border-border-light dark:border-border-dark"
    >
      <View
        style={{ paddingTop: insets.top }}
        className="flex-1 px-4 flex-row items-center gap-2 justify-center"
      >
        <Icon
          icon={isOffline ? Phosphor.WifiSlashIcon : Phosphor.WifiHighIcon}
          size={16}
          weight="bold"
          className="text-white"
        />
        <Text className="text-sm font-medium text-white">
          {isOffline ? "You are offline" : "Back online"}
        </Text>
      </View>
    </Animated.View>
  );
};
