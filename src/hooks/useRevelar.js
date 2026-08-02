import { useEffect } from 'react'
import { useLocation } from '../lib/router.jsx'

/**
 * Faz aparecer os elementos marcados com `data-revelar` / `data-revelar-zoom`
 * à medida que entram no ecrã. A animação assenta exatamente no layout final —
 * só mexe em `opacity` e `transform`, nunca em medidas, por isso não desloca
 * nada.
 *
 * O estado inicial escondido é definido em CSS (ver animacoes.css), dentro de
 * `@media (scripting: enabled)`. Aqui só se marca o que já entrou no ecrã.
 */
export default function useRevelar() {
  const { pathname } = useLocation()

  useEffect(() => {
    const mostrar = (el) => el.classList.add('is-visivel')
    const seletor = '[data-revelar], [data-revelar-zoom]'
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const observador = semMovimento
      ? null
      : new IntersectionObserver(
          (entradas) => {
            for (const e of entradas) {
              if (e.isIntersecting) {
                mostrar(e.target)
                observador.unobserve(e.target)
              }
            }
          },
          // Conta como visível logo que 8% do elemento apareça, e trava um
          // pouco antes do fundo do ecrã para não animar já a sair de vista.
          { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
        )

    const tratar = (el) => {
      if (el.classList.contains('is-visivel') || el.dataset.revelarTratado) return
      el.dataset.revelarTratado = '1'
      if (!observador) return mostrar(el)

      const r = el.getBoundingClientRect()
      // O que já está no ecrã aparece de imediato, sem esperar por scroll.
      if (r.top < window.innerHeight && r.bottom > 0) mostrar(el)
      else observador.observe(el)
    }

    document.querySelectorAll(seletor).forEach(tratar)

    /**
     * Nem tudo existe quando a página monta: a grelha de presentes só aparece
     * depois de o Firestore responder, e as secções que o admin acrescenta
     * podem chegar a qualquer momento. Sem isto ficavam invisíveis para
     * sempre — estavam lá, com opacidade zero, à espera de um observador que
     * já tinha passado.
     */
    const vigia = new MutationObserver((mutacoes) => {
      for (const m of mutacoes) {
        for (const no of m.addedNodes) {
          if (no.nodeType !== 1) continue
          if (no.matches?.(seletor)) tratar(no)
          no.querySelectorAll?.(seletor).forEach(tratar)
        }
      }
    })
    vigia.observe(document.body, { childList: true, subtree: true })

    // Rede de segurança: se o observador não disparar, ninguém fica com a
    // página em branco.
    const salvaguarda = window.setTimeout(
      () => document.querySelectorAll(seletor).forEach(mostrar),
      5000
    )

    return () => {
      observador?.disconnect()
      vigia.disconnect()
      window.clearTimeout(salvaguarda)
    }
  }, [pathname])
}
