import type { UserPreferences } from "@/lib/types";

export function isQuietHours(preferences: UserPreferences): boolean {
  if (!preferences.quietHoursStart || !preferences.quietHoursEnd) return false;

  const tz = preferences.timezone || "UTC";
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const currentTime = formatter.format(now); // "HH:MM"

  const start = preferences.quietHoursStart; // "HH:MM"
  const end = preferences.quietHoursEnd; // "HH:MM"

  if (start <= end) {
    // Same-day range (e.g., 09:00–17:00)
    return currentTime >= start && currentTime < end;
  }
  // Overnight range (e.g., 22:00–07:00)
  return currentTime >= start || currentTime < end;
}
