"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  subscribeNotifications,
  loadMoreNotifications,
} from "@/lib/firebase/notifications";
import type { Notification, NotificationFilters } from "@/lib/types";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

const DEFAULT_FILTERS: NotificationFilters = {
  view: "all",
  providers: [],
  priorities: [],
  unreadOnly: false,
  search: "",
};

export function useNotifications(filters: NotificationFilters = DEFAULT_FILTERS) {
  const { user } = useAuth();
  const [rawNotifications, setRawNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const extraRef = useRef<Notification[]>([]);

  // Re-subscribe when view changes (different Firestore query)
  useEffect(() => {
    if (!user) {
      setRawNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    extraRef.current = [];
    lastDocRef.current = null;

    const unsubscribe = subscribeNotifications(
      user.uid,
      filters.view,
      (firstPage, lastDoc, more) => {
        setRawNotifications([...firstPage, ...extraRef.current]);
        lastDocRef.current = extraRef.current.length > 0 ? lastDocRef.current : lastDoc;
        setHasMore(extraRef.current.length > 0 ? hasMore : more);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, filters.view]);

  const loadMore = useCallback(async () => {
    if (!user || !lastDocRef.current || loadingMore) return;

    setLoadingMore(true);
    try {
      const result = await loadMoreNotifications(user.uid, filters.view, lastDocRef.current);
      extraRef.current = [...extraRef.current, ...result.notifications];
      setRawNotifications((prev) => [...prev, ...result.notifications]);
      lastDocRef.current = result.lastDoc;
      setHasMore(result.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }, [user, filters.view, loadingMore]);

  // Client-side filtering for providers, priorities, unreadOnly, search
  const notifications = useMemo(() => {
    let result = rawNotifications;

    if (filters.providers.length > 0) {
      result = result.filter((n) => filters.providers.includes(n.provider));
    }

    if (filters.priorities.length > 0) {
      result = result.filter((n) => filters.priorities.includes(n.priority));
    }

    if (filters.unreadOnly) {
      result = result.filter((n) => !n.read);
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(term) ||
          n.body.toLowerCase().includes(term)
      );
    }

    return result;
  }, [rawNotifications, filters.providers, filters.priorities, filters.unreadOnly, filters.search]);

  return { notifications, loading, loadingMore, hasMore, loadMore };
}
