import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cabeçalhos de segurança que o Firebase Hosting envia por HTTP. O GitHub Pages
// não permite cabeçalhos personalizados, por isso em Pages parte disto vai numa
// <meta>. Nem tudo funciona em meta: `frame-ancestors` e `Strict-Transport-
// Security` são ignorados aí — ver SECURITY.md.
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://www.googletagmanager.com https://www.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Imagens de qualquer origem HTTPS.
  //
  // É a única directiva propositadamente aberta. A administração permite colar
  // o endereço de uma imagem alojada noutro sítio (a loja do presente, por
  // exemplo), e restringir a lista de domínios obrigaria a mexer aqui de cada
  // vez. O que se perde: o site que aloja a imagem fica a saber o IP de quem
  // visita a página. O que NÃO se perde: continua a não poder correr código —
  // `script-src` não foi tocado, e é essa que impede um XSS.
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebaseinstallations.googleapis.com https://content-firebaseappcheck.googleapis.com https://firebasestorage.googleapis.com https://*.firebasestorage.app https://www.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "frame-src https://www.google.com",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ')

/**
 * Só no build de produção:
 *  - injeta a CSP em <meta>, para o site ficar protegido mesmo onde não há
 *    cabeçalhos (em desenvolvimento partiria o hot-reload do Vite, que usa
 *    scripts inline);
 *  - escreve um 404.html igual ao index.html. O GitHub Pages não sabe reescrever
 *    URLs, por isso um acesso direto a /noivos daria 404; assim serve a mesma
 *    aplicação e o encaminhador trata do resto.
 */
function paraProducao() {
  let baseDeSaida = 'dist'
  return {
    name: 'ajustes-de-producao',
    apply: 'build',
    configResolved(config) {
      baseDeSaida = config.build.outDir
    },
    transformIndexHtml(html) {
      return html.replace(
        '<head>',
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`
      )
    },
    closeBundle() {
      const index = resolve(baseDeSaida, 'index.html')
      if (existsSync(index)) copyFileSync(index, resolve(baseDeSaida, '404.html'))
    },
  }
}

export default defineConfig({
  // '/' no Firebase Hosting (domínio próprio); '/rosarinhoemanel/' no GitHub
  // Pages sem domínio próprio. Definido pelo workflow que faz o build.
  base: process.env.VITE_BASE || '/',
  plugins: [react(), paraProducao()],
  server: { port: 5173 },
})
