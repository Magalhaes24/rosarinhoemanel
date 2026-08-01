/**
 * Prefixo de todos os caminhos do site.
 *
 * No Firebase Hosting o site vive na raiz do domínio e isto é uma string
 * vazia. No GitHub Pages sem domínio próprio vive em
 * /rosarinhoemanel/, e todos os `/imagens/...` e todas as rotas precisam
 * desse prefixo — senão o browser vai buscá-los à raiz do github.io.
 *
 * O valor vem de `base` no vite.config.js, definido no momento do build.
 */
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** caminho('/images/logo.png') -> '/rosarinhoemanel/images/logo.png' */
export function caminho(p) {
  return BASE + p
}
