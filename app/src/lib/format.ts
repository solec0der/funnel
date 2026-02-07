import type { Notification } from "@/lib/types";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const DIVISIONS: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.345, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Number.POSITIVE_INFINITY, name: "years" },
];

export function relativeTime(date: Date): string {
  let duration = (date.getTime() - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }

  return rtf.format(Math.round(duration), "years");
}

export interface NotificationGroup {
  label: string;
  notifications: Notification[];
}

export function groupByDate(notifications: Notification[]): NotificationGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 6 * 86400000);

  const groups: Record<string, Notification[]> = {};
  const order = ["Today", "Yesterday", "This Week", "Earlier"];

  for (const n of notifications) {
    const date = n.createdAt?.toDate?.() ? n.createdAt.toDate() : new Date();
    let label: string;

    if (date >= today) {
      label = "Today";
    } else if (date >= yesterday) {
      label = "Yesterday";
    } else if (date >= weekAgo) {
      label = "This Week";
    } else {
      label = "Earlier";
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }

  return order
    .filter((label) => groups[label]?.length)
    .map((label) => ({ label, notifications: groups[label] }));
}
