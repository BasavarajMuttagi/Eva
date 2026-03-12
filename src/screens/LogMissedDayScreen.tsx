import Icon, { Phosphor } from "@/src/components/Icon";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function LogMissedDayScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState(yesterday);

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerLeft: () => (
        <Pressable
          onPress={() => router.dismiss()}
          className="bg-accent-light dark:bg-accent-dark p-2.5 rounded-full"
        >
          <View pointerEvents="none">
            <Icon
              icon={Phosphor.XIcon}
              size={24}
              weight="regular"
              className="text-screen-light" // always light
            />
          </View>
        </Pressable>
      ),
      headerTitle: () => (
        <Text
          style={{ fontFamily: "LibreBaskerville_700Bold", fontSize: 24 }}
          className="text-text-primary-light dark:text-text-primary-dark"
        >
          Missed a day?
        </Text>
      ),
    });
  }, [navigation, router]);

  function handleContinue() {
    router.replace({
      pathname: "/history/selected-day",
      params: { date: format(selectedDate, "yyyy-MM-dd") },
    });
  }

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-5 pt-4 pb-10">
      {/* Info card */}
      <View className="bg-accent-dark/20 rounded-2xl p-4 mb-6 flex-row gap-3">
        <Icon
          icon={Phosphor.CalendarBlankIcon}
          size={24}
          weight="fill"
          className="text-accent-light dark:text-accent-dark mt-0.5"
        />
        <View className="flex-1">
          <Text className="text-text-primary-light dark:text-text-primary-dark font-semibold mb-1">
            Logging for a past day
          </Text>
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-5">
            Pick the date you missed. You can add as many meals as you need once
            you're there.
          </Text>
        </View>
      </View>

      {/* Date picker */}
      <View className="items-center">
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="inline"
          maximumDate={today}
          onChange={(_, date) => {
            if (date) {
              date.setHours(0, 0, 0, 0);
              setSelectedDate(date);
            }
          }}
          accentColor="#C87BA0"
        />
      </View>

      {/* Continue button */}
      <Pressable
        onPress={handleContinue}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        className="flex-row items-center bg-accent-light dark:bg-accent-dark rounded-2xl py-4 px-6 mt-6"
      >
        <Text className="text-[15px] font-semibold text-screen-light flex-1 text-center">
          Go to {format(selectedDate, "EEE, MMM d")}
        </Text>
        <Icon
          icon={Phosphor.ArrowRightIcon}
          size={18}
          weight="regular"
          className="text-screen-light"
        />
      </Pressable>
    </View>
  );
}
