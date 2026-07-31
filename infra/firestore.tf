# Base de dados Firestore.
#
# ATENÇÃO: a localização não se muda depois de criada. Para mudar, é preciso
# apagar a base de dados (e os dados com ela).
resource "google_firestore_database" "principal" {
  provider = google-beta

  project     = var.project_id
  name        = "(default)"
  location_id = var.firestore_location
  type        = "FIRESTORE_NATIVE"

  # Protege contra apagar a base de dados por engano num `terraform destroy`.
  delete_protection_state = "DELETE_PROTECTION_ENABLED"

  # Recuperação para qualquer instante nos últimos 7 dias.
  point_in_time_recovery_enablement = "POINT_IN_TIME_RECOVERY_ENABLED"

  depends_on = [google_project_service.ativadas]
}

# As regras vivem em firestore.rules, na raiz do repositório: é o mesmo ficheiro
# que o emulador local usa, para não haver duas versões da verdade.
resource "google_firebaserules_ruleset" "firestore" {
  provider = google-beta
  project  = var.project_id

  source {
    files {
      name    = "firestore.rules"
      content = file("${path.module}/../firestore.rules")
    }
  }

  depends_on = [google_firestore_database.principal]

  lifecycle {
    create_before_destroy = true
  }
}

resource "google_firebaserules_release" "firestore" {
  provider = google-beta
  project  = var.project_id

  name         = "cloud.firestore"
  ruleset_name = google_firebaserules_ruleset.firestore.name
}
