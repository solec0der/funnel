"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  subscribeNotifications,
  loadMoreNotifications,
} from "@/lib/firebase/notifications";
import type { Notification } from "@/lib/types";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const extraRef = useRef<Notification[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    extraRef.current = [];

    const unsubscribe = subscribeNotifications(
      user.uid,
      (firstPage, lastDoc, more) => {
        // Merge real-time first page with any previously loaded extra pages
        setNotifications([...firstPage, ...extraRef.current]);
        lastDocRef.current = extraRef.current.length > 0 ? lastDocRef.current : lastDoc;
        setHasMore(extraRef.current.length > 0 ? hasMore : more);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const loadMore = useCallback(async () => {
    if (!user || !lastDocRef.current || loadingMore) return;

    setLoadingMore(true);
    try {
      const result = await loadMoreNotifications(user.uid, lastDocRef.current);
      extraRef.current = [...extraRef.current, ...result.notifications];
      setNotifications((prev) => [...prev, ...result.notifications]);
      lastDocRef.current = result.lastDoc;
      setHasMore(result.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }, [user, loadingMore]);

  return { notifications, loading, loadingMore, hasMore, loadMore };
}
