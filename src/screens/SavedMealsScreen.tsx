import Icon, { Phosphor } from "@/src/components/Icon";
import { useSavedMealStore } from "@/src/store/SavedMealStore";
import { format } from "date-fns";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useLayoutEffect } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

function SavedMealRow({
  id,
  rawText,
  updatedAt,
  state,
  totalCalories,
  onRetry,
  onPress,
  onDelete,
}: {
  id: string;
  rawText: string;
  updatedAt: string;
  state: "processing" | "done" | "error";
  totalCalories: number;
  onRetry: (id: string) => void;
  onPress: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <View className="flex-row items-center border-b border-border-light dark:border-border-dark py-3">
      <Pressable onPress={onPress} className="flex-1 pr-3 active:opacity-70">
        <Text
          numberOfLines={1}
          className="text-base text-text-primary-light dark:text-text-primary-dark"
        >
          {rawText}
        </Text>
        <Text className="text-xs mt-1 text-text-secondary-light dark:text-text-secondary-dark">
          Updated {format(new Date(updatedAt), "MMM d, yyyy")}
        </Text>
        <View className="mt-1 flex-row items-center gap-1">
          <Icon
            icon={Phosphor.SparkleIcon}
            size={12}
            weight="fill"
            className={
              state === "error"
                ? "text-danger-light dark:text-danger-dark"
                : "text-accent-light dark:text-accent-dark"
            }
          />
          {state === "done" ? (
            <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {Math.round(totalCalories)} kcal
            </Text>
          ) : state === "error" ? (
            <Pressable onPress={() => onRetry(id)}>
              <Text className="text-xs text-blue-500">Try again</Text>
            </Pressable>
          ) : (
            <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Processing
            </Text>
          )}
        </View>
      </Pressable>

      <Pressable
        onPress={() => onDelete(id)}
        className="h-9 w-9 rounded-full items-center justify-center bg-chip-light dark:bg-chip-dark"
      >
        <Icon
          icon={Phosphor.TrashIcon}
          size={18}
          weight="regular"
          className="text-danger-light dark:text-danger-dark"
        />
      </Pressable>
    </View>
  );
}

export default function SavedMealsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { savedMeals, syncing, sync, retrySavedMeal, deleteSavedMeal } =
    useSavedMealStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerShadowVisible: false,
      headerLeft: () => (
        <Pressable
          onPress={() => router.back()}
          className="bg-chip-light dark:bg-chip-dark p-2.5 rounded-full"
        >
          <View pointerEvents="none">
            <Icon
              icon={Phosphor.CaretLeftIcon}
              size={22}
              weight="bold"
              className="text-text-primary-light dark:text-text-primary-dark"
            />
          </View>
        </Pressable>
      ),
      headerTitle: () => (
        <Text
          style={{ fontFamily: "LibreBaskerville_700Bold", fontSize: 20 }}
          className="text-text-primary-light dark:text-text-primary-dark"
        >
          Saved Meals
        </Text>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => router.push("/saved-meal-editor")}
          className="bg-accent-light dark:bg-accent-dark p-2.5 rounded-full"
        >
          <View pointerEvents="none">
            <Icon
              icon={Phosphor.PlusIcon}
              size={22}
              weight="bold"
              className="text-screen-light"
            />
          </View>
        </Pressable>
      ),
    });
  }, [navigation, router]);

  const confirmDelete = useCallback(
    (id: string) => {
      Alert.alert("Delete Saved Meal", "This saved meal will be removed.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSavedMeal(id);
            } catch {
              Alert.alert("Error", "Failed to delete saved meal. Try again.");
            }
          },
        },
      ]);
    },
    [deleteSavedMeal],
  );

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark">
      <FlatList
        data={savedMeals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SavedMealRow
            id={item.id}
            rawText={item.rawText}
            updatedAt={item.updatedAt}
            state={item.state}
            totalCalories={item.totalCalories}
            onRetry={retrySavedMeal}
            onPress={() =>
              router.push({
                pathname: "/(sheets)/saved-meal-detail",
                params: { id: item.id },
              })
            }
            onDelete={confirmDelete}
          />
        )}
        refreshControl={<RefreshControl refreshing={syncing} onRefresh={sync} />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center gap-2 pt-28">
            <Icon
              icon={Phosphor.ForkKnifeIcon}
              size={28}
              weight="duotone"
              className="text-text-secondary-light dark:text-text-secondary-dark opacity-50"
            />
            <Text className="text-base text-text-primary-light dark:text-text-primary-dark font-medium">
              No saved meals yet
            </Text>
            <Text className="text-sm text-center px-10 text-text-secondary-light dark:text-text-secondary-dark">
              Tap the plus button to add reusable meals.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
