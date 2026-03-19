import Icon, { Phosphor } from "@/src/components/Icon";
import { GENDER_VALUES } from "@/src/store/LogStore";
import { useOnboardingData } from "@/src/store/OnboardingData";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
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

  const heightNum = parseFloat(heightVal);
  const weightNum = parseFloat(weightVal);
  const ageNum = parseInt(ageVal, 10);

  const heightError =
    heightVal.trim() !== "" &&
    (isNaN(heightNum) || heightNum < 100 || heightNum > 250);
  const weightError =
    weightVal.trim() !== "" &&
    (isNaN(weightNum) || weightNum < 20 || weightNum > 300);
  const ageError =
    ageVal.trim() !== "" && (isNaN(ageNum) || ageNum < 18 || ageNum > 100);

  const isDisabled =
    !heightVal.trim() ||
    !weightVal.trim() ||
    !ageVal.trim() ||
    heightError ||
    weightError ||
    ageError;

  const handleBack = () => router.back();

  const handleContinue = () => {
    if (isDisabled) return;
    setHeight(heightNum);
    setWeight(weightNum);
    setAge(ageNum);
    setGender(genderVal);
    router.push("/(onboarding)/activity");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-screen-light dark:bg-screen-dark"
      behavior="padding"
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
            className="bg-accent-light dark:bg-accent-dark p-2 rounded-full -ml-2"
            hitSlop={8}
          >
            <Icon
              icon={Phosphor.ArrowLeftIcon}
              size={24}
              weight="regular"
              className="text-screen-light"
            />
          </Pressable>
        </View>

        {/* Title + subtitle */}
        <View className="pr-6 mb-10">
          <Text
            style={{
              fontFamily: "LibreBaskerville_700Bold",
              letterSpacing: -1,
            }}
            className="text-4xl text-text-primary-light dark:text-text-primary-dark leading-tight"
          >
            Tell me a little{"\n"}about you.
          </Text>
          <Text className="mt-4 text-base leading-6 text-text-secondary-light dark:text-text-secondary-dark">
            This helps Eva understand your body
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
                      ? "bg-accent-light dark:bg-accent-dark border-accent-light dark:border-accent-dark"
                      : "bg-chip-light dark:bg-card-dark border-chip-light dark:border-border-dark"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected
                        ? "text-screen-light"
                        : "text-text-primary-light dark:text-text-primary-dark"
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
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-5xl font-semibold text-text-primary-light dark:text-text-primary-dark"
            />
            <Text className="ml-4 text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              yrs
            </Text>
          </View>
          <View className="h-[1px] bg-border-light dark:bg-border-dark mt-2" />
          {ageError && (
            <Text className="text-danger-light dark:text-danger-dark text-xs mt-2">
              Enter 18–100
            </Text>
          )}
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
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-5xl font-semibold text-text-primary-light dark:text-text-primary-dark"
            />
            <Text className="ml-4 text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              cm
            </Text>
          </View>
          <View className="h-[1px] bg-border-light dark:bg-border-dark mt-2" />
          {heightError && (
            <Text className="text-danger-light dark:text-danger-dark text-xs mt-2">
              Enter 100–250 cm
            </Text>
          )}
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
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-5xl font-semibold text-text-primary-light dark:text-text-primary-dark"
            />
            <Text className="ml-4 text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              kg
            </Text>
          </View>
          <View className="h-[1px] bg-border-light dark:bg-border-dark mt-2" />
          {weightError && (
            <Text className="text-danger-light dark:text-danger-dark text-xs mt-2">
              Enter 20–300 kg
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-10">
        <Pressable
          onPress={handleContinue}
          disabled={isDisabled}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          className={`flex-row items-center rounded-2xl py-4 px-6 ${
            isDisabled
              ? "bg-chip-light dark:bg-card-dark"
              : "bg-accent-light dark:bg-accent-dark"
          }`}
        >
          <Text
            className={`text-sm font-semibold flex-1 text-center ${
              isDisabled
                ? "text-text-secondary-light dark:text-text-secondary-dark"
                : "text-screen-light"
            }`}
          >
            Continue
          </Text>
          <Icon
            icon={Phosphor.ArrowRightIcon}
            size={18}
            weight="regular"
            className={
              isDisabled
                ? "text-text-secondary-light dark:text-text-secondary-dark"
                : "text-screen-light"
            }
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
