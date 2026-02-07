import type { NotificationGroup as NotificationGroupType } from "@/lib/format";

interface NotificationGroupHeaderProps {
  label: string;
}

export function NotificationGroupHeader({ label }: NotificationGroupHeaderProps) {
  return (
    <div className="sticky top-0 z-10 -mx-1 bg-background/95 backdrop-blur-sm px-1 py-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </h3>
    </div>
  );
}

// Re-export for convenience
export type { NotificationGroupType };
