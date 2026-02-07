"use client";

import { useEffect, useRef } from "react";
import { NotificationItem } from "./notification-item";
import { NotificationGroupHeader } from "./notification-group";
import { BulkActionsBar } from "./bulk-actions-bar";
import { groupByDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Cable } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Notification } from "@/lib/types";

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onClearSelection: () => void;
}

export function NotificationList({
  notifications,
  loading,
  loadingMore,
  hasMore,
  loadMore,
  selectedIds,
  onToggleSelection,
  onClearSelection,
}: NotificationListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const selectionMode = selectedIds.size > 0;

  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMore, loadingMore, loadMore]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Bell className="h-10 w-10" />
        <p className="text-sm">No notifications yet.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/sources">
            <Cable className="mr-1.5 h-4 w-4" />
            Set up a source
          </Link>
        </Button>
      </div>
    );
  }

  const groups = groupByDate(notifications);

  return (
    <>
      <div className="flex flex-col gap-1">
        {groups.map((group) => (
          <div key={group.label}>
            <NotificationGroupHeader label={group.label} />
            <div className="flex flex-col gap-1">
              {group.notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  selectable={selectionMode}
                  selected={selectedIds.has(n.id)}
                  onToggleSelection={onToggleSelection}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-1" />

        {loadingMore && (
          <div className="flex flex-col gap-2 py-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        )}
      </div>

      <BulkActionsBar
        selectedIds={selectedIds}
        onClearSelection={onClearSelection}
      />
    </>
  );
}
