"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProviderIcon } from "@/components/icons/provider-icons";
import { PriorityBadge } from "./priority-badge";
import { relativeTime } from "@/lib/format";
import { markAsRead, archiveNotification } from "@/lib/firebase/notifications";
import { useAuth } from "@/hooks/use-auth";
import { ExternalLink, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/lib/types";

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const createdAt = notification.createdAt?.toDate?.()
    ? notification.createdAt.toDate()
    : new Date();

  function handleClick() {
    setExpanded((prev) => !prev);
    if (!notification.read && user) {
      markAsRead(user.uid, notification.id);
    }
  }

  function handleArchive(e: React.MouseEvent) {
    e.stopPropagation();
    if (user) {
      archiveNotification(user.uid, notification.id);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className={`group relative rounded-lg border p-3 transition-colors cursor-pointer hover:bg-accent/50 ${
        !notification.read
          ? "border-l-2 border-l-primary bg-accent/30"
          : "border-transparent"
      }`}
    >
      <div className="flex items-start gap-3">
        <ProviderIcon provider={notification.provider} className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm truncate ${
                !notification.read ? "font-semibold" : "font-medium"
              }`}
            >
              {notification.title}
            </span>
          </div>
          {!expanded && notification.body && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {notification.body}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PriorityBadge priority={notification.priority} />
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {relativeTime(createdAt)}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-2 border-t pt-3">
              {notification.body && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {notification.body}
                </p>
              )}
              <div className="flex items-center gap-2">
                {notification.url && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={notification.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="mr-1.5 h-3 w-3" />
                      Open original
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleArchive}
                >
                  <Archive className="mr-1.5 h-3 w-3" />
                  Archive
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
