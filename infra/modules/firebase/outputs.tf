output "web_app_config" {
  description = "Firebase web app configuration values"
  value = {
    api_key              = data.google_firebase_web_app_config.this.api_key
    auth_domain          = "${var.project_id}.firebaseapp.com"
    project_id           = var.project_id
    storage_bucket       = data.google_firebase_web_app_config.this.storage_bucket
    messaging_sender_id  = data.google_firebase_web_app_config.this.messaging_sender_id
    app_id               = google_firebase_web_app.this.app_id
  }
}
