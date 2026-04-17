import { useLogStore } from "@/src/store/LogStore";
import { usePreferencesStore } from "@/src/store/PreferencesStore";
import { useSavedMealStore } from "@/src/store/SavedMealStore";
import { useEffect } from "react";
import { authClient } from "../lib/auth-client";

export function AppServices() {
  const { data: session } = authClient.useSession();
  const { sync, clear } = useLogStore();
  const { sync: syncSavedMeals, clear: clearSavedMeals } = useSavedMealStore();
  const { fetch: fetchPrefs, clear: clearPrefs } = usePreferencesStore();

  useEffect(() => {
    if (!session?.user?.id) {
      //clear both stores when session disappears (sign out, token expiry)
      clear();
      clearSavedMeals();
      clearPrefs();
      return;
    }

    //clear then fetch both stores on user change
    clear();
    clearSavedMeals();
    clearPrefs();
    sync();
    syncSavedMeals();
    fetchPrefs();
  }, [
    session?.user?.id,
    clear,
    clearSavedMeals,
    clearPrefs,
    fetchPrefs,
    sync,
    syncSavedMeals,
  ]);

  return null;
}
