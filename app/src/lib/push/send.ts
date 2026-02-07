import { getAdminDb, getAdminMessaging } from "@/lib/firebase/admin";
import { isQuietHours } from "./quiet-hours";
import type { Priority, UserPreferences } from "@/lib/types";

interface PushPayload {
  title: string;
  body: string;
  url: string | null;
  notificationId: string;
  priority: Priority;
}

interface SourcePushConfig {
  pushEnabled: boolean;
  pushPriorityOverride: Priority | null;
  provider: string;
}

export async function sendPushNotification(
  userId: string,
  payload: PushPayload,
  source: SourcePushConfig
): Promise<void> {
  const db = getAdminDb();

  // Read user doc for tokens and preferences
  const userDoc = await db.doc(`users/${userId}`).get();
  if (!userDoc.exists) return;

  const userData = userDoc.data()!;
  const tokens: string[] = userData.fcmTokens || [];
  if (tokens.length === 0) return;

  const preferences: UserPreferences = {
    defaultView: "all",
    timezone: "UTC",
    quietHoursStart: null,
    quietHoursEnd: null,
    pushMasterMute: false,
    ...userData.preferences,
  };

  const priority = source.pushPriorityOverride || payload.priority;

  // Priority rules
  if (priority === "low") return;

  if (preferences.pushMasterMute && priority !== "critical") return;

  if (!source.pushEnabled && priority !== "critical") return;

  const quiet = isQuietHours(preferences);
  if (quiet && priority !== "critical") {
    if (priority === "high") return;
    if (priority === "normal") return;
  }

  const tag = `${source.provider}-${payload.notificationId}`;
  const urgency = priority === "critical" ? "high" : "normal";

  const messaging = getAdminMessaging();

  const message = {
    tokens,
    webpush: {
      headers: {
        Urgency: urgency,
      },
      notification: {
        title: payload.title,
        body: payload.body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag,
        requireInteraction: priority === "critical",
        data: {
          url: payload.url || "/",
          notificationId: payload.notificationId,
          priority,
        },
        actions: [
          { action: "open", title: "Open" },
          { action: "archive", title: "Archive" },
        ] as unknown as undefined, // FCM types don't include actions but webpush supports them
      },
    },
  };

  try {
    const response = await messaging.sendEachForMulticast(message);

    // Clean up stale tokens
    if (response.failureCount > 0) {
      const staleTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (
          resp.error?.code === "messaging/registration-token-not-registered" ||
          resp.error?.code === "messaging/invalid-registration-token"
        ) {
          staleTokens.push(tokens[idx]);
        }
      });

      if (staleTokens.length > 0) {
        const { FieldValue } = await import("firebase-admin/firestore");
        await db.doc(`users/${userId}`).update({
          fcmTokens: FieldValue.arrayRemove(...staleTokens),
        });
      }
    }
  } catch (err) {
    console.error("[push] Failed to send notification:", err);
  }
}
