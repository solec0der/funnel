"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProviderIcon, providerConfig } from "@/components/icons/provider-icons";
import { updateSource, deleteSource } from "@/lib/firebase/sources";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import type { Source } from "@/lib/types";

interface SourceListProps {
  sources: Source[];
  onEdit: (source: Source) => void;
}

export function SourceList({ sources, onEdit }: SourceListProps) {
  const { user } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState<Source | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleToggle(source: Source, enabled: boolean) {
    if (!user) return;
    try {
      await updateSource(user.uid, source.id, { enabled });
    } catch {
      toast.error("Failed to update source");
    }
  }

  async function handleDelete() {
    if (!user || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSource(user.uid, deleteTarget.id);
      toast.success("Source deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete source");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="grid gap-3">
        {sources.map((source) => {
          const config = providerConfig[source.provider];
          return (
            <Card key={source.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <ProviderIcon
                  provider={source.provider}
                  className={`h-5 w-5 shrink-0 ${config.colorClass}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{source.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {source.context}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {config.label}
                  </p>
                </div>
                <Switch
                  checked={source.enabled}
                  onCheckedChange={(v) => handleToggle(source, v)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(source)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(source)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Source</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{deleteTarget?.name}&rdquo;
              and its webhook token. Incoming notifications will stop.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
