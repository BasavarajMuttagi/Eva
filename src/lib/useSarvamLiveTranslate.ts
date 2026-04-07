// hooks/useLiveTranscribe.ts

import {
  AudioModule,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { File, Paths } from "expo-file-system";
import PQueue from "p-queue";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "./apiClient";

// ─── config ───────────────────────────────────────────────────────────────────
const METERING_INTERVAL_MS = 80;
const CHUNK_MS = 3_000;
const MAX_MS = 60_000;
const MAX_SECONDS = MAX_MS / 1000;

const RECORDER_OPTIONS = {
  extension: ".wav",
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 64000,
  android: {
    outputFormat: "default" as const,
    audioEncoder: "default" as const,
  },
  ios: {
    outputFormat: "lpcm" as const,
    audioQuality: 0,
    linearPCMBitDepth: 16,
    linearPCMIsFloat: false,
    linearPCMIsBigEndian: false,
  },
  web: { mimeType: "audio/wav", bitsPerSecond: 128000 },
  isMeteringEnabled: true,
} as const;

export type TranscribeState =
  | "idle"
  | "recording"
  | "uploading"
  | "done"
  | "error";

// ─── pure helpers ─────────────────────────────────────────────────────────────

/**
 * expo-audio already writes to the sandbox cache dir (confirmed in AudioRecorder.swift).
 * The only reason to copy is to snapshot a stable path before prepareToRecordAsync()
 * overwrites recorder.uri on the next chunk cycle.
 */
function snapshotToCache(uri: string, index: number): string | null {
  try {
    const src = new File(uri);
    const dest = new File(Paths.cache, `chunk-${index}-${Date.now()}.wav`);
    src.copy(dest); // sync, same-sandbox copy — cheap
    return dest.uri;
  } catch {
    return null;
  }
}

async function transcribeChunk(uri: string): Promise<string> {
  const file = new File(uri);
  try {
    const buf = await file.arrayBuffer();
    const { data } = await apiClient.post<{ text: string }>(
      "/api/transcribe",
      buf,
      { headers: { "Content-Type": "audio/wave" } },
    );
    return data.text?.trim() ?? "";
  } finally {
    try {
      file.delete();
    } catch {}
  }
}

// ─── hook ─────────────────────────────────────────────────────────────────────
export function useLiveTranscribe() {
  const [transcript, setTranscript] = useState("");
  const [state, setState] = useState<TranscribeState>("idle");
  const [remaining, setRemaining] = useState(MAX_SECONDS);
  const [frozenMeter, setFrozenMeter] = useState<number | null>(null);

  const mounted = useRef(true);
  const active = useRef(false);
  const started = useRef(false);
  const sessionStart = useRef(0);
  const chunkIndex = useRef(0);
  const chunkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdown = useRef<ReturnType<typeof setInterval> | null>(null);

  // concurrency:1 → serial uploads, never overlap, built-in backpressure
  const uploadQueue = useRef(new PQueue({ concurrency: 1 }));

  const recorder = useAudioRecorder(RECORDER_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, METERING_INTERVAL_MS);

  useEffect(() => {
    if (recorderState.isRecording && recorderState.metering != null)
      setFrozenMeter(recorderState.metering);
  }, [recorderState.metering, recorderState.isRecording]);

  // ── helpers ───────────────────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    if (chunkTimer.current) {
      clearTimeout(chunkTimer.current);
      chunkTimer.current = null;
    }
    if (maxTimer.current) {
      clearTimeout(maxTimer.current);
      maxTimer.current = null;
    }
    if (countdown.current) {
      clearInterval(countdown.current);
      countdown.current = null;
    }
  }, []);

  const enqueueUpload = useCallback((uri: string) => {
    uploadQueue.current.add(async () => {
      const text = await transcribeChunk(uri);
      if (text && mounted.current)
        setTranscript((prev) => (prev ? `${prev} ${text}` : text));
    });
  }, []);

  // ── chunk loop ────────────────────────────────────────────────────────────
  const runChunkRef = useRef<() => Promise<void>>(async () => {});

  runChunkRef.current = async () => {
    if (!active.current) return;
    const index = ++chunkIndex.current;

    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      if (mounted.current) setState("error");
      active.current = false;
      clearTimers();
      return;
    }

    chunkTimer.current = setTimeout(async () => {
      if (!active.current) return;
      try {
        await recorder.stop();
        // snapshot before prepareToRecordAsync() on the next cycle reuses the path
        const snap = recorder.uri ? snapshotToCache(recorder.uri, index) : null;
        runChunkRef.current(); // restart immediately, don't await upload
        if (snap) enqueueUpload(snap);
      } catch {
        runChunkRef.current();
      }
    }, CHUNK_MS);
  };

  // ── stop ──────────────────────────────────────────────────────────────────
  const stopSession = useCallback(async () => {
    if (!active.current) return;
    active.current = false;
    clearTimers();
    if (mounted.current) {
      setRemaining(0);
      setState("uploading");
    }

    try {
      await recorder.stop();
      const snap = recorder.uri
        ? snapshotToCache(recorder.uri, ++chunkIndex.current)
        : null;
      if (snap) enqueueUpload(snap);
    } catch {}

    await uploadQueue.current.onIdle(); // wait for all in-flight uploads
    if (mounted.current) setState("done");
  }, [recorder, enqueueUpload, clearTimers]);

  // ── start ─────────────────────────────────────────────────────────────────
  const startSession = useCallback(async () => {
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    if (!granted) {
      if (mounted.current) setState("error");
      return;
    }

    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });

    active.current = true;
    started.current = true;
    sessionStart.current = Date.now();
    chunkIndex.current = 0;
    uploadQueue.current.clear();

    if (mounted.current) {
      setState("recording");
      setRemaining(MAX_SECONDS);
    }

    countdown.current = setInterval(() => {
      if (!mounted.current || !active.current) return;
      const elapsed = Date.now() - sessionStart.current;
      setRemaining(Math.max(0, Math.ceil((MAX_MS - elapsed) / 1000)));
    }, 250);

    maxTimer.current = setTimeout(stopSession, MAX_MS);
    runChunkRef.current();
  }, [stopSession]);

  // ── reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(async () => {
    active.current = false;
    clearTimers();
    uploadQueue.current.clear();
    try {
      await recorder.stop();
    } catch {}
    if (mounted.current) {
      setTranscript("");
      setFrozenMeter(null);
      setState("idle");
      setRemaining(MAX_SECONDS);
    }
    started.current = false;
    setTimeout(() => {
      if (mounted.current) startSession();
    }, 300);
  }, [recorder, clearTimers, startSession]);

  // ── lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    mounted.current = true;
    if (!started.current) {
      started.current = true;
      startSession();
    }
    return () => {
      mounted.current = false;
      active.current = false;
      started.current = false;
      clearTimers();
      uploadQueue.current.clear();
      recorder.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    transcript,
    state,
    remaining,
    isRecording: recorderState.isRecording,
    metering: recorderState.isRecording
      ? (recorderState.metering ?? frozenMeter)
      : frozenMeter,
    stopSession,
    reset,
  };
}
