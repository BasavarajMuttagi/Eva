import Icon, { Phosphor } from "@/src/components/Icon";
import { GENDER_VALUES } from "@/src/store/LogStore";
import { useOnboardingData } from "@/src/store/OnboardingData";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Gender = (typeof GENDER_VALUES)[number];

const GENDER_OPTIONS: { key: Gender; label: string }[] = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
  { key: "other", label: "Other" },
];

export default function BodyScreen() {
  const router = useRouter();

  const setHeight = useOnboardingData((s) => s.setHeight);
  const setWeight = useOnboardingData((s) => s.setWeight);
  const setAge = useOnboardingData((s) => s.setAge);
  const setGender = useOnboardingData((s) => s.setGender);

  const [heightVal, setHeightVal] = useState("");
  const [weightVal, setWeightVal] = useState("");
  const [ageVal, setAgeVal] = useState("");
  const [genderVal, setGenderVal] = useState<Gender>("male");

  const handleBack = () => {
    router.back();
  };

  const isDisabled = !heightVal.trim() || !weightVal.trim() || !ageVal.trim();

  const handleContinue = () => {
    if (isDisabled) return;

    setHeight(parseFloat(heightVal));
    setWeight(parseFloat(weightVal));
    setAge(parseInt(ageVal, 10));
    setGender(genderVal);

    router.push("/(onboarding)/activity");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-screen-light dark:bg-screen-dark"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 px-6 pt-16"
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <View className="flex-row items-center justify-between mb-8">
          <Pressable
            onPress={handleBack}
            className="bg-chip-light dark:bg-chip-dark p-2 rounded-full -ml-2"
            hitSlop={8}
          >
            <Icon
              icon={Phosphor.ArrowLeftIcon}
              size={24}
              weight="regular"
              className="text-text-primary-light dark:text-text-primary-dark"
            />
          </Pressable>
        </View>

        {/* Title + subtitle */}
        <View className="pr-6 mb-10">
          <Text className="text-4xl font-extrabold text-text-primary-light dark:text-text-primary-dark leading-tight">
            Tell me a little{"\n"}about you.
          </Text>
          <Text className="mt-4 text-base leading-6 text-text-secondary-light dark:text-text-secondary-dark">
            This helps Eva understand your body,{"\n"}not judge it.
          </Text>
        </View>

        {/* Gender */}
        <View className="mb-10">
          <Text className="text-xs tracking-[0.18em] font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-3">
            GENDER
          </Text>
          <View className="flex-row gap-3">
            {GENDER_OPTIONS.map((opt) => {
              const isSelected = genderVal === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setGenderVal(opt.key)}
                  className={`flex-1 py-3 rounded-full items-center justify-center border ${
                    isSelected
                      ? "bg-text-primary-light dark:bg-text-primary-dark border-text-primary-light dark:border-text-primary-dark"
                      : "bg-transparent border-border-light dark:border-border-dark"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected
                        ? "text-screen-light dark:text-screen-dark"
                        : "text-text-secondary-light dark:text-text-secondary-dark"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Age input */}
        <View className="mb-10">
          <Text className="text-xs tracking-[0.18em] font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-3">
            AGE
          </Text>
          <View className="flex-row items-baseline justify-between">
            <TextInput
              style={{ lineHeight: undefined }}
              value={ageVal}
              onChangeText={setAgeVal}
              keyboardType="numeric"
              placeholder="28"
              placeholderTextColor="#6B6B6B"
              className="flex-1 text-5xl font-semibold text-text-primary-light dark:text-text-primary-dark"
            />
            <Text className="ml-4 text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              yrs
            </Text>
          </View>
          <View className="h-[1px] bg-border-light dark:bg-border-dark mt-2" />
        </View>

        {/* Height input */}
        <View className="mb-10">
          <Text className="text-xs tracking-[0.18em] font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-3">
            HEIGHT
          </Text>
          <View className="flex-row items-baseline justify-between">
            <TextInput
              style={{ lineHeight: undefined }}
              value={heightVal}
              onChangeText={setHeightVal}
              keyboardType="numeric"
              placeholder="170"
              placeholderTextColor="#6B6B6B"
              className="flex-1 text-5xl font-semibold text-text-primary-light dark:text-text-primary-dark"
            />
            <Text className="ml-4 text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              cm
            </Text>
          </View>
          <View className="h-[1px] bg-border-light dark:bg-border-dark mt-2" />
        </View>

        {/* Weight input */}
        <View className="mb-2">
          <Text className="text-xs tracking-[0.18em] font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-3">
            WEIGHT
          </Text>
          <View className="flex-row items-baseline justify-between">
            <TextInput
              style={{ lineHeight: undefined }}
              value={weightVal}
              onChangeText={setWeightVal}
              keyboardType="numeric"
              placeholder="70"
              placeholderTextColor="#6B6B6B"
              className="flex-1 text-5xl font-semibold text-text-primary-light dark:text-text-primary-dark"
            />
            <Text className="ml-4 text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              kg
            </Text>
          </View>
          <View className="h-[1px] bg-border-light dark:bg-border-dark mt-2" />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-8">
        <Pressable
          onPress={handleContinue}
          disabled={isDisabled}
          className={`self-stretch rounded-full py-4 px-6 items-center justify-center ${
            isDisabled
              ? "bg-border-light dark:bg-border-dark"
              : "bg-text-primary-light dark:bg-text-primary-dark"
          }`}
        >
          <View className="flex-row items-center gap-2">
            <Text
              className={`text-base font-semibold ${
                isDisabled
                  ? "text-text-secondary-light dark:text-text-secondary-dark"
                  : "text-screen-light dark:text-screen-dark"
              }`}
            >
              Continue
            </Text>
            {!isDisabled && (
              <Icon
                icon={Phosphor.ArrowRightIcon}
                size={16}
                weight="bold"
                className="text-screen-light dark:text-screen-dark"
              />
            )}
          </View>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
