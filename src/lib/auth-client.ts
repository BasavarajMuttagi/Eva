import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL, APP_SCHEME } from "./constants";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: APP_SCHEME,
      storagePrefix: APP_SCHEME,
      storage: SecureStore,
    }),
  ],
});
