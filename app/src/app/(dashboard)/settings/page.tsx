"use client";

import { useCallback, useRef } from "react";
import { usePreferences } from "@/hooks/use-preferences";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { NotificationView, UserPreferences } from "@/lib/types";

const VIEW_OPTIONS: { value: NotificationView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "work", label: "Work" },
  { value: "personal", label: "Personal" },
  { value: "critical", label: "Critical" },
];

const TIMEZONES = Intl.supportedValuesOf("timeZone");

export default function SettingsPage() {
  const { preferences, loading, updatePreferences } = usePreferences();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const debouncedUpdate = useCallback(
    (updates: Partial<UserPreferences>) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        await updatePreferences(updates);
        toast.success("Settings saved");
      }, 500);
    },
    [updatePreferences]
  );

  const quietHoursEnabled =
    preferences.quietHoursStart !== null && preferences.quietHoursEnd !== null;

  function handleQuietHoursToggle(enabled: boolean) {
    if (enabled) {
      debouncedUpdate({ quietHoursStart: "22:00", quietHoursEnd: "07:00" });
    } else {
      debouncedUpdate({ quietHoursStart: null, quietHoursEnd: null });
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-lg font-semibold tracking-tight">Settings</h1>

      {/* Default View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default View</CardTitle>
          <CardDescription>
            Choose which notification view opens by default.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.defaultView}
            onValueChange={(value) =>
              debouncedUpdate({ defaultView: value as NotificationView })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIEW_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quiet Hours</CardTitle>
          <CardDescription>
            Suppress push notifications during these hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={quietHoursEnabled}
              onCheckedChange={handleQuietHoursToggle}
            />
            <Label>{quietHoursEnabled ? "Enabled" : "Disabled"}</Label>
          </div>
          {quietHoursEnabled && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Start</Label>
                <Input
                  type="time"
                  value={preferences.quietHoursStart ?? "22:00"}
                  onChange={(e) =>
                    debouncedUpdate({ quietHoursStart: e.target.value })
                  }
                  className="w-32"
                />
              </div>
              <span className="mt-5 text-muted-foreground">to</span>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">End</Label>
                <Input
                  type="time"
                  value={preferences.quietHoursEnd ?? "07:00"}
                  onChange={(e) =>
                    debouncedUpdate({ quietHoursEnd: e.target.value })
                  }
                  className="w-32"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timezone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timezone</CardTitle>
          <CardDescription>
            Used for time grouping and quiet hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.timezone}
            onValueChange={(value) => debouncedUpdate({ timezone: value })}
          >
            <SelectTrigger className="w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}
