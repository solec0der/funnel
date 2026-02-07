import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <Bell className="h-10 w-10" />
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        Notifications
      </h2>
      <p className="text-sm">Your unified inbox will appear here.</p>
    </div>
  );
}
