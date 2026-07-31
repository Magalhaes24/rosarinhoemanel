output "workload_identity_provider" {
  description = "Valor para a variável GCP_WORKLOAD_IDENTITY_PROVIDER no GitHub."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "deploy_service_account" {
  description = "Valor para a variável GCP_DEPLOY_SERVICE_ACCOUNT no GitHub."
  value       = google_service_account.deploy.email
}

output "hosting_site" {
  description = "URL do site."
  value       = "https://${google_firebase_hosting_site.site.site_id}.web.app"
}

output "comandos_gh" {
  description = "Comandos para definir as variáveis no repositório GitHub."
  value       = <<-EOT
    gh variable set GCP_PROJECT_ID --body "${var.project_id}" --repo ${var.github_owner}/${var.github_repo}
    gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER --body "${google_iam_workload_identity_pool_provider.github.name}" --repo ${var.github_owner}/${var.github_repo}
    gh variable set GCP_DEPLOY_SERVICE_ACCOUNT --body "${google_service_account.deploy.email}" --repo ${var.github_owner}/${var.github_repo}
  EOT
}
