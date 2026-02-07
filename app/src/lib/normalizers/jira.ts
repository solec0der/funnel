import { z } from "zod/v4";
import type { NormalizedNotification, Priority } from "@/lib/types";

const jiraUser = z.object({
  displayName: z.string().optional(),
  accountId: z.string().optional(),
});

const jiraIssue = z.object({
  key: z.string(),
  self: z.string().optional(),
  fields: z.object({
    summary: z.string().optional(),
    description: z.unknown().optional(),
    status: z.object({ name: z.string().optional() }).optional(),
    assignee: jiraUser.optional().nullable(),
    priority: z.object({ name: z.string().optional() }).optional(),
    issuetype: z.object({ name: z.string().optional() }).optional(),
  }).optional(),
});

const jiraComment = z.object({
  body: z.unknown().optional(),
  author: jiraUser.optional(),
});

const jiraPayload = z.object({
  webhookEvent: z.string(),
  issue: jiraIssue.optional(),
  comment: jiraComment.optional(),
  changelog: z.object({
    items: z.array(z.object({
      field: z.string().optional(),
      fromString: z.string().optional(),
      toString: z.string().optional(),
    })).optional(),
  }).optional(),
  user: jiraUser.optional(),
});

function classifyPriority(event: string, data: z.infer<typeof jiraPayload>): Priority {
  if (event === "jira:issue_created" && data.issue?.fields?.assignee) {
    return "high";
  }
  if (event === "comment_created") return "normal";
  if (event === "jira:issue_updated") {
    const statusChange = data.changelog?.items?.find((i) => i.field === "status");
    if (statusChange) return "normal";
    const assigneeChange = data.changelog?.items?.find((i) => i.field === "assignee");
    if (assigneeChange) return "high";
  }
  return "normal";
}

function extractBody(event: string, data: z.infer<typeof jiraPayload>): string {
  if (event === "comment_created" && data.comment) {
    const author = data.comment.author?.displayName || "Someone";
    return `${author} commented`;
  }
  if (event === "jira:issue_updated" && data.changelog?.items?.length) {
    return data.changelog.items
      .map((i) => `${i.field}: ${i.fromString ?? ""} → ${i.toString ?? ""}`)
      .join(", ");
  }
  if (event === "jira:issue_created") {
    const type = data.issue?.fields?.issuetype?.name || "Issue";
    const user = data.user?.displayName || "Someone";
    return `${user} created ${type}`;
  }
  return event.replace(/_/g, " ");
}

function getBrowseUrl(issue: z.infer<typeof jiraIssue>): string | null {
  if (!issue.self) return null;
  try {
    const url = new URL(issue.self);
    return `${url.origin}/browse/${issue.key}`;
  } catch {
    return null;
  }
}

export function normalize(payload: unknown): NormalizedNotification {
  const data = jiraPayload.parse(payload);
  const event = data.webhookEvent;
  const issueKey = data.issue?.key || "Unknown";
  const summary = data.issue?.fields?.summary || "";
  const priority = classifyPriority(event, data);

  return {
    title: `${issueKey}: ${summary}`,
    body: extractBody(event, data),
    url: data.issue ? getBrowseUrl(data.issue) : null,
    priority,
    timeSensitive: priority === "critical" || priority === "high",
  };
}
