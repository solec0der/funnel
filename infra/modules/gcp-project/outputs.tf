output "project_id" {
  description = "The GCP project ID"
  value       = google_project.this.project_id
}

output "project_number" {
  description = "The GCP project number"
  value       = google_project.this.number
}
