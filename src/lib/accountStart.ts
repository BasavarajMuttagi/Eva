// lib/accountStart.ts
import { authClient } from "@/src/lib/auth-client";
import { startOfDay } from "date-fns";

export function useAccountStartDay() {
  const { data: session } = authClient.useSession();
  const createdAt = (session as any)?.user?.createdAt;
  const raw = createdAt ? new Date(createdAt) : new Date();
  // Normalize to local start of day so we compare only by date
  return startOfDay(raw);
}
