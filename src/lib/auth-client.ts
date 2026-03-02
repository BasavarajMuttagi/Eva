// lib/auth-client.ts
import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "./constants";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: "eva",
      storagePrefix: "eva",
      storage: SecureStore,
    }),
  ],
});
