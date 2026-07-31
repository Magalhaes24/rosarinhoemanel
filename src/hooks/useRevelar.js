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
    const alvos = Array.from(document.querySelectorAll('[data-revelar], [data-revelar-zoom]'))
    if (!alvos.length) return

    const mostrar = (el) => el.classList.add('is-visivel')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      alvos.forEach(mostrar)
      return
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            mostrar(e.target)
            observador.unobserve(e.target)
          }
        }
      },
      // Conta como visível logo que 8% do elemento apareça, e trava um pouco
      // antes do fundo do ecrã para não animar já a sair de vista.
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    )

    alvos.forEach((a) => {
      const r = a.getBoundingClientRect()
      // O que já está no ecrã ao carregar aparece de imediato.
      if (r.top < window.innerHeight && r.bottom > 0) mostrar(a)
      else observador.observe(a)
    })

    // Rede de segurança: se por alguma razão o observador não disparar,
    // ninguém fica com a página em branco.
    const salvaguarda = window.setTimeout(() => alvos.forEach(mostrar), 5000)

    return () => {
      observador.disconnect()
      window.clearTimeout(salvaguarda)
    }
  }, [pathname])
}
