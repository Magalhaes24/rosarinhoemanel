# ---------------------------------------------------------------------------
# Workload Identity Federation
#
# Permite ao GitHub Actions autenticar-se no Google Cloud com um token de vida
# curta emitido pelo próprio GitHub, em vez de uma chave JSON de service account
# guardada nos segredos do repositório. Uma chave JSON que fuja serve a quem a
# apanhar durante meses; um token destes dura minutos e só é aceite se vier
# deste repositório.
# ---------------------------------------------------------------------------

resource "google_iam_workload_identity_pool" "github" {
  project = var.project_id

  workload_identity_pool_id = "github-pool"
  display_name              = "GitHub Actions"
  description               = "Identidades federadas do GitHub Actions"

  depends_on = [google_project_service.ativadas]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  project = var.project_id

  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub OIDC"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  # Sem esta condição, QUALQUER repositório do GitHub no mundo poderia pedir um
  # token para este projeto. Restringe ao repositório concreto.
  attribute_condition = "assertion.repository == '${var.github_owner}/${var.github_repo}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# ---------------------------------------------------------------------------
# Service account do deploy — apenas o que precisa, nada mais.
# ---------------------------------------------------------------------------

resource "google_service_account" "deploy" {
  project = var.project_id

  account_id   = "gha-deploy"
  display_name = "Deploy do site (GitHub Actions)"
  description  = "Publica o Firebase Hosting a partir do GitHub Actions"
}

# Publicar no Hosting. Note-se que NÃO tem permissões sobre o Firestore nem
# sobre as regras: essas são geridas pelo Terraform, não pelo pipeline.
resource "google_project_iam_member" "deploy_hosting" {
  project = var.project_id
  role    = "roles/firebasehosting.admin"
  member  = "serviceAccount:${google_service_account.deploy.email}"
}

# A CLI do Firebase lê a lista de projetos ao arrancar.
resource "google_project_iam_member" "deploy_viewer" {
  project = var.project_id
  role    = "roles/firebase.viewer"
  member  = "serviceAccount:${google_service_account.deploy.email}"
}

# Só workflows deste repositório podem passar-se por esta service account.
resource "google_service_account_iam_member" "github_pode_usar" {
  service_account_id = google_service_account.deploy.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_owner}/${var.github_repo}"
}
