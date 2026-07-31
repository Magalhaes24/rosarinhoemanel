terraform {
  required_version = ">= 1.6"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.12"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 7.42"
    }
  }

  # Estado remoto num bucket GCS, com versões — para não haver estado só no
  # portátil de uma pessoa. O bucket cria-se uma vez à mão (ver README.md).
  backend "gcs" {
    bucket = "rosarinhoemanel-tfstate"
    prefix = "infra"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}
