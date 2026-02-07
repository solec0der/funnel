# -----------------------------------------------------------------------------
# Firebase Project
# -----------------------------------------------------------------------------

resource "google_firebase_project" "this" {
  provider = google-beta
  project  = var.project_id
}

# -----------------------------------------------------------------------------
# Firebase Web App
# -----------------------------------------------------------------------------

resource "google_firebase_web_app" "this" {
  provider     = google-beta
  project      = var.project_id
  display_name = "Funnel Web"

  depends_on = [google_firebase_project.this]
}

data "google_firebase_web_app_config" "this" {
  provider   = google-beta
  project    = var.project_id
  web_app_id = google_firebase_web_app.this.app_id
}

# -----------------------------------------------------------------------------
# Identity Platform
# -----------------------------------------------------------------------------

resource "google_identity_platform_config" "this" {
  provider = google-beta
  project  = var.project_id

  authorized_domains = concat(
    [
      "localhost",
      "${var.project_id}.firebaseapp.com",
      "${var.project_id}.web.app",
    ],
    var.authorized_domains,
  )

  sign_in {
    allow_duplicate_emails = false

    email {
      enabled           = true
      password_required = true
    }
  }

  depends_on = [google_firebase_project.this]
}

resource "google_identity_platform_default_supported_idp_config" "google" {
  provider = google-beta
  project  = var.project_id

  idp_id        = "google.com"
  client_id     = var.google_oauth_client_id
  client_secret = var.google_oauth_client_secret

  enabled = true

  depends_on = [google_identity_platform_config.this]
}

# -----------------------------------------------------------------------------
# Firestore
# -----------------------------------------------------------------------------

resource "google_firestore_database" "this" {
  provider = google-beta
  project  = var.project_id

  name        = "(default)"
  type        = "FIRESTORE_NATIVE"
  location_id = var.firebase_location

  depends_on = [google_firebase_project.this]
}

# -----------------------------------------------------------------------------
# Firestore Indexes
# -----------------------------------------------------------------------------

resource "google_firestore_index" "notifications_archived_created" {
  provider = google-beta
  project  = var.project_id

  database   = google_firestore_database.this.name
  collection = "notifications"

  query_scope = "COLLECTION"

  fields {
    field_path = "archived"
    order      = "ASCENDING"
  }

  fields {
    field_path = "createdAt"
    order      = "DESCENDING"
  }

  depends_on = [google_firestore_database.this]
}

# -----------------------------------------------------------------------------
# Firestore Security Rules
# -----------------------------------------------------------------------------

resource "google_firebaserules_ruleset" "firestore" {
  provider = google-beta
  project  = var.project_id

  source {
    files {
      name    = "firestore.rules"
      content = var.firestore_rules_content
    }
  }

  depends_on = [google_firestore_database.this]
}

resource "google_firebaserules_release" "firestore" {
  provider = google-beta
  project  = var.project_id

  name         = "cloud.firestore"
  ruleset_name = google_firebaserules_ruleset.firestore.name

  depends_on = [google_firestore_database.this]
}
