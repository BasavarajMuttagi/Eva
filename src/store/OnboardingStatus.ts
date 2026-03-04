import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OnboardingStatusState {
  isOnboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;
}

const secureStorage = {
  getItem: (name: string): Promise<string | null> => {
    return SecureStore.getItemAsync(name);
  },
  setItem: (name: string, value: string): Promise<void> => {
    return SecureStore.setItemAsync(name, value);
  },
  removeItem: (name: string): Promise<void> => {
    return SecureStore.deleteItemAsync(name);
  },
};

export const useOnboardingStatus = create<OnboardingStatusState>()(
  persist(
    (set): OnboardingStatusState => ({
      isOnboardingComplete: false,
      setOnboardingComplete: (value: boolean) =>
        set({ isOnboardingComplete: value }),
    }),
    {
      name: "onboarding-status",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
