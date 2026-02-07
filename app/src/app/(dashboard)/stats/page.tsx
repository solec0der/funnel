import { BarChart3 } from "lucide-react";

export default function StatsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <BarChart3 className="h-10 w-10" />
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        Stats
      </h2>
      <p className="text-sm">Notification analytics will appear here.</p>
    </div>
  );
}
