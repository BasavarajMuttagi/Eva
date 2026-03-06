// src/components/AppServices.tsx
import { useLogStore } from "@/src/store/LogStore";
import { useEffect } from "react";
import { authClient } from "../lib/auth-client";

export function AppServices() {
  const { data: session } = authClient.useSession();
  const { sync, clear } = useLogStore();

  useEffect(() => {
    if (!session?.user?.id) return;
    clear(); // wipe any previous user's data
    sync(); // fetch fresh data for current user
  }, [session?.user?.id]);

  return null;
}
