import { Filter } from "lucide-react";

export default function RulesPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <Filter className="h-10 w-10" />
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        Rules
      </h2>
      <p className="text-sm">Configure notification routing rules here.</p>
    </div>
  );
}
