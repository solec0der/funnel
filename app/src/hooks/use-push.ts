"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  subscribeToPush,
  unsubscribeFromPush,
  getExistingSubscription,
} from "@/lib/push/client";
import { registerToken, removeToken } from "@/lib/firebase/fcm-tokens";

export function usePush() {
  const { user } = useAuth();
  const [permissionState, setPermissionState] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setLoading(false);
      return;
    }

    setPermissionState(Notification.permission);

    if (Notification.permission === "granted") {
      getExistingSubscription().then((sub) => {
        setIsSubscribed(!!sub);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      if (permission !== "granted") {
        setLoading(false);
        return;
      }

      const subscription = await subscribeToPush();
      await registerToken(user.uid, subscription);
      setIsSubscribed(true);
    } catch (err) {
      console.error("[push] Subscribe failed:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const unsubscribe = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const existing = await getExistingSubscription();
      if (existing) {
        await removeToken(user.uid, existing);
      }
      await unsubscribeFromPush();
      setIsSubscribed(false);
    } catch (err) {
      console.error("[push] Unsubscribe failed:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { permissionState, isSubscribed, subscribe, unsubscribe, loading };
}
