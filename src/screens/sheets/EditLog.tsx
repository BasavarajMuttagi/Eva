import Icon, { Phosphor } from "@/src/components/Icon";
import { useLogStore } from "@/src/store/LogStore";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditLogScreen() {
  const { id, rawText } = useLocalSearchParams<{
    id: string;
    rawText: string;
  }>();

  const router = useRouter();
  const navigation = useNavigation();
  const { editLog } = useLogStore();

  const [text, setText] = useState(rawText ?? "");
  const [saving, setSaving] = useState(false);

  const hasChanged = text.trim() !== rawText?.trim();

  const handleSave = useCallback(async () => {
    if (!hasChanged || saving) return;
    setSaving(true);
    try {
      await editLog(id, text.trim());
      router.dismiss();
    } catch {
      // editLog handles error state internally
    } finally {
      setSaving(false);
    }
  }, [hasChanged, saving, text, id, router, editLog]);

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
          Edit Log
        </Text>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          disabled={!hasChanged || saving}
          className="bg-chip-light dark:bg-chip-dark p-2.5 rounded-full"
        >
          <View pointerEvents="none">
            {saving ? (
              <Icon
                icon={Phosphor.CircleNotchIcon}
                size={24}
                weight="regular"
                className="text-text-primary-light dark:text-text-primary-dark"
              />
            ) : (
              <Icon
                icon={Phosphor.CheckIcon}
                size={24}
                weight="regular"
                className={
                  hasChanged
                    ? "text-text-primary-light dark:text-text-primary-dark"
                    : "text-text-secondary-light dark:text-text-secondary-dark opacity-40"
                }
              />
            )}
          </View>
        </Pressable>
      ),
    });
  }, [navigation, hasChanged, saving, handleSave, router]);

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="bg-screen-light dark:bg-screen-dark"
    >
      <View className="flex-1 p-5">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="What did you eat?"
          placeholderTextColor="#6B6B6B"
          multiline
          autoFocus
          className="text-xl text-text-primary-light dark:text-text-primary-dark"
        />
      </View>
    </SafeAreaView>
  );
}
