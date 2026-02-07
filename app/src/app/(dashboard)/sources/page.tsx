import { Cable } from "lucide-react";

export default function SourcesPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <Cable className="h-10 w-10" />
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        Sources
      </h2>
      <p className="text-sm">Connect your notification sources here.</p>
    </div>
  );
}
