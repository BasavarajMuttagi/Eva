import Icon, { Phosphor } from "@/src/components/Icon";
import { LogList } from "@/src/components/LogList";
import { Ionicons } from "@expo/vector-icons";
import { format, isYesterday } from "date-fns";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

function formatDayTitle(dateStr: string): string {
  const date = new Date(dateStr);
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEE, MMM d");
}

export default function SelectedDayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const navigation = useNavigation();
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerLeft: () => (
        <Pressable
          onPress={() => router.back()}
          className="bg-accent-light dark:bg-accent-dark p-2.5 rounded-full"
        >
          <View pointerEvents="none">
            <Icon
              icon={Phosphor.ArrowLeftIcon}
              size={24}
              weight="regular"
              className="text-screen-light"
            />
          </View>
        </Pressable>
      ),
      headerTitle: () => (
        <Text
          style={{ fontFamily: "LibreBaskerville_700Bold", fontSize: 20 }}
          className="text-text-primary-light dark:text-text-primary-dark"
        >
          {formatDayTitle(date)}
        </Text>
      ),
    });
  }, [navigation, router, date]);

  return (
    <View className="flex-1">
      <LogList
        date={new Date(date)}
        emptyTitle="Nothing logged"
        emptySubtitle="No entries found for this day"
      />

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/voice",
            params: { date },
          })
        }
        activeOpacity={0.8}
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full bg-accent-light dark:bg-accent-dark items-center justify-center"
      >
        <Ionicons name="mic" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
