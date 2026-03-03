import { useNetInfo } from "@react-native-community/netinfo";
import { Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon, { Phosphor } from "./Icon";
export const OfflineBanner = () => {
  const insets = useSafeAreaInsets();
  const netInfo = useNetInfo();
  const isOffline = !(netInfo.isConnected && netInfo.isInternetReachable);
  const transition = LinearTransition.duration(300).springify();
  if (!isOffline) return null;

  return (
    <Animated.View
      style={{ paddingTop: insets.top - 10 }}
      layout={transition}
      className="bg-danger-light dark:bg-danger-dark border-b border-border-light dark:border-border-dark"
    >
      <View className="px-4 py-2.5 flex-row items-center gap-2 justify-center">
        <Icon
          icon={Phosphor.WifiSlashIcon}
          size={24}
          weight="bold"
          className="text-white animate-pulse"
        />
        <Text className="text-sm font-medium text-white">You are offline</Text>
      </View>
    </Animated.View>
  );
};
