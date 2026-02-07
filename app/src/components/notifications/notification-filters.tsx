"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { providerConfig } from "@/components/icons/provider-icons";
import { Search, X, Filter, ChevronDown } from "lucide-react";
import type { Provider, Priority, NotificationFilters } from "@/lib/types";

const ALL_PROVIDERS: Provider[] = ["updown", "azure_devops", "gcp", "vercel", "custom"];
const ALL_PRIORITIES: Priority[] = ["critical", "high", "normal", "low"];

const priorityLabels: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  normal: "Normal",
  low: "Low",
};

interface NotificationFiltersBarProps {
  filters: NotificationFilters;
  onChange: (filters: NotificationFilters) => void;
}

export function NotificationFiltersBar({
  filters,
  onChange,
}: NotificationFiltersBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onChange({ ...filters, search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const hasActiveFilters =
    filters.providers.length > 0 ||
    filters.priorities.length > 0 ||
    filters.unreadOnly ||
    filters.search !== "";

  function toggleProvider(provider: Provider) {
    const next = filters.providers.includes(provider)
      ? filters.providers.filter((p) => p !== provider)
      : [...filters.providers, provider];
    onChange({ ...filters, providers: next });
  }

  function togglePriority(priority: Priority) {
    const next = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority];
    onChange({ ...filters, priorities: next });
  }

  function clearAll() {
    setSearchInput("");
    onChange({ ...filters, providers: [], priorities: [], unreadOnly: false, search: "" });
  }

  const providerLabel =
    filters.providers.length === 0
      ? "All providers"
      : `${filters.providers.length} provider${filters.providers.length > 1 ? "s" : ""}`;

  const priorityLabel =
    filters.priorities.length === 0
      ? "All priorities"
      : `${filters.priorities.length} priorit${filters.priorities.length > 1 ? "ies" : "y"}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Provider filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={filters.providers.length > 0 ? "secondary" : "outline"}
            size="sm"
            className="h-8 text-xs"
          >
            <Filter className="mr-1.5 h-3 w-3" />
            {providerLabel}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="flex flex-col gap-1">
            {ALL_PROVIDERS.map((provider) => {
              const config = providerConfig[provider];
              const Icon = config.icon;
              return (
                <label
                  key={provider}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={filters.providers.includes(provider)}
                    onCheckedChange={() => toggleProvider(provider)}
                  />
                  <Icon className={`h-3.5 w-3.5 ${config.colorClass}`} />
                  {config.label}
                </label>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Priority filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={filters.priorities.length > 0 ? "secondary" : "outline"}
            size="sm"
            className="h-8 text-xs"
          >
            {priorityLabel}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2" align="start">
          <div className="flex flex-col gap-1">
            {ALL_PRIORITIES.map((priority) => (
              <label
                key={priority}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
              >
                <Checkbox
                  checked={filters.priorities.includes(priority)}
                  onCheckedChange={() => togglePriority(priority)}
                />
                {priorityLabels[priority]}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Unread toggle */}
      <Toggle
        size="sm"
        pressed={filters.unreadOnly}
        onPressedChange={(pressed) =>
          onChange({ ...filters, unreadOnly: pressed })
        }
        className="h-8 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        Unread only
      </Toggle>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-8 w-40 pl-7 text-xs"
        />
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-8 text-xs text-muted-foreground"
        >
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
