import type { Timestamp } from "firebase/firestore";

export type Provider = "updown" | "azure_devops" | "gcp" | "vercel" | "custom" | "jira" | "confluence" | "email";

export type SourceType = "webhook" | "email" | "polling";

export type Context = "work" | "personal" | "both";

export type Priority = "critical" | "high" | "normal" | "low";

export interface Source {
  id: string;
  provider: Provider;
  name: string;
  type: SourceType;
  context: Context;
  enabled: boolean;
  pushEnabled: boolean;
  pushPriorityOverride: Priority | null;
  webhookToken: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Notification {
  id: string;
  sourceId: string;
  provider: Provider;
  context: Context;
  priority: Priority;
  timeSensitive: boolean;
  title: string;
  body: string;
  url: string | null;
  raw: Record<string, unknown>;
  read: boolean;
  archived: boolean;
  createdAt: Timestamp;
}

export interface WebhookToken {
  userId: string;
  sourceId: string;
  provider: Provider;
  createdAt: Timestamp;
}

export interface NormalizedNotification {
  title: string;
  body: string;
  url: string | null;
  priority: Priority;
  timeSensitive: boolean;
}

export type NotificationView = "all" | "work" | "personal" | "critical";

export interface NotificationFilters {
  view: NotificationView;
  providers: Provider[];
  priorities: Priority[];
  unreadOnly: boolean;
  search: string;
}

export interface UserPreferences {
  defaultView: NotificationView;
  timezone: string;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  pushMasterMute: boolean;
}
