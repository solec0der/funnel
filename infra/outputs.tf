output "gcp_project_id" {
  description = "The GCP project ID"
  value       = module.gcp_project.project_id
}

output "gcp_project_number" {
  description = "The GCP project number"
  value       = module.gcp_project.project_number
}

output "firebase_web_app_config" {
  description = "Firebase web app configuration"
  value       = module.firebase.web_app_config
}

output "firebase_admin_service_account_email" {
  description = "Firebase Admin SDK service account email"
  value       = module.firebase_admin.service_account_email
}

output "vercel_project_url" {
  description = "Vercel project URL"
  value       = module.vercel.project_url
}
