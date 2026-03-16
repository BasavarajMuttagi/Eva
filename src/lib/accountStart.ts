// src/lib/accountStart.ts
import { authClient } from "@/src/lib/auth-client";

export function useAccountStart() {
  const { data: session } = authClient.useSession();
  const createdAt = session?.user?.createdAt;
  return createdAt ? new Date(createdAt) : new Date();
}
