resource "google_firebase_hosting_site" "site" {
  provider = google-beta

  project = var.project_id
  site_id = var.hosting_site_id

  depends_on = [google_project_service.ativadas]
}

# Domínio próprio (ex.: rosarinhoemanel.pt). Só é criado se `custom_domain`
# estiver preenchido. Depois de aplicar, é preciso apontar o DNS para os
# registos que o Firebase indicar.
resource "google_firebase_hosting_custom_domain" "dominio" {
  provider = google-beta
  count    = var.custom_domain == "" ? 0 : 1

  project       = var.project_id
  site_id       = google_firebase_hosting_site.site.site_id
  custom_domain = var.custom_domain

  # Espera pela emissão do certificado antes de dar o apply por terminado.
  wait_dns_verification = true
}
