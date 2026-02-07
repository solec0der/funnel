import { z } from "zod/v4";
import type { NormalizedNotification, Priority } from "@/lib/types";

const emailPayload = z.object({
  from: z.string().optional(),
  subject: z.string(),
  body: z.string().optional(),
  html: z.string().optional(),
});

const URGENT_KEYWORDS = /\b(urgent|critical|failed|failure|down|outage|emergency|incident)\b/i;

function classifyPriority(subject: string): Priority {
  if (URGENT_KEYWORDS.test(subject)) return "high";
  if (/^\[JIRA\]/i.test(subject)) return "normal";
  if (/^Confluence:/i.test(subject)) return "normal";
  return "normal";
}

function extractFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s<>"')\]]+/);
  return match ? match[0] : null;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

export function normalize(payload: unknown): NormalizedNotification {
  const data = emailPayload.parse(payload);
  const priority = classifyPriority(data.subject);

  const plainText = data.body || "";
  const url = extractFirstUrl(data.html || data.body || "");
  const body = data.from
    ? `From: ${data.from} — ${truncate(plainText, 200)}`
    : truncate(plainText, 200);

  return {
    title: data.subject,
    body,
    url,
    priority,
    timeSensitive: priority === "critical" || priority === "high",
  };
}
