# -----------------------------------------------------------------------------
# Firebase Admin SDK Service Account
# -----------------------------------------------------------------------------

resource "google_service_account" "firebase_admin" {
  provider = google-beta

  project      = var.project_id
  account_id   = "firebase-admin-sdk"
  display_name = "Firebase Admin SDK"
  description  = "Service account for Firebase Admin SDK operations"
}

# Firestore read/write access
resource "google_project_iam_member" "datastore_user" {
  provider = google-beta

  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.firebase_admin.email}"
}

# Firebase Auth admin access
resource "google_project_iam_member" "firebase_auth_admin" {
  provider = google-beta

  project = var.project_id
  role    = "roles/firebaseauth.admin"
  member  = "serviceAccount:${google_service_account.firebase_admin.email}"
}

# Generate a JSON key for the service account
resource "google_service_account_key" "firebase_admin" {
  provider = google-beta

  service_account_id = google_service_account.firebase_admin.name
}
