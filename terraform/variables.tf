variable "project_name" {
  type        = string
  description = "The name of the project"
  default     = "visionstudio"
}

variable "environment" {
  type        = string
  description = "The environment (dev, prod)"
  default     = "dev"
}

variable "location" {
  type        = string
  description = "The Azure region"
  default     = "East US"
}
