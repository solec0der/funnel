import { z } from "zod/v4";
import type { NormalizedNotification, Priority } from "@/lib/types";

const gcpIncidentPayload = z.object({
  incident: z
    .object({
      state: z.string().optional(),
      incident_id: z.string().optional(),
      policy_name: z.string().optional(),
      condition_name: z.string().optional(),
      url: z.string().optional(),
      summary: z.string().optional(),
    })
    .optional(),
  message: z
    .object({
      data: z.string().optional(),
    })
    .optional(),
});

function classifyPriority(state?: string): Priority {
  if (state === "open") return "critical";
  if (state === "closed") return "normal";
  return "normal";
}

export function normalize(payload: unknown): NormalizedNotification {
  const data = gcpIncidentPayload.parse(payload);

  if (data.incident) {
    const { state, policy_name, summary, url, condition_name } = data.incident;
    const priority = classifyPriority(state);

    return {
      title: `GCP: ${policy_name || condition_name || "Incident"} — ${state || "unknown"}`,
      body: summary || `Incident state: ${state || "unknown"}`,
      url: url || null,
      priority,
      timeSensitive: priority === "critical",
    };
  }

  // Pub/Sub raw message fallback
  let decoded = "";
  if (data.message?.data) {
    try {
      decoded = Buffer.from(data.message.data, "base64").toString("utf-8");
    } catch {
      decoded = data.message.data;
    }
  }

  return {
    title: "GCP: Pub/Sub message",
    body: decoded || "No message data",
    url: null,
    priority: "normal",
    timeSensitive: false,
  };
}
