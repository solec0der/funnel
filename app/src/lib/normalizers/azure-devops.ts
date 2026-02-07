import { z } from "zod/v4";
import type { NormalizedNotification, Priority } from "@/lib/types";

const azureDevOpsPayload = z.object({
  eventType: z.string(),
  message: z
    .object({
      text: z.string().optional(),
      html: z.string().optional(),
      markdown: z.string().optional(),
    })
    .optional(),
  resource: z
    .object({
      url: z.string().optional(),
      status: z.string().optional(),
      result: z.string().optional(),
      environment: z
        .object({ name: z.string().optional() })
        .optional(),
    })
    .optional(),
  detailedMessage: z
    .object({ text: z.string().optional() })
    .optional(),
});

function classifyPriority(eventType: string, resource?: { status?: string; result?: string }): Priority {
  if (eventType.includes("release") && resource?.status === "failed") return "critical";
  if (eventType.includes("build.complete") && resource?.result === "failed") return "high";
  if (eventType.includes("pullrequest") || eventType.includes("workitem")) return "normal";
  if (eventType.includes("build.complete") && resource?.result === "succeeded") return "low";
  return "normal";
}

export function normalize(payload: unknown): NormalizedNotification {
  const data = azureDevOpsPayload.parse(payload);
  const priority = classifyPriority(data.eventType, data.resource ?? undefined);
  const text =
    data.message?.text ||
    data.detailedMessage?.text ||
    data.eventType;

  return {
    title: `Azure DevOps: ${data.eventType.replace(/\./g, " ")}`,
    body: text,
    url: data.resource?.url || null,
    priority,
    timeSensitive: priority === "critical" || priority === "high",
  };
}
