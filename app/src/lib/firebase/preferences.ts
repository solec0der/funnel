import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getClientDb } from "./client";
import type { UserPreferences } from "@/lib/types";

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultView: "all",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  quietHoursStart: null,
  quietHoursEnd: null,
};

export function subscribePreferences(
  userId: string,
  callback: (preferences: UserPreferences) => void
): () => void {
  const db = getClientDb();
  return onSnapshot(doc(db, "users", userId), (snapshot) => {
    const data = snapshot.data();
    callback({ ...DEFAULT_PREFERENCES, ...data?.preferences });
  });
}

export async function updatePreferences(
  userId: string,
  updates: Partial<UserPreferences>
): Promise<void> {
  const db = getClientDb();
  const prefUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    prefUpdates[`preferences.${key}`] = value;
  }
  await updateDoc(doc(db, "users", userId), prefUpdates);
}
