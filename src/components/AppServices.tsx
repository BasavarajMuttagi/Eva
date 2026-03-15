import { useLogStore } from "@/src/store/LogStore";
import { usePreferencesStore } from "@/src/store/PreferencesStore";
import { useEffect } from "react";
import { authClient } from "../lib/auth-client";

export function AppServices() {
  const { data: session } = authClient.useSession();
  const { sync, clear } = useLogStore();
  const { fetch: fetchPrefs, clear: clearPrefs } = usePreferencesStore();

  useEffect(() => {
    if (!session?.user?.id) {
      //clear both stores when session disappears (sign out, token expiry)
      clear();
      clearPrefs();
      return;
    }

    //clear then fetch both stores on user change
    clear();
    clearPrefs();
    sync();
    fetchPrefs();
  }, [session?.user?.id]);

  return null;
}
