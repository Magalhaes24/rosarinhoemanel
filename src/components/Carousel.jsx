import { useCallback, useEffect, useRef, useState } from 'react'
import './Carousel.css'

/**
 * Carrossel horizontal.
 *
 * slides   – [{ src, alt }] ou [{ id, placeholder: true, proporcao }]
 * fit      – 'natural': altura fixa, largura conforme a proporção de cada foto
 *            (não corta nada — bom para fotos de orientações diferentes)
 *            'cover': grelha uniforme recortada (fita corrida, como no rascunho)
 * perView  – só em fit="cover": quantas fotos cabem de cada vez
 * aspect   – só em fit="cover"
 * height   – só em fit="natural": altura da fita, em pontos do rascunho
 * auto     – anda sozinho, em loop sem fim
 * intervalo– milissegundos entre avanços automáticos
 *
 * O loop sem costura faz-se duplicando as fotografias: quando o scroll passa
 * do fim da primeira cópia, recua-se instantaneamente essa distância. Como o
 * conteúdo é igual, não se vê nada — e não há o solavanco de rebobinar até ao
 * início que os carrosséis costumam ter.
 */
export default function Carousel({
  slides,
  fit = 'cover',
  perView = 4,
  aspect = '3 / 4',
  height = 300,
  auto = false,
  intervalo = 3200,
  label,
}) {
  const trackRef = useRef(null)
  const [pagina, setPagina] = useState(0)
  const [paginas, setPaginas] = useState(1)
  const [noInicio, setNoInicio] = useState(true)
  const [noFim, setNoFim] = useState(false)
  const [aArrastar, setAArrastar] = useState(false)
  const [parado, setParado] = useState(false)
  // Assume-se visível: o observador serve para PARAR quando sai do ecrã, não
  // para arrancar. Se por alguma razão não disparar, o carrossel anda na mesma.
  const [noEcra, setNoEcra] = useState(true)

  // Em loop, a lista aparece duas vezes.
  const lista = auto ? [...slides, ...slides] : slides

  const medir = useCallback(() => {
    const t = trackRef.current
    if (!t) return
    if (auto) return // em loop as setas nunca desativam e não há pontos
    const max = t.scrollWidth - t.clientWidth
    setPaginas(Math.max(1, Math.ceil(t.scrollWidth / t.clientWidth)))
    setPagina(t.clientWidth ? Math.round(t.scrollLeft / t.clientWidth) : 0)
    setNoInicio(t.scrollLeft <= 1)
    setNoFim(t.scrollLeft >= max - 1)
  }, [auto])

  /**
   * Salta uma cópia inteira, sem animação. Como as duas cópias são iguais, o
   * salto é invisível — serve só para haver sempre fotografias do lado para
   * onde se vai a seguir.
   *
   * É isto que faz o loop funcionar nos dois sentidos: `scrollLeft` nunca pode
   * ser negativo, por isso, para recuar a partir do início, avança-se primeiro
   * uma cópia e só depois se anima para trás.
   */
  const saltarCopia = useCallback((sentido) => {
    const t = trackRef.current
    if (!t) return
    const metade = t.scrollWidth / 2
    if (metade <= 0) return
    t.scrollLeft += sentido * metade
  }, [])

  const primeiroAntes = () => {
    const t = trackRef.current
    return [...t.children].reverse().find((c) => c.offsetLeft < t.scrollLeft - 2)
  }

  const primeiroDepois = () => {
    const t = trackRef.current
    return [...t.children].find((c) => c.offsetLeft > t.scrollLeft + 2)
  }

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

  /** Avança/recua uma fotografia (em loop) ou um ecrã (fora do loop). */
  const passo = useCallback(
    (dir) => {
      const t = trackRef.current
      if (!t) return
      if (!auto) {
        t.scrollBy({ left: dir * t.clientWidth, behavior: 'smooth' })
        return
      }

      // Trabalha-se sempre a partir da primeira cópia. Sem isto, perto do fim
      // o destino calculado cai para lá do scroll máximo, o browser corta-o, e
      // o carrossel fica preso sem dar sinal de erro.
      const metade = t.scrollWidth / 2
      if (metade > 0 && t.scrollLeft >= metade) t.scrollLeft -= metade

      // Para recuar a partir do início é preciso primeiro haver início.
      if (dir < 0 && !primeiroAntes()) saltarCopia(+1)

      const alvo = dir > 0 ? primeiroDepois() : primeiroAntes()
      if (alvo) t.scrollTo({ left: alvo.offsetLeft, behavior: 'smooth' })
    },
    [auto, saltarCopia]
  )

  // Só anda quando está à vista — não vale a pena mexer fora do ecrã.
  useEffect(() => {
    if (!auto) return
    const t = trackRef.current
    if (!t) return
    const io = new IntersectionObserver(([e]) => setNoEcra(e.isIntersecting), {
      threshold: 0.15,
    })
    io.observe(t)
    return () => io.disconnect()
  }, [auto])

  // Relógio do avanço automático.
  useEffect(() => {
    if (!auto || parado || aArrastar || !noEcra) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => passo(1), intervalo)
    return () => window.clearInterval(id)
  }, [auto, parado, aArrastar, noEcra, intervalo, passo])

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

  function aoPremir(e) {
    if (e.pointerType === 'touch') return
    const t = trackRef.current

    // Antes de começar a arrastar, garante folga dos dois lados: encostado ao
    // início não haveria para onde puxar à esquerda.
    if (auto) {
      const metade = t.scrollWidth / 2
      if (t.scrollLeft >= metade) saltarCopia(-1)
      if (t.scrollLeft < t.clientWidth && metade > 2 * t.clientWidth) saltarCopia(+1)
    }

    arrasto.current = { x: e.clientX, left: t.scrollLeft }
    setAArrastar(true)
    t.setPointerCapture(e.pointerId)
  }

  function aoMover(e) {
    const a = arrasto.current
    if (!a) return
    const t = trackRef.current
    t.scrollLeft = a.left - (e.clientX - a.x)

    // Se durante o arrasto se chegar a uma ponta, salta-se a cópia e continua
    // — o rato não perde o fio, e o ponto de partida acompanha o salto.
    if (auto) {
      const metade = t.scrollWidth / 2
      if (t.scrollLeft >= metade) {
        saltarCopia(-1)
        a.left -= metade
      } else if (t.scrollLeft <= 0 && metade > 0) {
        saltarCopia(+1)
        a.left += metade
      }
    }
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
    <div
      className={`carousel carousel--${fit}` + (auto ? ' carousel--loop' : '')}
      style={estilo}
      onMouseEnter={() => auto && setParado(true)}
      onMouseLeave={() => auto && setParado(false)}
      onFocusCapture={() => auto && setParado(true)}
      onBlurCapture={() => auto && setParado(false)}
    >
      <button
        type="button"
        className="carousel__arrow carousel__arrow--prev"
        onClick={() => passo(-1)}
        disabled={!auto && noInicio}
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
        {lista.map((s, i) => (
          <li className="carousel__item" key={`${s.src || s.id}-${i}`} aria-hidden={auto && i >= slides.length}>
            {s.placeholder ? (
              <div className="carousel__moldura" style={{ aspectRatio: s.proporcao }}>
                <span>fotografia a acrescentar</span>
              </div>
            ) : (
              <img
                src={s.src}
                alt={s.alt || ''}
                loading="lazy"
                draggable="false"
                onDragStart={(e) => e.preventDefault()}
                onLoad={medir}
              />
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="carousel__arrow carousel__arrow--next"
        onClick={() => passo(1)}
        disabled={!auto && noFim}
        aria-label="Fotografias seguintes"
      >
        <span aria-hidden="true">›</span>
      </button>

      {!auto && paginas > 1 && (
        <div className="carousel__dots">
          {Array.from({ length: paginas }, (_, i) => (
            <button
              key={i}
              type="button"
              className={'carousel__dot' + (i === pagina ? ' is-active' : '')}
              onClick={() => {
                setPagina(i)
                irPara(i)
              }}
              aria-label={`Ir para o grupo ${i + 1} de ${paginas}`}
              aria-current={i === pagina}
            />
          ))}
        </div>
      )}
    </div>
  )
}
