import { LogList } from "@/src/components/LogList";
import { useLogStore } from "@/src/store/LogStore";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";

export default function TodayScreen() {
  const { sync } = useLogStore();
  const router = useRouter();

  useEffect(() => {
    sync();
  }, []);

  return (
    <View className="flex-1">
      <LogList
        date={new Date()}
        showRefresh
        emptyTitle="Nothing logged yet"
        emptySubtitle="Type what you ate above and tap Add"
      />

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/voice",
            params: { date: format(new Date(), "yyyy-MM-dd") },
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
