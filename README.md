# Funnel

Unified notification hub PWA. Aggregates notifications from GitHub, Linear, Slack, and more into a single prioritized feed.

## Prerequisites

- [Bun](https://bun.sh/)
- [OpenTofu](https://opentofu.org/): `brew install opentofu`
- [Google Cloud SDK](https://cloud.google.com/sdk): `brew install --cask google-cloud-sdk`
- A GCP billing account
- A Vercel account with GitHub connected
- VAPID keys: `make vapid-keys`

## Setup

### 1. Authenticate

```bash
gcloud auth application-default login
```

### 2. Infrastructure (Two-Phase Apply)

The OAuth client ID must be created manually because GCP doesn't expose an API for it.

**Phase 1** — Create the GCP project:

```bash
cp infra/terraform.tfvars.example infra/terraform.tfvars
# Fill in gcp_project_id, gcp_billing_account, and other required values
# Leave google_oauth_client_id and google_oauth_client_secret empty for now

make init
cd infra && tofu apply -target=module.gcp_project
```

**Manual step** — Create OAuth 2.0 Client ID:

1. Open [GCP Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Select the newly created project
3. Create Credentials → OAuth 2.0 Client ID → Web application
4. Add authorized redirect URIs (localhost:3000 and your Vercel domain)
5. Copy the Client ID and Client Secret into `infra/terraform.tfvars`

**Phase 2** — Provision everything:

```bash
make apply
```

### 3. Local Development

After `tofu apply`, `.env.local` is generated in `app/`:

```bash
cd app
bun install
bun run dev
```

### 4. Post-Deploy

- Import VAPID public key into Firebase Console → Cloud Messaging → Web Push certificates
- Verify the Vercel deployment serves the app

## Project Structure

```
funnel/
├── infra/          # OpenTofu IaC (GCP, Firebase, Vercel)
├── app/            # Next.js 15 PWA
├── Makefile        # Orchestration targets
└── README.md
```

## Development

```bash
make dev            # Start local dev server
make build          # Production build
make plan           # Preview infrastructure changes
make apply          # Apply infrastructure changes
```
