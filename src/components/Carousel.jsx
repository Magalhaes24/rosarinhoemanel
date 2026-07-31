import { useCallback, useEffect, useRef, useState } from 'react'
import './Carousel.css'

/**
 * Carrossel horizontal.
 *
 * slides  – [{ src, alt }]
 * fit     – 'natural': altura fixa, largura conforme a proporção de cada foto
 *           (não corta nada — bom para fotos de orientações diferentes)
 *           'cover': grelha uniforme recortada (fita corrida, como no rascunho)
 * perView – só em fit="cover": quantas fotos cabem de cada vez
 * aspect  – só em fit="cover"
 * height  – só em fit="natural": altura da fita, em pontos do rascunho
 *
 * Navega por páginas (um ecrã de cada vez), com setas, teclado e arrastar.
 */
export default function Carousel({
  slides,
  fit = 'cover',
  perView = 4,
  aspect = '3 / 4',
  height = 300,
  label,
}) {
  const trackRef = useRef(null)
  const [pagina, setPagina] = useState(0)
  const [paginas, setPaginas] = useState(1)
  const [noInicio, setNoInicio] = useState(true)
  const [noFim, setNoFim] = useState(false)

  const medir = useCallback(() => {
    const t = trackRef.current
    if (!t) return
    const max = t.scrollWidth - t.clientWidth
    setPaginas(Math.max(1, Math.ceil(t.scrollWidth / t.clientWidth)))
    setPagina(t.clientWidth ? Math.round(t.scrollLeft / t.clientWidth) : 0)
    setNoInicio(t.scrollLeft <= 1)
    setNoFim(t.scrollLeft >= max - 1)
  }, [])

  useEffect(() => {
    const t = trackRef.current
    if (!t) return
    medir()

    t.addEventListener('scroll', medir, { passive: true })

    const ro = new ResizeObserver(medir)
    ro.observe(t)

    return () => {
      t.removeEventListener('scroll', medir)
      ro.disconnect()
    }
  }, [medir, slides])

  const irPara = useCallback((p) => {
    const t = trackRef.current
    if (!t) return
    t.scrollTo({ left: p * t.clientWidth, behavior: 'smooth' })
  }, [])

  const passo = useCallback(
    (dir) => {
      const t = trackRef.current
      if (!t) return
      t.scrollBy({ left: dir * t.clientWidth, behavior: 'smooth' })
    },
    []
  )

  function aoTeclar(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      passo(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      passo(-1)
    }
  }

  // Arrastar com o rato (no telemóvel o scroll nativo já chega)
  const arrasto = useRef(null)
  const [aArrastar, setAArrastar] = useState(false)

  function aoPremir(e) {
    if (e.pointerType === 'touch') return
    const t = trackRef.current
    arrasto.current = { x: e.clientX, left: t.scrollLeft }
    setAArrastar(true)
    t.setPointerCapture(e.pointerId)
  }

  function aoMover(e) {
    const a = arrasto.current
    if (!a) return
    trackRef.current.scrollLeft = a.left - (e.clientX - a.x)
  }

  function aoLargar(e) {
    if (!arrasto.current) return
    trackRef.current.releasePointerCapture(e.pointerId)
    arrasto.current = null
    setAArrastar(false)
  }

  const estilo =
    fit === 'natural'
      ? { '--altura': `calc(${height} * var(--pt))` }
      : { '--per-view': perView, '--aspect': aspect }

  return (
    <div className={`carousel carousel--${fit}`} style={estilo}>
      <button
        type="button"
        className="carousel__arrow carousel__arrow--prev"
        onClick={() => passo(-1)}
        disabled={noInicio}
        aria-label="Fotografias anteriores"
      >
        <span aria-hidden="true">‹</span>
      </button>

      <ul
        className={'carousel__track' + (aArrastar ? ' is-dragging' : '')}
        ref={trackRef}
        tabIndex={0}
        role="group"
        aria-label={label}
        onKeyDown={aoTeclar}
        onPointerDown={aoPremir}
        onPointerMove={aoMover}
        onPointerUp={aoLargar}
        onPointerCancel={aoLargar}
      >
        {/* `onLoad={medir}`: em fit="natural" a largura de cada foto só se
            conhece depois de carregar, e sem isso o número de páginas e o
            estado das setas ficavam desatualizados. */}
        {slides.map((s) => (
          <li className="carousel__item" key={s.src}>
            <img
              src={s.src}
              alt={s.alt || ''}
              loading="lazy"
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
              onLoad={medir}
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="carousel__arrow carousel__arrow--next"
        onClick={() => passo(1)}
        disabled={noFim}
        aria-label="Fotografias seguintes"
      >
        <span aria-hidden="true">›</span>
      </button>

      {paginas > 1 && (
        <div className="carousel__dots">
          {Array.from({ length: paginas }, (_, i) => (
            <button
              key={i}
              type="button"
              className={'carousel__dot' + (i === pagina ? ' is-active' : '')}
              onClick={() => irPara(i)}
              aria-label={`Ir para o grupo ${i + 1} de ${paginas}`}
              aria-current={i === pagina}
            />
          ))}
        </div>
      )}
    </div>
  )
}
