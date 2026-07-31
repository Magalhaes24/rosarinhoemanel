variable "project_id" {
  description = "ID do projeto Google Cloud / Firebase."
  type        = string
  default     = "rosarinhoemanel-9e854"
}

variable "region" {
  description = "Região dos recursos regionais."
  type        = string
  default     = "europe-west1"
}

variable "firestore_location" {
  description = "Localização do Firestore. Não pode ser alterada depois de criada."
  type        = string
  default     = "eur3"
}

variable "github_owner" {
  description = "Dono do repositório GitHub."
  type        = string
  default     = "Magalhaes24"
}

variable "github_repo" {
  description = "Nome do repositório GitHub."
  type        = string
  default     = "rosarinhoemanel"
}

variable "hosting_site_id" {
  description = "ID do site no Firebase Hosting."
  type        = string
  default     = "rosarinhoemanel-9e854"
}

variable "custom_domain" {
  description = "Domínio próprio a ligar ao Hosting. Vazio = não configura nenhum."
  type        = string
  default     = ""
}
