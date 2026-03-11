import Icon, { Phosphor } from "@/src/components/Icon";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

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
    <View className="flex-1 bg-screen-light dark:bg-screen-dark p-5">
      <View className="flex-row items-center gap-3 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl px-4 py-3">
        <Icon
          icon={Phosphor.MagnifyingGlassIcon}
          size={18}
          weight="regular"
          className="text-text-secondary-light dark:text-text-secondary-dark"
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search logs..."
          placeholderTextColor="#6B6B6B"
          autoFocus
          className="flex-1 text-base text-text-primary-light dark:text-text-primary-dark"
          style={{ lineHeight: undefined }}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")}>
            <Icon
              icon={Phosphor.XCircleIcon}
              size={18}
              weight="fill"
              className="text-text-secondary-light dark:text-text-secondary-dark"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}
