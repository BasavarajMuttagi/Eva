import AudioWaveform from "@/src/components/AudioWaveform";
import Icon, { Phosphor } from "@/src/components/Icon";
import { authClient } from "@/src/lib/auth-client";
import { useLiveTranscribe } from "@/src/lib/useSarvamLiveTranslate";
import { useLogStore } from "@/src/store/LogStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { v4 as uuidv4 } from "uuid";

export default function VoiceTranslateScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? "";
  const { addLog } = useLogStore();

  const { transcript, metering, state, remaining, stopSession, reset } =
    useLiveTranscribe();

  const [editableText, setEditableText] = useState("");
  const isClosingRef = useRef(false);

  const targetDateIso = useMemo(() => {
    if (!date) return new Date().toISOString();

    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
      ? new Date().toISOString()
      : parsed.toISOString();
  }, [date]);

  useEffect(() => {
    setEditableText(transcript);
  }, [transcript]);

  const handleClose = useCallback(async () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    try {
      await stopSession();
    } catch {}

    router.dismiss();
  }, [stopSession, router]);

  const handleReset = useCallback(async () => {
    setEditableText("");
    await reset();
  }, [reset]);

  const handleAdd = useCallback(async () => {
    const text = editableText.trim();
    if (!text || !userId) return;

    try {
      await stopSession();
    } catch {}

    addLog(uuidv4(), text, userId, targetDateIso);
    router.dismiss();
  }, [editableText, userId, stopSession, addLog, targetDateIso, router]);

  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", () => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      stopSession().catch(() => {});
    });

    return sub;
  }, [navigation, stopSession]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={handleClose}
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
          Voice Log
        </Text>
      ),
    });
  }, [navigation, handleClose]);

  const statusText =
    state === "uploading"
      ? "Transcribing…"
      : state === "done"
        ? "Done"
        : state === "error"
          ? "Something went wrong"
          : `Listening… ${remaining}s`;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-screen-light dark:bg-screen-dark"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-5 pt-5 pb-5">
        <View className="items-center justify-start gap-2">
          <Text className="text-xs font-semibold tracking-[2px] text-text-secondary-light dark:text-text-secondary-dark">
            {statusText}
          </Text>

          <AudioWaveform
            metering={metering ?? 0}
            barCount={24}
            barWidth={4}
            barGap={8}
            height={30}
            sensitivity={1}
            overflow={1}
          />
        </View>

        <View className="flex-1 py-5">
          <View className="flex-1 min-h-0 rounded-3xl bg-chip-light dark:bg-chip-dark p-4">
            <TextInput
              value={editableText}
              onChangeText={setEditableText}
              placeholder="Speak in English…"
              placeholderTextColor="#6B6B6B"
              multiline
              scrollEnabled
              textAlignVertical="top"
              className="flex-1 min-h-0 text-lg font-semibold text-text-primary-light dark:text-text-primary-dark"
            />
          </View>
        </View>

        <View className="justify-end gap-3">
          <View className="flex-row items-center justify-center gap-1.5 px-1">
            <Ionicons name="flask-outline" size={12} color="#8A8A8A" />
            <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
              Voice Log is experimental and currently supports English only.
            </Text>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleReset}
              className="flex-1 min-h-[52px] items-center justify-center rounded-full border border-border-light dark:border-border-dark bg-chip-light dark:bg-chip-dark px-4"
            >
              <Text className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                Re-record
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAdd}
              disabled={!editableText.trim() || !userId}
              className={`flex-1 min-h-[52px] items-center justify-center rounded-full px-4 ${
                editableText.trim() && userId
                  ? "bg-accent-light dark:bg-accent-dark"
                  : "bg-accent-light/40 dark:bg-accent-dark/40"
              }`}
            >
              <Text className="text-base font-semibold text-white">Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
