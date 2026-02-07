output "project_url" {
  description = "Vercel project URL"
  value       = "https://${vercel_project.this.name}.vercel.app"
}
