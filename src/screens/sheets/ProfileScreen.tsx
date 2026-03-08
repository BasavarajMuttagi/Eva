import Icon, { Phosphor } from "@/src/components/Icon";
import { apiClient } from "@/src/lib/apiClient";
import { authClient } from "@/src/lib/auth-client";
import { ACTIVITY_VALUES, GENDER_VALUES } from "@/src/store/LogStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";

const ProfileSchema = z.object({
  heightCm: z
    .string()
    .min(1, "Required")
    .refine((v) => Number(v) >= 50 && Number(v) <= 300, "Enter 50–300 cm"),
  weightKg: z
    .string()
    .min(1, "Required")
    .refine((v) => Number(v) >= 20 && Number(v) <= 500, "Enter 20–500 kg"),
  age: z
    .string()
    .min(1, "Required")
    .refine((v) => Number(v) >= 10 && Number(v) <= 120, "Enter 10–120"),
  gender: z.enum(GENDER_VALUES),
  activityLevel: z.enum(ACTIVITY_VALUES),
});

type ProfileForm = z.infer<typeof ProfileSchema>;

const GENDER_LABELS: Record<(typeof GENDER_VALUES)[number], string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

const ACTIVITY_LABELS: Record<(typeof ACTIVITY_VALUES)[number], string> = {
  sedentary: "Sedentary",
  light: "Light",
  moderate: "Moderate",
  active: "Active",
  very_active: "Very Active",
};

type Prefs = {
  heightCm: number;
  weightKg: number;
  age: number;
  gender: (typeof GENDER_VALUES)[number];
  activityLevel: (typeof ACTIVITY_VALUES)[number];
};

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const name = session?.user?.name;
  const email = session?.user?.email;

  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      heightCm: "",
      weightKg: "",
      age: "",
      gender: "male",
      activityLevel: "sedentary",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    if (!userId) return;
    setSaving(true);
    try {
      await apiClient.post("/api/preferences", {
        heightCm: Number(data.heightCm),
        weightKg: Number(data.weightKg),
        age: Number(data.age),
        gender: data.gender,
        activityLevel: data.activityLevel,
      });
      router.dismiss();
    } catch {
      Alert.alert(
        "Failed to save",
        "Please check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

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
          Profile
        </Text>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={!isDirty || saving}
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
                  isDirty
                    ? "text-text-primary-light dark:text-text-primary-dark"
                    : "text-text-secondary-light dark:text-text-secondary-dark opacity-40"
                }
              />
            )}
          </View>
        </Pressable>
      ),
    });
  }, [navigation, router, isDirty, saving, handleSubmit]);

  useEffect(() => {
    if (!userId) return;
    apiClient
      .get("/api/preferences")
      .then((res) => {
        setPrefs(res.data);
        reset({
          heightCm: String(res.data.heightCm),
          weightKg: String(res.data.weightKg),
          age: String(res.data.age),
          gender: res.data.gender,
          activityLevel: res.data.activityLevel,
        });
      })
      .catch(() => {
        // 404 = not onboarded yet
      });
  }, [userId]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 bg-screen-light dark:bg-screen-dark"
        contentContainerClassName="px-6 pt-6 pb-16"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Account — read only */}
        <View className="mb-8">
          <Text className="text-text-primary-light dark:text-text-primary-dark text-lg font-semibold">
            {name}
          </Text>
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-0.5">
            {email}
          </Text>
        </View>

        {/* Gender */}
        <View className="mb-6">
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-2">
            Gender
          </Text>
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row gap-2">
                {GENDER_VALUES.map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => onChange(g)}
                    className={`flex-1 py-2 rounded-full items-center border ${
                      value === g
                        ? "bg-text-primary-light dark:bg-text-primary-dark border-text-primary-light dark:border-text-primary-dark"
                        : "border-border-light dark:border-border-dark"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        value === g
                          ? "text-screen-light dark:text-screen-dark"
                          : "text-text-secondary-light dark:text-text-secondary-dark"
                      }`}
                    >
                      {GENDER_LABELS[g]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>

        {/* Age */}
        <View className="mb-6">
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-1">
            Age
          </Text>
          <Controller
            control={control}
            name="age"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                placeholder="e.g. 25"
                placeholderTextColor="#6B6B6B"
                className="text-text-primary-light dark:text-text-primary-dark text-base border-b border-border-light dark:border-border-dark py-2"
              />
            )}
          />
          {errors.age && (
            <Text className="text-danger-light dark:text-danger-dark text-xs mt-1">
              {errors.age.message}
            </Text>
          )}
        </View>

        {/* Height */}
        <View className="mb-6">
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-1">
            Height (cm)
          </Text>
          <Controller
            control={control}
            name="heightCm"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                placeholder="e.g. 175"
                placeholderTextColor="#6B6B6B"
                className="text-text-primary-light dark:text-text-primary-dark text-base border-b border-border-light dark:border-border-dark py-2"
              />
            )}
          />
          {errors.heightCm && (
            <Text className="text-danger-light dark:text-danger-dark text-xs mt-1">
              {errors.heightCm.message}
            </Text>
          )}
        </View>

        {/* Weight */}
        <View className="mb-6">
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-1">
            Weight (kg)
          </Text>
          <Controller
            control={control}
            name="weightKg"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                placeholder="e.g. 70"
                placeholderTextColor="#6B6B6B"
                className="text-text-primary-light dark:text-text-primary-dark text-base border-b border-border-light dark:border-border-dark py-2"
              />
            )}
          />
          {errors.weightKg && (
            <Text className="text-danger-light dark:text-danger-dark text-xs mt-1">
              {errors.weightKg.message}
            </Text>
          )}
        </View>

        {/* Activity Level */}
        <View className="mb-10">
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-2">
            Activity Level
          </Text>
          <Controller
            control={control}
            name="activityLevel"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row flex-wrap gap-2">
                {ACTIVITY_VALUES.map((a) => (
                  <Pressable
                    key={a}
                    onPress={() => onChange(a)}
                    className={`py-2 px-3 rounded-full border ${
                      value === a
                        ? "bg-text-primary-light dark:bg-text-primary-dark border-text-primary-light dark:border-text-primary-dark"
                        : "border-border-light dark:border-border-dark"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        value === a
                          ? "text-screen-light dark:text-screen-dark"
                          : "text-text-secondary-light dark:text-text-secondary-dark"
                      }`}
                    >
                      {ACTIVITY_LABELS[a]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>

        {/* Nudge */}
        <View className="flex-row items-start gap-2 px-1">
          <Icon
            icon={Phosphor.WarningCircleIcon}
            size={14}
            weight="fill"
            className="text-text-secondary-light dark:text-text-secondary-dark opacity-50 mt-0.5"
          />
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs opacity-50 flex-1">
            Accurate info helps Eva calculate better calorie and nutrition goals
            for you.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
