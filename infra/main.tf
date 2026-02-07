# -----------------------------------------------------------------------------
# Providers
# -----------------------------------------------------------------------------

provider "google-beta" {
  project               = module.gcp_project.project_id
  user_project_override = true
  billing_project       = var.gcp_project_id
}

provider "google-beta" {
  alias                 = "no_user_project_override"
  user_project_override = false
}

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team_id != "" ? var.vercel_team_id : null
}

# -----------------------------------------------------------------------------
# Modules
# -----------------------------------------------------------------------------

module "gcp_project" {
  source = "./modules/gcp-project"

  project_id      = var.gcp_project_id
  billing_account = var.gcp_billing_account
  org_id          = var.gcp_org_id
  folder_id       = var.gcp_folder_id

  providers = {
    google-beta = google-beta.no_user_project_override
  }
}

module "firebase" {
  source = "./modules/firebase"

  project_id                 = module.gcp_project.project_id
  firebase_location          = var.firebase_location
  google_oauth_client_id     = var.google_oauth_client_id
  google_oauth_client_secret = var.google_oauth_client_secret
  firestore_rules_content    = file("${path.root}/firestore.rules")

  depends_on = [module.gcp_project]

  providers = {
    google-beta = google-beta
  }
}

module "firebase_admin" {
  source = "./modules/firebase-admin"

  project_id = module.gcp_project.project_id

  depends_on = [module.firebase]

  providers = {
    google-beta = google-beta
  }
}

module "vercel" {
  source = "./modules/vercel"

  project_name               = "funnel"
  github_repo                = var.github_repo
  firebase_api_key           = module.firebase.web_app_config.api_key
  firebase_auth_domain       = module.firebase.web_app_config.auth_domain
  firebase_project_id        = module.firebase.web_app_config.project_id
  firebase_storage_bucket    = module.firebase.web_app_config.storage_bucket
  firebase_messaging_sender_id = module.firebase.web_app_config.messaging_sender_id
  firebase_app_id            = module.firebase.web_app_config.app_id
  firebase_service_account_key = module.firebase_admin.service_account_key
  vapid_public_key           = var.vapid_public_key
  vapid_private_key          = var.vapid_private_key

  depends_on = [module.firebase_admin]
}

# -----------------------------------------------------------------------------
# Local files for development
# -----------------------------------------------------------------------------

resource "local_sensitive_file" "env_local" {
  filename        = "${path.root}/../app/.env.local"
  file_permission = "0600"

  content = join("\n", [
    "# Firebase (public)",
    "NEXT_PUBLIC_FIREBASE_API_KEY=${module.firebase.web_app_config.api_key}",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${module.firebase.web_app_config.auth_domain}",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID=${module.firebase.web_app_config.project_id}",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${module.firebase.web_app_config.storage_bucket}",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${module.firebase.web_app_config.messaging_sender_id}",
    "NEXT_PUBLIC_FIREBASE_APP_ID=${module.firebase.web_app_config.app_id}",
    "",
    "# VAPID",
    "NEXT_PUBLIC_VAPID_PUBLIC_KEY=${var.vapid_public_key}",
    "VAPID_PRIVATE_KEY=${var.vapid_private_key}",
    "",
    "# Firebase Admin",
    "FIREBASE_SERVICE_ACCOUNT_KEY=${module.firebase_admin.service_account_key}",
    "",
  ])
}

resource "local_sensitive_file" "firebase_service_account" {
  filename        = "${path.root}/../app/.firebase-service-account.json"
  file_permission = "0600"
  content         = module.firebase_admin.service_account_key
}
