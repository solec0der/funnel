import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/lib/types";

const priorityStyles: Record<Priority, string> = {
  critical: "bg-priority-critical/15 text-priority-critical border-priority-critical/25",
  high: "bg-priority-high/15 text-priority-high border-priority-high/25",
  normal: "bg-priority-normal/15 text-priority-normal border-priority-normal/25",
  low: "bg-priority-low/15 text-priority-low border-priority-low/25",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant="outline" className={priorityStyles[priority]}>
      {priority}
    </Badge>
  );
}
