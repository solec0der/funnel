import {
  Activity,
  GitBranch,
  Cloud,
  Triangle,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import type { Provider } from "@/lib/types";

interface ProviderConfig {
  icon: LucideIcon;
  label: string;
  colorClass: string;
}

export const providerConfig: Record<Provider, ProviderConfig> = {
  updown: {
    icon: Activity,
    label: "Updown.io",
    colorClass: "text-provider-updown",
  },
  azure_devops: {
    icon: GitBranch,
    label: "Azure DevOps",
    colorClass: "text-provider-azure-devops",
  },
  gcp: {
    icon: Cloud,
    label: "Google Cloud",
    colorClass: "text-provider-gcp",
  },
  vercel: {
    icon: Triangle,
    label: "Vercel",
    colorClass: "text-provider-vercel",
  },
  custom: {
    icon: Webhook,
    label: "Custom",
    colorClass: "text-provider-custom",
  },
};

export function ProviderIcon({
  provider,
  className,
}: {
  provider: Provider;
  className?: string;
}) {
  const config = providerConfig[provider];
  const Icon = config.icon;
  return <Icon className={className || `h-4 w-4 ${config.colorClass}`} />;
}
