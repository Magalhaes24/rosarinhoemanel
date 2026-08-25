import { useEffect, useState } from 'react'
import './VoltarAoTopo.css'

/** A partir de quanto se desceu é que o botão faz falta. */
const LIMITE = 0.8

/**
 * Um botão discreto no canto, para voltar ao topo da página.
 *
 * Só aparece depois de se ter descido quase um ecrã — antes disso o topo ainda
 * está à mão e o botão só estorvava. Some-se outra vez ao chegar acima, para
 * não ficar a pairar sobre o início da página.
 *
 * O ouvinte é `passive`, por isso o browser não espera por ele para desenhar o
 * scroll, e a conta que faz é uma comparação de dois números.
 *
 * O movimento fica com o browser: quem tenha pedido menos animação no sistema
 * salta direto ao topo em vez de ver a página a correr.
 */
export default function VoltarAoTopo() {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > window.innerHeight * LIMITE)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRolar)
    return () => {
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRolar)
    }
  }, [])

  const subir = () => {
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' })
  }

  return (
    <button
      type="button"
      className={'ao-topo' + (visivel ? ' is-visivel' : '')}
      onClick={subir}
      aria-label="Voltar ao topo da página"
      title="Voltar ao topo"
      // Escondido dos leitores de ecrã e do teclado enquanto não serve para
      // nada: um botão invisível na ordem de tabulação é uma armadilha.
      aria-hidden={!visivel}
      tabIndex={visivel ? 0 : -1}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 15.5V5M5 9.5 10 4.5l5 5" fill="none" strokeWidth="1.7" />
      </svg>
    </button>
  )
}
