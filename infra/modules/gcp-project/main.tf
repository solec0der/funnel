resource "google_project" "this" {
  provider = google-beta

  name            = var.project_id
  project_id      = var.project_id
  billing_account = var.billing_account

  org_id    = var.org_id != "" ? var.org_id : null
  folder_id = var.folder_id != "" ? var.folder_id : null

  deletion_policy = "DELETE"

  labels = {
    managed-by = "opentofu"
  }
}

# Enable Service Usage API first — all other APIs depend on it.
resource "google_project_service" "serviceusage" {
  provider = google-beta

  project = google_project.this.project_id
  service = "serviceusage.googleapis.com"

  disable_dependent_services = true
  disable_on_destroy         = false
}

locals {
  apis = [
    "firebase.googleapis.com",
    "firebaserules.googleapis.com",
    "firestore.googleapis.com",
    "identitytoolkit.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "servicemanagement.googleapis.com",
    "secretmanager.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
  ]
}

resource "google_project_service" "apis" {
  provider = google-beta

  for_each = toset(local.apis)

  project = google_project.this.project_id
  service = each.value

  disable_dependent_services = true
  disable_on_destroy         = false

  depends_on = [google_project_service.serviceusage]
}
