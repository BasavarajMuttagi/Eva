import Icon, { Phosphor } from "@/src/components/Icon";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function WhatShouldEvaCallYouScreen() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (!name.trim()) return;
    router.push("/(onboarding)/body");
  };

  const isDisabled = !name.trim();

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-6 pt-16 pb-10">
      {/* Top bar: chipped back */}
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={handleBack}
          className="bg-chip-light dark:bg-chip-dark p-2 rounded-full -ml-2"
          hitSlop={8}
        >
          <Icon
            icon={Phosphor.ArrowLeftIcon}
            size={18}
            weight="bold"
            className="text-text-primary-light dark:text-text-primary-dark"
          />
        </Pressable>
      </View>

      {/* Main content centered vertically */}
      <View className="flex-1 justify-center px-2">
        {/* Question */}
        <View className="items-center">
          <Text className="text-4xl font-extrabold text-text-primary-light dark:text-text-primary-dark leading-tight text-center">
            What should Eva{"\n"}call you?
          </Text>

          <Text className="mt-4 text-base leading-6 text-text-secondary-light dark:text-text-secondary-dark text-center">
            Eva likes to know who she's talking{"\n"}to.
          </Text>
        </View>

        {/* Name input */}
        <View className="mt-16">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#6B6B6B" // text.secondary.light, like body placeholders
            className="text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark text-center pb-2"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />

          <View className="mt-2 h-[1px] bg-text-primary-light dark:bg-text-primary-dark" />
        </View>
      </View>

      {/* Continue button */}
      <Pressable
        onPress={handleContinue}
        disabled={isDisabled}
        className={`self-stretch rounded-full py-4 px-6 items-center justify-center ${
          isDisabled
            ? "bg-border-light dark:bg-border-dark"
            : "bg-text-primary-light dark:bg-text-primary-dark"
        }`}
      >
        <Text
          className={`text-base font-semibold ${
            isDisabled
              ? "text-text-secondary-light dark:text-text-secondary-dark"
              : "text-screen-light dark:text-screen-dark"
          }`}
        >
          Continue
        </Text>
      </Pressable>

      {/* Tagline */}
      <View className="mt-3 items-center">
        <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark text-center">
          Mindful journaling begins with a connection.
        </Text>
      </View>
    </View>
  );
}
