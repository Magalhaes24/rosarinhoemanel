# Infraestrutura (Terraform)

Gere o projeto Firebase/Google Cloud do site: Firestore, regras de segurança,
Hosting e a ligação de confiança entre o GitHub Actions e o Google Cloud.

## O que o Terraform controla, e o que o pipeline controla

| Recurso                    | Quem gere    |
| -------------------------- | ------------ |
| Base de dados Firestore    | Terraform    |
| Regras do Firestore        | Terraform    |
| Site do Hosting / domínio  | Terraform    |
| Identidade do CI (WIF, SA) | Terraform    |
| Conteúdo do site (`dist/`) | GitHub Actions |

A separação é deliberada: a service account do pipeline **não tem permissões
sobre o Firestore nem sobre as regras**. Se alguém conseguir executar código no
pipeline, consegue no máximo publicar uma versão do site — que se reverte num
clique — mas não consegue abrir a base de dados.

## Arrancar

O bucket do estado tem de existir antes do primeiro `init` (é o problema do ovo
e da galinha). Cria-se uma vez:

```bash
gcloud storage buckets create gs://rosarinhoemanel-tfstate --project=rosarinhoemanel-9e854 --location=europe-west1 --uniform-bucket-level-access
```

```bash
gcloud storage buckets update gs://rosarinhoemanel-tfstate --versioning
```

Depois, na pasta `infra/`:

```bash
cp terraform.tfvars.example terraform.tfvars
```

```bash
gcloud auth application-default login && terraform init && terraform plan
```

```bash
terraform apply
```

## Ligar o GitHub ao Google Cloud

O `apply` imprime os valores no output `comandos_gh`. São três variáveis (não
são segredos — são identificadores, e o acesso está preso ao repositório pela
condição no provider OIDC):

```bash
terraform output -raw comandos_gh
```

Corre os comandos que ele imprimir, e ainda as variáveis do Firebase para o build:

```bash
gh variable set VITE_FIREBASE_PROJECT_ID --body "rosarinhoemanel-9e854" --repo Magalhaes24/rosarinhoemanel
```

(idem para as restantes `VITE_*`, ver `.env.example` na raiz)

## Notas

- **A localização do Firestore não se muda.** `eur3` é multi-região na Europa.
  Para mudar seria preciso apagar a base de dados.
- `delete_protection_state` está ligado: um `terraform destroy` falha na base de
  dados em vez de a apagar. É de propósito.
- O App Check não está aqui porque o Terraform ainda não cobre bem a
  configuração do reCAPTCHA v3 — faz-se na consola do Firebase, uma vez.
