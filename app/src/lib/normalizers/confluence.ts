import { z } from "zod/v4";
import type { NormalizedNotification, Priority } from "@/lib/types";

const confluencePayload = z.object({
  event: z.string(),
  page: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    self: z.string().optional(),
    _links: z.object({
      tinyui: z.string().optional(),
      webui: z.string().optional(),
      base: z.string().optional(),
    }).optional(),
    space: z.object({
      key: z.string().optional(),
      name: z.string().optional(),
    }).optional(),
  }).optional(),
  blog: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    self: z.string().optional(),
    _links: z.object({
      tinyui: z.string().optional(),
      webui: z.string().optional(),
      base: z.string().optional(),
    }).optional(),
    space: z.object({
      key: z.string().optional(),
      name: z.string().optional(),
    }).optional(),
  }).optional(),
  comment: z.object({
    body: z.unknown().optional(),
    author: z.object({
      displayName: z.string().optional(),
    }).optional(),
  }).optional(),
  userAccountId: z.string().optional(),
  timestamp: z.number().optional(),
});

function classifyPriority(event: string): Priority {
  if (event === "comment_created") return "high";
  if (event === "page_updated") return "normal";
  if (event === "page_created") return "normal";
  if (event === "blog_created") return "low";
  return "normal";
}

function buildUrl(item: { self?: string; _links?: { tinyui?: string; base?: string; webui?: string } } | undefined): string | null {
  if (!item) return null;
  if (item._links?.base && item._links?.tinyui) {
    return `${item._links.base}${item._links.tinyui}`;
  }
  if (item._links?.base && item._links?.webui) {
    return `${item._links.base}${item._links.webui}`;
  }
  return null;
}

function eventLabel(event: string): string {
  switch (event) {
    case "page_created": return "Page created";
    case "page_updated": return "Page updated";
    case "comment_created": return "Comment added";
    case "blog_created": return "Blog post created";
    default: return event.replace(/_/g, " ");
  }
}

export function normalize(payload: unknown): NormalizedNotification {
  const data = confluencePayload.parse(payload);
  const event = data.event;
  const priority = classifyPriority(event);

  const content = data.page || data.blog;
  const title = content?.title || "Unknown page";
  const space = content?.space?.name || content?.space?.key || "";

  let body = eventLabel(event);
  if (data.comment?.author?.displayName) {
    body = `${data.comment.author.displayName} commented`;
  }

  return {
    title: space ? `${space}: ${title}` : title,
    body,
    url: buildUrl(content),
    priority,
    timeSensitive: priority === "critical" || priority === "high",
  };
}
