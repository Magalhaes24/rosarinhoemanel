# Segurança

Site público, sem contas de utilizador, com dois formulários que escrevem no
Firestore. O risco real não é "alguém rouba a password" — não há passwords. É:

1. alguém apagar ou ler a lista de convidados;
2. um bot encher a base de dados de lixo (e a fatura com ela);
3. alguém publicar conteúdo falso no site.

O que está feito para cada um.

## 1. Ler ou apagar respostas

As regras em [`firestore.rules`](firestore.rules) permitem **apenas criar**
documentos, nas duas coleções, e mais nada: `read`, `update` e `delete` estão
explicitamente a `false`. Nem sequer é possível listar. Para ver as respostas
usa-se a consola do Firebase, que corre com privilégios de administrador e
ignora estas regras.

Cada documento é validado no servidor: só os campos esperados (`hasOnly` +
`hasAll`), tipos certos, limites de tamanho, `presenca` restrito a `sim`/`nao`,
e `criadoEm` obrigado a ser `request.time` — o cliente não consegue forjar datas.

## 2. Bots e abuso

- **App Check** com reCAPTCHA v3 ([`src/lib/firebase.js`](src/lib/firebase.js)):
  o Firestore rejeita pedidos que não venham deste site. É a defesa que conta.
- **Honeypot** nos dois formulários: um campo escondido que só um bot preenche;
  se vier preenchido, o site finge que aceitou e não escreve nada.
- Limites de comprimento no cliente *e* nas regras.

**Falta fazer** (na consola, uma vez): registar a app em App Check e restringir
a API key a referrers HTTP em *Google Cloud Console > APIs e Serviços >
Credenciais*. Sem a restrição de referrer, a chave funciona a partir de
qualquer sítio.

## 3. Conteúdo e cabeçalhos

[`firebase.json`](firebase.json) envia:

- **Content-Security-Policy** restritiva — `default-src 'self'`, sem
  `unsafe-eval`, com `frame-ancestors 'none'` e `object-src 'none'`. Só estão
  autorizados os domínios de que o site precisa mesmo (Google Fonts, Firestore,
  Analytics, reCAPTCHA).
- **HSTS** com um ano e `preload`.
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy` (câmara, microfone, localização e pagamentos desligados),
  `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`.

> Se acrescentares um serviço externo (mapas, música, vídeo), a CSP vai
> bloqueá-lo até o adicionares à lista. É o comportamento pretendido.

## 4. Pipeline

- **Sem chaves de longa duração no repositório.** O deploy autentica-se por
  Workload Identity Federation: o GitHub emite um token de vida curta e o
  Google só o aceita se vier de `Magalhaes24/rosarinhoemanel` — a condição está
  em [`infra/cicd.tf`](infra/cicd.tf).
- A service account do deploy só pode publicar Hosting. Não toca no Firestore.
- `permissions: {}` por omissão em todos os workflows; cada job pede o mínimo.
- `persist-credentials: false` nos checkouts, para o token do GitHub não ficar
  no `.git/config` do runner.
- As pré-visualizações usam `pull_request` (e não `pull_request_target`) e só
  correm para PRs do próprio repositório — PRs de forks nunca veem credenciais.
- `npm ci` (respeita o lockfile), `npm audit --audit-level=high` e `gitleaks`
  em cada PR. Dependabot semanal.

## O que *não* é segredo

A configuração do Firebase (`apiKey`, `appId`, etc.) vai dentro do JavaScript
que o browser descarrega. É pública por desenho e não há maneira de a esconder.
Está em variáveis de ambiente por arrumação, não por segurança. Quem proteje os
dados são as regras, o App Check e a restrição de referrer.

## Reportar um problema

Abre um issue ou fala diretamente com o Francisco.
