import axios from "axios";
import { authClient } from "./auth-client";

export const API_BASE = "https://unsubtractive-babara-ovately.ngrok-free.dev";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// 🔐 Attach Better Auth cookie automatically
apiClient.interceptors.request.use((config) => {
  const cookie = authClient.getCookie();

  if (cookie) {
    config.headers.Cookie = cookie;
  }

  return config;
});
