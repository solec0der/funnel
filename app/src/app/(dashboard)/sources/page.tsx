"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceSheet } from "@/components/sources/source-sheet";
import { SourceList } from "@/components/sources/source-list";
import { useSources } from "@/hooks/use-sources";
import { Cable, Plus } from "lucide-react";
import type { Source } from "@/lib/types";

export default function SourcesPage() {
  const { sources, loading } = useSources();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editSource, setEditSource] = useState<Source | null>(null);

  function handleEdit(source: Source) {
    setEditSource(source);
    setSheetOpen(true);
  }

  function handleSheetChange(open: boolean) {
    setSheetOpen(open);
    if (!open) setEditSource(null);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Sources</h1>
        <Button size="sm" onClick={() => setSheetOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Source
        </Button>
      </div>

      {sources.length === 0 ? (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
          <Cable className="h-10 w-10" />
          <p className="text-sm">No sources yet. Add one to start receiving notifications.</p>
          <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add your first source
          </Button>
        </div>
      ) : (
        <SourceList sources={sources} onEdit={handleEdit} />
      )}

      <SourceSheet
        open={sheetOpen}
        onOpenChange={handleSheetChange}
        editSource={editSource}
      />
    </div>
  );
}
