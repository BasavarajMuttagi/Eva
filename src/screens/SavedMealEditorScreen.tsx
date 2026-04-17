import Icon, { Phosphor } from "@/src/components/Icon";
import { authClient } from "@/src/lib/auth-client";
import { useSavedMealStore } from "@/src/store/SavedMealStore";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";

export default function SavedMealEditorScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: session } = authClient.useSession();

  const { savedMeals, fetchById, createSavedMeal, updateSavedMeal } =
    useSavedMealStore();

  const existing = useMemo(
    () => (id ? savedMeals.find((meal) => meal.id === id) : undefined),
    [savedMeals, id],
  );

  const [text, setText] = useState(existing?.rawText ?? "");
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    if (existing) {
      setText(existing.rawText);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const fetched = await fetchById(id);
      if (cancelled) return;
      if (fetched) {
        setText(fetched.rawText);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, existing, fetchById]);

  const hasText = text.trim().length > 0;
  const hasChanged = id
    ? text.trim() !== (existing?.rawText?.trim() ?? "")
    : hasText;

  const handleSave = useCallback(async () => {
    if (!hasChanged || saving) return;
    if (!session?.user?.id) return;

    setSaving(true);
    try {
      const trimmed = text.trim();
      if (id) {
        await updateSavedMeal(id, trimmed);
      } else {
        await createSavedMeal(trimmed, session.user.id);
      }
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save meal. Try again.");
    } finally {
      setSaving(false);
    }
  }, [
    createSavedMeal,
    hasChanged,
    id,
    router,
    saving,
    session?.user?.id,
    text,
    updateSavedMeal,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerShadowVisible: false,
      headerTitle: () => (
        <Text
          style={{ fontFamily: "LibreBaskerville_700Bold", fontSize: 20 }}
          className="text-text-primary-light dark:text-text-primary-dark"
        >
          {id ? "Edit Saved Meal" : "New Saved Meal"}
        </Text>
      ),
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
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          disabled={!hasChanged || saving}
          className={`p-2.5 rounded-full ${
            hasChanged
              ? "bg-accent-light dark:bg-accent-dark"
              : "bg-accent-light/40 dark:bg-accent-dark/40"
          }`}
        >
          <View pointerEvents="none">
            {saving ? (
              <ActivityIndicator size={22} color="#FFFFFF" />
            ) : (
              <Icon
                icon={Phosphor.CheckIcon}
                size={22}
                weight="bold"
                className="text-screen-light"
              />
            )}
          </View>
        </Pressable>
      ),
    });
  }, [navigation, router, id, handleSave, hasChanged, saving]);

  if (loading) {
    return (
      <View className="flex-1 bg-screen-light dark:bg-screen-dark items-center justify-center">
        <Text className="text-text-secondary-light dark:text-text-secondary-dark">
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark p-5">
      <TextInput
        value={text}
        onChangeText={setText}
        autoFocus={!id}
        multiline
        placeholder="Example: 2 eggs and 1 toast"
        placeholderTextColor="#6B6B6B"
        className="text-xl text-text-primary-light dark:text-text-primary-dark"
      />
    </View>
  );
}
