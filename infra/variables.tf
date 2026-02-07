variable "gcp_project_id" {
  description = "The GCP project ID to create"
  type        = string
}

variable "gcp_billing_account" {
  description = "The GCP billing account ID to associate with the project"
  type        = string
}

variable "gcp_org_id" {
  description = "The GCP organization ID (optional, omit if using folder or standalone project)"
  type        = string
  default     = ""
}

variable "gcp_folder_id" {
  description = "The GCP folder ID to create the project under (optional)"
  type        = string
  default     = ""
}

variable "vercel_api_token" {
  description = "Vercel API token for managing deployments"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel team ID (optional, for team-scoped projects)"
  type        = string
  default     = ""
}

variable "firebase_location" {
  description = "Location for Firebase/Firestore resources"
  type        = string
  default     = "us-central"
}

variable "domain" {
  description = "Custom domain for the application (optional)"
  type        = string
  default     = ""
}

variable "google_oauth_client_id" {
  description = "Google OAuth 2.0 client ID for Identity Platform"
  type        = string
}

variable "google_oauth_client_secret" {
  description = "Google OAuth 2.0 client secret for Identity Platform"
  type        = string
  sensitive   = true
}

variable "vapid_public_key" {
  description = "VAPID public key for web push notifications"
  type        = string
}

variable "vapid_private_key" {
  description = "VAPID private key for web push notifications"
  type        = string
  sensitive   = true
}

variable "github_repo" {
  description = "GitHub repository in the format owner/repo"
  type        = string
  default     = "yh/funnel"
}
