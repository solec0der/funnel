"use client";

import { NotificationList } from "@/components/notifications/notification-list";
import { useNotifications } from "@/hooks/use-notifications";

export default function NotificationsPage() {
  const { notifications, loading, loadingMore, hasMore, loadMore } =
    useNotifications();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold tracking-tight">Notifications</h1>
      <NotificationList
        notifications={notifications}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        loadMore={loadMore}
      />
    </div>
  );
}
