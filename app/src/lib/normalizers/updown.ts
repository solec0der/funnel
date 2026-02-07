import { z } from "zod/v4";
import type { NormalizedNotification, Priority } from "@/lib/types";

const updownPayload = z.object({
  event: z.string(),
  check: z.object({
    url: z.string().optional(),
    alias: z.string().optional(),
    status: z.number().optional(),
    down: z.boolean().optional(),
  }),
  downtime: z
    .object({
      started_at: z.string().optional(),
      ended_at: z.string().optional(),
      duration: z.number().optional(),
    })
    .optional(),
});

function classifyPriority(event: string, down?: boolean): Priority {
  if (down || event === "check.down") return "critical";
  if (event.startsWith("ssl_")) return "high";
  if (event === "check.up") return "normal";
  if (event === "performance_drop") return "low";
  return "normal";
}

export function normalize(payload: unknown): NormalizedNotification {
  const data = updownPayload.parse(payload);
  const name = data.check.alias || data.check.url || "Unknown check";
  const priority = classifyPriority(data.event, data.check.down);

  let body = `Event: ${data.event}`;
  if (data.check.status) body += ` (HTTP ${data.check.status})`;
  if (data.downtime?.duration) body += ` — downtime: ${data.downtime.duration}s`;

  return {
    title: `${name}: ${data.event.replace(/[._]/g, " ")}`,
    body,
    url: data.check.url || null,
    priority,
    timeSensitive: priority === "critical" || priority === "high",
  };
}
