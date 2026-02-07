"use client";

import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { batchMarkAsRead, batchArchive } from "@/lib/firebase/notifications";
import { CheckCheck, Archive, XCircle } from "lucide-react";

interface BulkActionsBarProps {
  selectedIds: Set<string>;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedIds,
  onClearSelection,
}: BulkActionsBarProps) {
  const { user } = useAuth();
  const count = selectedIds.size;

  async function handleMarkRead() {
    if (!user) return;
    await batchMarkAsRead(user.uid, Array.from(selectedIds));
    onClearSelection();
  }

  async function handleArchive() {
    if (!user) return;
    await batchArchive(user.uid, Array.from(selectedIds));
    onClearSelection();
  }

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 shadow-lg">
            <span className="text-sm font-medium whitespace-nowrap">
              {count} selected
            </span>
            <div className="h-4 w-px bg-border" />
            <Button variant="ghost" size="sm" onClick={handleMarkRead}>
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Mark read
            </Button>
            <Button variant="ghost" size="sm" onClick={handleArchive}>
              <Archive className="mr-1.5 h-3.5 w-3.5" />
              Archive
            </Button>
            <div className="h-4 w-px bg-border" />
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Deselect
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
