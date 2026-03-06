import Icon, { Phosphor } from "@/src/components/Icon";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => router.dismiss()}
          className="bg-chip-light dark:bg-chip-dark p-2.5 rounded-full"
        >
          <View pointerEvents="none">
            <Icon
              icon={Phosphor.XIcon}
              size={24}
              weight="regular"
              className="text-text-primary-light dark:text-text-primary-dark"
            />
          </View>
        </Pressable>
      ),
      headerTitle: () => (
        <Text
          style={{ fontFamily: "LibreBaskerville_700Bold", fontSize: 24 }}
          className="text-text-primary-light dark:text-text-primary-dark"
        >
          Search Logs
        </Text>
      ),
    });
  }, [navigation, router]);

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 bg-screen-light dark:bg-screen-dark p-5">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search logs..."
          className="text-xl placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark"
        />
      </View>
    </SafeAreaView>
  );
}
