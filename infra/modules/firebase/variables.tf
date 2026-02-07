variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "firebase_location" {
  description = "Location for Firebase/Firestore resources"
  type        = string
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

variable "firestore_rules_content" {
  description = "Content of the Firestore security rules file"
  type        = string
}
