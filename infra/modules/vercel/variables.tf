variable "project_name" {
  description = "Vercel project name"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository in the format owner/repo"
  type        = string
}

variable "firebase_api_key" {
  description = "Firebase API key"
  type        = string
}

variable "firebase_auth_domain" {
  description = "Firebase auth domain"
  type        = string
}

variable "firebase_project_id" {
  description = "Firebase project ID"
  type        = string
}

variable "firebase_storage_bucket" {
  description = "Firebase storage bucket"
  type        = string
}

variable "firebase_messaging_sender_id" {
  description = "Firebase messaging sender ID"
  type        = string
}

variable "firebase_app_id" {
  description = "Firebase app ID"
  type        = string
}

variable "firebase_service_account_key" {
  description = "Firebase Admin SDK service account key (JSON)"
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
