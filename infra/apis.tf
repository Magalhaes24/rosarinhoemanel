# APIs necessárias. `disable_on_destroy = false` evita que um `terraform destroy`
# desligue serviços que outras coisas do projeto possam estar a usar.
locals {
  apis = [
    "firebase.googleapis.com",
    "firebaserules.googleapis.com",
    "firebasehosting.googleapis.com",
    "firestore.googleapis.com",
    "firebaseappcheck.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "sts.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "serviceusage.googleapis.com",
  ]
}

resource "google_project_service" "ativadas" {
  for_each = toset(local.apis)

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}
