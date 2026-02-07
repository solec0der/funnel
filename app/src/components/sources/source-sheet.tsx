"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { providerConfig } from "@/components/icons/provider-icons";
import { createSource, updateSource } from "@/lib/firebase/sources";
import { useAuth } from "@/hooks/use-auth";
import { PROVIDERS } from "@/lib/normalizers";
import { toast } from "sonner";
import { Copy, Check, Loader2 } from "lucide-react";
import type { Provider, Context, Source } from "@/lib/types";

interface SourceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editSource?: Source | null;
}

export function SourceSheet({
  open,
  onOpenChange,
  editSource,
}: SourceSheetProps) {
  const { user } = useAuth();
  const [provider, setProvider] = useState<Provider>("custom");
  const [name, setName] = useState("");
  const [context, setContext] = useState<Context>("both");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  const isEdit = !!editSource;

  function resetForm() {
    setProvider("custom");
    setName("");
    setContext("both");
    setEnabled(true);
    setCreatedToken(null);
    setCopied(false);
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetForm();
    if (open && editSource) {
      setProvider(editSource.provider);
      setName(editSource.name);
      setContext(editSource.context);
      setEnabled(editSource.enabled);
    }
    onOpenChange(open);
  }

  async function handleSave() {
    if (!user) return;
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      if (isEdit && editSource) {
        await updateSource(user.uid, editSource.id, {
          name: name.trim(),
          context,
          enabled,
        });
        toast.success("Source updated");
        handleOpenChange(false);
      } else {
        await createSource(user.uid, {
          provider,
          name: name.trim(),
          context,
        });
        // Show the webhook URL after creation
        // We need to get the token from the source we just created
        // The token is set on creation, so we'll read it from the subscriber
        toast.success("Source created");
        handleOpenChange(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function getWebhookUrl(token: string) {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/api/ingest/${isEdit && editSource ? editSource.provider : provider}?token=${token}`;
  }

  async function copyUrl(token: string) {
    await navigator.clipboard.writeText(getWebhookUrl(token));
    setCopied(true);
    toast.success("Webhook URL copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Source" : "Add Source"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update your notification source settings."
              : "Connect a new notification source via webhook."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          {/* Provider */}
          {!isEdit && (
            <div className="flex flex-col gap-2">
              <Label>Provider</Label>
              <div className="grid grid-cols-3 gap-2">
                {PROVIDERS.map((p) => {
                  const config = providerConfig[p];
                  const Icon = config.icon;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProvider(p)}
                      className={`flex flex-col items-center gap-1.5 rounded-md border p-3 text-xs transition-colors ${
                        provider === p
                          ? "border-primary bg-accent"
                          : "border-border hover:bg-accent/50"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${config.colorClass}`} />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="source-name">Name</Label>
            <Input
              id="source-name"
              placeholder="e.g. Production API Monitor"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Context */}
          <div className="flex flex-col gap-2">
            <Label>Context</Label>
            <Select
              value={context}
              onValueChange={(v) => setContext(v as Context)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enabled toggle (edit only) */}
          {isEdit && (
            <div className="flex items-center justify-between">
              <Label htmlFor="source-enabled">Enabled</Label>
              <Switch
                id="source-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
          )}

          {/* Webhook URL (edit mode — show existing token) */}
          {isEdit && editSource?.webhookToken && (
            <div className="flex flex-col gap-2">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={getWebhookUrl(editSource.webhookToken)}
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyUrl(editSource.webhookToken)}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Created token display */}
          {createdToken && (
            <div className="flex flex-col gap-2">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={getWebhookUrl(createdToken)}
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyUrl(createdToken)}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} className="mt-2">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Source"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
