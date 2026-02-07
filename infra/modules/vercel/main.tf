# -----------------------------------------------------------------------------
# Vercel Project
# -----------------------------------------------------------------------------

resource "vercel_project" "this" {
  name      = var.project_name
  framework = "nextjs"

  root_directory = "app"

  build_command   = "bun run build"
  install_command = "bun install"

  git_repository = {
    type = "github"
    repo = var.github_repo
  }
}

# -----------------------------------------------------------------------------
# Environment Variables — Public (available on all targets)
# -----------------------------------------------------------------------------

locals {
  public_env_vars = {
    NEXT_PUBLIC_FIREBASE_API_KEY           = var.firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN       = var.firebase_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID        = var.firebase_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET    = var.firebase_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = var.firebase_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID            = var.firebase_app_id
    NEXT_PUBLIC_VAPID_PUBLIC_KEY           = var.vapid_public_key
  }

  sensitive_env_vars = {
    FIREBASE_SERVICE_ACCOUNT_KEY = var.firebase_service_account_key
    VAPID_PRIVATE_KEY            = var.vapid_private_key
  }
}

resource "vercel_project_environment_variable" "public" {
  for_each = local.public_env_vars

  project_id = vercel_project.this.id
  key        = each.key
  value      = each.value
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "sensitive" {
  for_each = local.sensitive_env_vars

  project_id = vercel_project.this.id
  key        = each.key
  value      = each.value
  target     = ["production", "preview", "development"]
  sensitive  = true
}
