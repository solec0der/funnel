import type { Provider, NormalizedNotification } from "@/lib/types";
import { normalize as normalizeUpdown } from "./updown";
import { normalize as normalizeAzureDevops } from "./azure-devops";
import { normalize as normalizeGcp } from "./gcp";
import { normalize as normalizeVercel } from "./vercel";
import { normalize as normalizeCustom } from "./custom";
import { normalize as normalizeJira } from "./jira";
import { normalize as normalizeConfluence } from "./confluence";
import { normalize as normalizeEmail } from "./email";

type Normalizer = (payload: unknown) => NormalizedNotification;

const normalizers: Record<Provider, Normalizer> = {
  updown: normalizeUpdown,
  azure_devops: normalizeAzureDevops,
  gcp: normalizeGcp,
  vercel: normalizeVercel,
  custom: normalizeCustom,
  jira: normalizeJira,
  confluence: normalizeConfluence,
  email: normalizeEmail,
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
  "jira",
  "confluence",
  "email",
];
