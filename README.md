# Rosarinho e Manel — 5 | 12 | 2026

Site do casamento, em React + Vite, com Firebase (Firestore + Analytics).
O layout reproduz o rascunho `Rascunho-site.pdf`.

## Arrancar

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
npm run dev
```

Build de produção: `npm run build` (gera `dist/`).

## Páginas

| Rota         | Secção do rascunho    | Conteúdo                                                        |
| ------------ | --------------------- | --------------------------------------------------------------- |
| `/`          | Por onde começar?     | Hero, Missa, Copo d'água, confirmação de presença, história, lista de presentes, drivers, hotéis |
| `/noivos`    | Quem são os noivos?   | Carrossel de infância + 2018 / 2022 / 2026                       |
| `/presentes` | O que dar?            | Para a casa, Lua de mel (carrossel de destinos), IBAN e mensagem |
| `/admin`     | —                     | Área de administração. Não aparece no menu. Uma única conta.     |

## Escala do layout

O rascunho foi desenhado numa tela de **1024 pt** de largura. O CSS define

```css
--pt: calc(min(100vw, 1600px) / 1024);
```

e todas as medidas são escritas como `calc(N * var(--pt))`, em que `N` é o
valor em pontos medido no PDF. Assim o site é a maquete à escala em qualquer
ecrã, até 1600 px. Abaixo de 760 px entra um layout empilhado.

## Testes

```bash
npm run test:regras
```

Corre 32 testes das regras do Firestore contra o emulador (precisa de Java).
Ver [SECURITY.md](SECURITY.md).

## Fontes

Ver [`public/fonts/README.md`](public/fonts/README.md). Enquanto os ficheiros
das fontes comerciais não estiverem lá, o site usa substitutos do Google Fonts.

## Firebase

Duas coleções no Firestore:

- `rsvps` — `{ nome, presenca: 'sim' | 'nao', criadoEm }`
- `presentes` — `{ nome, presente, mensagem, criadoEm }`

As regras permitem **apenas criar** documentos e proíbem leitura pelo site. Para
ver as respostas, usa a consola do Firebase. Ver [SECURITY.md](SECURITY.md).

## Deploy

Há dois destinos, ambos automáticos a cada push para `main`. Ler
[SECURITY.md](SECURITY.md#4-onde-o-site-está-alojado-muda-a-proteção) antes de
escolher — **não são equivalentes em segurança**.

### GitHub Pages — [`pages.yml`](.github/workflows/pages.yml)

Publica em `https://magalhaes24.github.io/rosarinhoemanel/`. Não precisa de
Google Cloud nem de Terraform. Para arrancar:

1. *Settings > Pages > Build and deployment > Source*: **GitHub Actions**
2. *Settings > Secrets and variables > Actions > Variables*: as `VITE_*`
   (nenhuma é secret — ver `.env.example`)
3. *Firebase Console > Authentication > Settings > Authorized domains*:
   acrescentar `magalhaes24.github.io`

O Pages não sabe reescrever URLs, por isso o build gera um `404.html` igual ao
`index.html` — um acesso direto a `/noivos` serve a mesma aplicação e o
encaminhador trata do resto. O site vive num subdiretório, por isso o build usa
`VITE_BASE`; todos os caminhos passam por `caminho()`
([src/lib/caminho.js](src/lib/caminho.js)).

### Firebase Hosting — [`deploy.yml`](.github/workflows/deploy.yml)

Publica na raiz do domínio, com todos os cabeçalhos de segurança. Precisa da
infraestrutura criada primeiro — ver [infra/README.md](infra/README.md). Cada
pull request ganha um canal de pré-visualização que expira em 7 dias.

A infraestrutura (Firestore, regras, Hosting, identidade do CI) é gerida por
Terraform em [`infra/`](infra/) — ver [infra/README.md](infra/README.md) para o
arranque inicial. O pipeline **não** publica as regras do Firestore: isso é do
Terraform, de propósito.

## Antes de pôr no ar

1. Criar a base de dados Firestore (consola > Firestore > Criar base de dados).
2. Criar a conta de administração em *Authentication > Users*, copiar o UID para
   `VITE_ADMIN_UID` (no `.env` e nas variáveis do GitHub) **e** para
   `firestore.rules`.
3. Desligar **"Enable create (sign-up)"** em *Authentication > Settings*.
4. Registar a app em *App Check* e pôr a chave em `VITE_RECAPTCHA_SITE_KEY`.
5. Restringir a API key a referrers HTTP na consola Google Cloud.

## Por acabar

- Fotografias dos anos de namoro (2022) — array `fotosNamoro` em `src/data/fotos.js`
- Lista de presentes "Para a casa" — a secção existe e está vazia, como no rascunho
- Número do IBAN
- Hotéis sugeridos na secção "Onde ficar?"
