import axios from "axios";
import { authClient } from "./auth-client";
import { API_BASE_URL } from "./constants";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
