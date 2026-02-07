"use client";

import { useState, useEffect } from "react";
import { usePush } from "@/hooks/use-push";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";

const DISMISS_KEY = "funnel:push-prompt-dismissed";

export function PushPrompt() {
  const { permissionState, isSubscribed, subscribe, loading } = usePush();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
  }, []);

  // Hide if already subscribed, denied, or dismissed
  if (
    isSubscribed ||
    permissionState === "denied" ||
    permissionState === "granted" ||
    dismissed
  ) {
    return null;
  }

  // Only show when permission is "default" (not yet asked)
  if (permissionState !== "default") return null;

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-3">
        <Bell className="h-5 w-5 text-muted-foreground shrink-0" />
        <p className="text-sm flex-1">
          Enable push notifications to get alerts for important events.
        </p>
        <Button size="sm" onClick={subscribe} disabled={loading}>
          Enable
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
