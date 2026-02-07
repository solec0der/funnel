"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { ProviderIcon } from "@/components/icons/provider-icons";
import { PriorityBadge } from "./priority-badge";
import { relativeTime } from "@/lib/format";
import { markAsRead, markAsUnread, archiveNotification } from "@/lib/firebase/notifications";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExternalLink, Archive, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Notification } from "@/lib/types";

interface NotificationItemProps {
  notification: Notification;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelection?: (id: string) => void;
}

const SWIPE_THRESHOLD = 100;

export function NotificationItem({
  notification,
  selectable = false,
  selected = false,
  onToggleSelection,
}: NotificationItemProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);
  const dragX = useMotionValue(0);
  const archiveBg = useTransform(dragX, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const readBg = useTransform(dragX, [0, SWIPE_THRESHOLD], [0, 1]);

  const createdAt = notification.createdAt?.toDate?.()
    ? notification.createdAt.toDate()
    : new Date();

  function handleClick() {
    if (selectable && onToggleSelection) {
      onToggleSelection(notification.id);
      return;
    }
    setExpanded((prev) => !prev);
    if (!notification.read && user) {
      markAsRead(user.uid, notification.id);
    }
  }

  function handleCheckboxClick(e: React.MouseEvent) {
    e.stopPropagation();
    onToggleSelection?.(notification.id);
  }

  function handleArchive(e: React.MouseEvent) {
    e.stopPropagation();
    if (user) {
      archiveNotification(user.uid, notification.id);
    }
  }

  function handleMarkUnread(e: React.MouseEvent) {
    e.stopPropagation();
    if (user) {
      markAsUnread(user.uid, notification.id);
      setExpanded(false);
    }
  }

  function handleDragEnd() {
    const x = dragX.get();
    if (x < -SWIPE_THRESHOLD && user) {
      archiveNotification(user.uid, notification.id);
    } else if (x > SWIPE_THRESHOLD && user) {
      if (notification.read) {
        markAsUnread(user.uid, notification.id);
      } else {
        markAsRead(user.uid, notification.id);
      }
    }
  }

  const content = (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className={`group relative rounded-lg border p-3 transition-colors cursor-pointer hover:bg-accent/50 ${
        !notification.read
          ? "border-l-2 border-l-primary bg-accent/30"
          : "border-transparent"
      } ${selected ? "bg-accent ring-1 ring-primary/50" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Selection checkbox */}
        {(selectable || selected) && (
          <div className="mt-0.5 shrink-0" onClick={handleCheckboxClick}>
            <Checkbox checked={selected} />
          </div>
        )}

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
                {notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkUnread}
                  >
                    <MailOpen className="mr-1.5 h-3 w-3" />
                    Mark unread
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

  // Wrap with swipe gestures on mobile
  if (isMobile) {
    return (
      <div className="relative overflow-hidden rounded-lg">
        {/* Archive background (swipe left) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-end bg-destructive/20 px-4 rounded-lg"
          style={{ opacity: archiveBg }}
        >
          <Archive className="h-5 w-5 text-destructive" />
        </motion.div>

        {/* Read/Unread background (swipe right) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-start bg-primary/20 px-4 rounded-lg"
          style={{ opacity: readBg }}
        >
          <MailOpen className="h-5 w-5 text-primary" />
        </motion.div>

        <motion.div
          drag="x"
          dragConstraints={{ left: -150, right: 150 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
          className="relative z-10"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return content;
}
