variable "project_id" {
  description = "The GCP project ID to create"
  type        = string
}

variable "billing_account" {
  description = "The GCP billing account ID"
  type        = string
}

variable "org_id" {
  description = "The GCP organization ID (optional)"
  type        = string
  default     = ""
}

variable "folder_id" {
  description = "The GCP folder ID (optional)"
  type        = string
  default     = ""
}
