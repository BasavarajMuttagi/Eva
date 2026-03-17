import Icon, { Phosphor } from "@/src/components/Icon";
import DateTimePicker from "@react-native-community/datetimepicker";
import { endOfDay, format, startOfDay } from "date-fns";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useAccountStartDay } from "../lib/accountStart";

export default function LogMissedDayScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const accountStartDay = useAccountStartDay();
  const today = endOfDay(new Date());

  // Default to yesterday, but not before accountStartDay
  const initialDate = (() => {
    const y = startOfDay(new Date());
    y.setDate(y.getDate() - 1);
    return y < accountStartDay ? accountStartDay : y;
  })();

  const [selectedDate, setSelectedDate] = useState(initialDate);

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
      <View className="bg-chip-light dark:bg-chip-dark rounded-2xl p-4 mb-6 flex-row gap-3">
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
          minimumDate={accountStartDay}
          maximumDate={today}
          onChange={(_, date) => {
            if (date) {
              setSelectedDate(startOfDay(date));
            }
          }}
          accentColor="#6367FF"
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
