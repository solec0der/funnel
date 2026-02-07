"use client";

import { useState, useEffect, useCallback } from "react";
import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationFiltersBar } from "@/components/notifications/notification-filters";
import { useNotifications } from "@/hooks/use-notifications";
import { usePreferences } from "@/hooks/use-preferences";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NotificationView, NotificationFilters } from "@/lib/types";

const VIEWS: { value: NotificationView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "work", label: "Work" },
  { value: "personal", label: "Personal" },
  { value: "critical", label: "Critical" },
];

const SESSION_KEY = "funnel:last-view";

export default function NotificationsPage() {
  const { preferences, loading: prefsLoading } = usePreferences();
  const [initialized, setInitialized] = useState(false);

  const [filters, setFilters] = useState<NotificationFilters>({
    view: "all",
    providers: [],
    priorities: [],
    unreadOnly: false,
    search: "",
  });

  // Initialize view from sessionStorage or preferences
  useEffect(() => {
    if (prefsLoading) return;
    const stored = sessionStorage.getItem(SESSION_KEY) as NotificationView | null;
    const view = stored || preferences.defaultView || "all";
    setFilters((prev) => ({ ...prev, view }));
    setInitialized(true);
  }, [prefsLoading, preferences.defaultView]);

  const handleViewChange = useCallback((value: string) => {
    const view = value as NotificationView;
    sessionStorage.setItem(SESSION_KEY, view);
    setFilters((prev) => ({ ...prev, view }));
  }, []);

  const { notifications, loading, loadingMore, hasMore, loadMore } =
    useNotifications(filters);

  // Track selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Clear selection when filters change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [filters.view, filters.providers, filters.priorities, filters.unreadOnly, filters.search]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  if (!initialized) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Notifications</h1>
      </div>

      <Tabs value={filters.view} onValueChange={handleViewChange}>
        <TabsList>
          {VIEWS.map((v) => (
            <TabsTrigger key={v.value} value={v.value}>
              {v.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <NotificationFiltersBar filters={filters} onChange={setFilters} />

      <NotificationList
        notifications={notifications}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        loadMore={loadMore}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        onClearSelection={clearSelection}
      />
    </div>
  );
}
