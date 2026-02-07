import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <Settings className="h-10 w-10" />
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        Settings
      </h2>
      <p className="text-sm">Manage your preferences here.</p>
    </div>
  );
}
