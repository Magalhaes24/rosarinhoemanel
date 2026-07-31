# Segurança

Site público, sem contas para convidados, com dois formulários que escrevem no
Firestore e uma área de administração. O risco real não é "alguém rouba a
password" — os convidados não têm password. É:

1. alguém ler ou apagar a lista de convidados;
2. um bot encher a base de dados de lixo (e a fatura com ela);
3. alguém entrar na área de administração;
4. alguém publicar conteúdo falso no site.

## 1. Quem lê e quem escreve

As regras em [`firestore.rules`](firestore.rules):

| Quem                          | Criar | Ler | Alterar | Apagar |
| ----------------------------- | :---: | :-: | :-----: | :----: |
| Convidado (sem sessão)        |  sim  | não |   não   |  não   |
| Sessão iniciada, não é o admin|  sim  | não |   não   |  não   |
| Admin                         |  sim  | sim |   não   |  não   |

Nem o admin altera ou apaga a partir do site — para isso usa-se a consola do
Firebase, que corre com privilégios de administrador e ignora estas regras.

Cada documento é validado no servidor: só os campos esperados (`hasOnly` +
`hasAll`), tipos certos, limites de tamanho, nomes que não sejam só espaços,
`presenca` restrito a `sim`/`nao`, e `criadoEm` obrigado a ser `request.time` —
o cliente não consegue forjar datas.

**Isto está testado, não é uma intenção.** [`tests/regras.test.js`](tests/regras.test.js)
corre 32 casos contra o emulador do Firestore, usando o mesmo ficheiro de regras
do repositório:

```bash
npm run test:regras
```

Cobre, entre outros: convidado a tentar ler, utilizador autenticado que não é o
admin a tentar ler, campos a mais, campos em falta, tipos errados, datas
forjadas, tamanhos excessivos, alterações e remoções, coleções arbitrárias, e
uma tentativa de escalar privilégios criando uma coleção `config`. Corre em
cada pull request.

## 2. Administração — uma conta e só uma

A área vive em `/admin`, não está ligada no menu e está fora dos motores de
busca. Mas a proteção não é essa — é o UID único em `firestore.rules`. Mesmo
que alguém chegue ao ecrã de login, ou até crie uma conta, sem esse UID não lê
um único documento.

A verificação existe em dois sítios de propósito: no cliente
([`src/lib/auth.js`](src/lib/auth.js)) para a interface se comportar bem, e nas
regras para valer a sério. A sessão usa `browserSessionPersistence` — fecha o
separador, acaba a sessão. O erro de login é sempre o mesmo texto, para não
revelar se um email existe.

**Passo obrigatório na consola:** *Authentication > Settings > User actions >*
desligar **"Enable create (sign-up)"**. Sem isso, qualquer pessoa pode criar
uma conta com a API key pública. Não ganharia acesso a dados (as regras
tratam disso), mas não há razão para deixar.

## 3. Bots e abuso

- **App Check** com reCAPTCHA v3 ([`src/lib/firebase.js`](src/lib/firebase.js)):
  o Firestore rejeita pedidos que não venham deste site. É a defesa que conta.
- **Honeypot** nos dois formulários: um campo escondido que só um bot preenche;
  se vier preenchido, o site finge que aceitou e não escreve nada.
- Limites de comprimento no cliente *e* nas regras.

**Falta fazer** (na consola, uma vez): registar a app em App Check e restringir
a API key a referrers HTTP em *Google Cloud Console > APIs e Serviços >
Credenciais*.

## 4. Conteúdo e cabeçalhos

[`firebase.json`](firebase.json) envia CSP restritiva (`default-src 'self'`,
sem `unsafe-eval`, `frame-ancestors 'none'`, `object-src 'none'`, só os
domínios de que o site precisa), HSTS de um ano com `preload`,
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy` (câmara, microfone, localização e pagamentos desligados),
`Cross-Origin-Opener-Policy` e `Cross-Origin-Resource-Policy`.

> Se acrescentares um serviço externo (mapas, música, vídeo), a CSP bloqueia-o
> até o adicionares à lista. É o comportamento pretendido.

Não há `dangerouslySetInnerHTML`, `innerHTML`, `eval` nem `new Function` em
lado nenhum do código — verificado por varrimento.

## 5. Dependências

O `react-router` foi **removido**. Ambos os ramos tinham avisos sem correção
disponível: o ramo 6 um *open redirect* para XSS via `<Link>`
([GHSA-jjmj-jmhj-qwj2](https://github.com/advisories/GHSA-jjmj-jmhj-qwj2)), o
ramo 7 um CSRF em modo RSC. Nenhum era explorável aqui, mas o site usava três
funções da biblioteca — não compensava manter a superfície.

Está substituído por [`src/lib/router.jsx`](src/lib/router.jsx), ~130 linhas.
A defesa contra open redirect é estrutural: `navegar()` resolve o destino com
`new URL` e recusa tudo o que saia da origem do site. Testado contra
`https://evil.com`, `//evil.com`, `\\evil.com`, `\/evil.com`,
`javascript:alert(1)` e `https://evil.com\@host` — todos bloqueados.

Resultado: **dependências de produção com zero vulnerabilidades**, verificado a
cada PR com `npm audit --omit=dev --audit-level=low` (bloqueante). As
ferramentas de desenvolvimento — sobretudo a CLI do Firebase — arrastam pacotes
transitivos com avisos; ficam registados no CI mas não travam o PR, porque não
chegam ao browser.

## 6. Pipeline

- **Sem chaves de longa duração no repositório.** O deploy autentica-se por
  Workload Identity Federation: o GitHub emite um token de vida curta e o
  Google só o aceita se vier de `Magalhaes24/rosarinhoemanel` — a condição está
  em [`infra/cicd.tf`](infra/cicd.tf).
- A service account do deploy só publica Hosting. Não toca no Firestore.
- `permissions: {}` por omissão em todos os workflows; cada job pede o mínimo.
- `persist-credentials: false` nos checkouts, para o token do GitHub não ficar
  no `.git/config` do runner.
- As pré-visualizações usam `pull_request` (e não `pull_request_target`) e só
  correm para PRs do próprio repositório — PRs de forks nunca veem credenciais.
- `npm ci`, testes de regras, auditoria e `gitleaks` em cada PR. Dependabot
  semanal.

## O que *não* é segredo

A configuração do Firebase (`apiKey`, `appId`, etc.) vai dentro do JavaScript
que o browser descarrega. É pública por desenho e não há maneira de a esconder.
Está em variáveis de ambiente por arrumação, não por segurança. Quem protege os
dados são as regras, o App Check e a restrição de referrer.

## Reportar um problema

Abre um issue ou fala diretamente com o Francisco.
