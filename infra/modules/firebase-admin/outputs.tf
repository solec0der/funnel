output "service_account_email" {
  description = "Firebase Admin SDK service account email"
  value       = google_service_account.firebase_admin.email
}

output "service_account_key" {
  description = "Firebase Admin SDK service account key (JSON)"
  value       = base64decode(google_service_account_key.firebase_admin.private_key)
  sensitive   = true
}
