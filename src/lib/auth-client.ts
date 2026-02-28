// lib/auth-client.ts
import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: "https://unsubtractive-babara-ovately.ngrok-free.dev", // your worker auth URL
  plugins: [
    expoClient({
      scheme: "eva", // <- matches app.json
      storagePrefix: "eva", // any prefix you like
      storage: SecureStore,
    }),
  ],
});
