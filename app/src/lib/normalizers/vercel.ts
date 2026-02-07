import { z } from "zod/v4";
import type { NormalizedNotification, Priority } from "@/lib/types";

const vercelPayload = z.object({
  type: z.string(),
  payload: z
    .object({
      deployment: z
        .object({
          id: z.string().optional(),
          name: z.string().optional(),
          url: z.string().optional(),
          meta: z.record(z.string(), z.unknown()).optional(),
        })
        .optional(),
      name: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
});

function classifyPriority(type: string): Priority {
  if (type.includes("error") || type.includes("failed")) return "high";
  if (type === "deployment.created" || type === "deployment") return "normal";
  if (type === "deployment.succeeded" || type === "deployment.ready") return "low";
  return "normal";
}

export function normalize(payload: unknown): NormalizedNotification {
  const data = vercelPayload.parse(payload);
  const priority = classifyPriority(data.type);
  const name =
    data.payload?.deployment?.name ||
    data.payload?.name ||
    "Unknown project";
  const url =
    data.payload?.deployment?.url ||
    data.payload?.url ||
    null;

  return {
    title: `Vercel: ${name} — ${data.type.replace(/\./g, " ")}`,
    body: `Deployment event: ${data.type}${url ? ` (${url})` : ""}`,
    url: url ? (url.startsWith("http") ? url : `https://${url}`) : null,
    priority,
    timeSensitive: priority === "high",
  };
}
