"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  subscribePreferences,
  updatePreferences as updatePrefs,
} from "@/lib/firebase/preferences";
import type { UserPreferences } from "@/lib/types";

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultView: "all",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  quietHoursStart: null,
  quietHoursEnd: null,
  pushMasterMute: false,
};

export function usePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPreferences(DEFAULT_PREFERENCES);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribePreferences(user.uid, (prefs) => {
      setPreferences(prefs);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      if (!user) return;
      // Optimistic update
      setPreferences((prev) => ({ ...prev, ...updates }));
      await updatePrefs(user.uid, updates);
    },
    [user]
  );

  return { preferences, loading, updatePreferences };
}
