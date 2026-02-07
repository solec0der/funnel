import { z } from "zod/v4";
import type { NormalizedNotification, Priority } from "@/lib/types";

const customPayload = z.object({
  title: z.string(),
  body: z.string().optional(),
  url: z.string().optional(),
  priority: z.enum(["critical", "high", "normal", "low"]).optional(),
});

export function normalize(payload: unknown): NormalizedNotification {
  const data = customPayload.parse(payload);
  const priority: Priority = data.priority || "normal";

  return {
    title: data.title,
    body: data.body || "",
    url: data.url || null,
    priority,
    timeSensitive: priority === "critical" || priority === "high",
  };
}
