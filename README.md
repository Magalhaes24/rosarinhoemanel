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

## Escala do layout

O rascunho foi desenhado numa tela de **1024 pt** de largura. O CSS define

```css
--pt: calc(min(100vw, 1600px) / 1024);
```

e todas as medidas são escritas como `calc(N * var(--pt))`, em que `N` é o
valor em pontos medido no PDF. Assim o site é a maquete à escala em qualquer
ecrã, até 1600 px. Abaixo de 760 px entra um layout empilhado.

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

Automático: cada push para `main` publica em produção
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). Cada pull
request ganha um canal de pré-visualização que expira em 7 dias.

A infraestrutura (Firestore, regras, Hosting, identidade do CI) é gerida por
Terraform em [`infra/`](infra/) — ver [infra/README.md](infra/README.md) para o
arranque inicial. O pipeline **não** publica as regras do Firestore: isso é do
Terraform, de propósito.

## Por acabar

- Fotografias dos anos de namoro (2022) — array `fotosNamoro` em `src/data/fotos.js`
- Lista de presentes "Para a casa" — a secção existe e está vazia, como no rascunho
- Número do IBAN
- Hotéis sugeridos na secção "Onde ficar?"
