import type { Provider, NormalizedNotification } from "@/lib/types";
import { normalize as normalizeUpdown } from "./updown";
import { normalize as normalizeAzureDevops } from "./azure-devops";
import { normalize as normalizeGcp } from "./gcp";
import { normalize as normalizeVercel } from "./vercel";
import { normalize as normalizeCustom } from "./custom";

type Normalizer = (payload: unknown) => NormalizedNotification;

const normalizers: Record<Provider, Normalizer> = {
  updown: normalizeUpdown,
  azure_devops: normalizeAzureDevops,
  gcp: normalizeGcp,
  vercel: normalizeVercel,
  custom: normalizeCustom,
};

export function getNormalizer(provider: Provider): Normalizer {
  return normalizers[provider];
}

export const PROVIDERS: Provider[] = [
  "updown",
  "azure_devops",
  "gcp",
  "vercel",
  "custom",
];
