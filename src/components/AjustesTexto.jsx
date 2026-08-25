import { useLayoutEffect, useState } from 'react'

/**
 * A barra de ajustes que aparece por cima de um texto que está a ser escrito:
 * tamanho, lado para onde encosta e largura da caixa.
 *
 * Vive aqui, e não dentro do `T`, porque serve dois sítios com origens
 * diferentes: os textos do site, que se guardam no tema pela chave do texto, e
 * os blocos de uma secção, que guardam os valores em si próprios. A barra não
 * sabe a diferença — recebe os valores e devolve os novos.
 */

/**
 * Os degraus do tamanho, de um quarto ao quádruplo.
 *
 * É uma escada e não um passo fixo porque a percentagem não se lê toda da
 * mesma maneira: entre 25% e 100% cinco pontos são muito, e acima de 200% são
 * nada. Assim os números que aparecem são sempre redondos e chega-se aos
 * extremos com meia dúzia de cliques em vez de sessenta.
 */
const ESCADA_TAMANHO = [
  0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4,
]

export const LIMITES = {
  tamanho: {
    min: ESCADA_TAMANHO[0],
    max: ESCADA_TAMANHO[ESCADA_TAMANHO.length - 1],
    escada: ESCADA_TAMANHO,
    omissao: 1,
  },
  largura: { min: 20, max: 100, passo: 5, omissao: 100 },
}

export function arredondar(v) {
  return Math.round(v * 100) / 100
}

/** O degrau seguinte da escada, acima ou abaixo do valor onde se está. */
function degrau(escada, valor, sinal) {
  const folga = 1e-9
  if (sinal > 0) return escada.find((v) => v > valor + folga) ?? escada[escada.length - 1]
  const abaixo = escada.filter((v) => v < valor - folga)
  return abaixo.length ? abaixo[abaixo.length - 1] : escada[0]
}

/** Lê um valor numérico com limites, caindo na omissão quando não presta. */
export function numero(v, { min, max, omissao }) {
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return omissao
  return Math.min(max, Math.max(min, n))
}

/**
 * Estilo de um texto a partir dos seus ajustes.
 *
 * `embrulhado` diz se o texto está dentro de uma `span` no meio de um
 * parágrafo. Nesse caso o tamanho é um `em` — o pai é mesmo o texto à volta —
 * e a `span` precisa de `inline-block` para ter caixa de linhas própria.
 *
 * Num bloco não serve: o `em` conta a partir do pai, que ali é o interior da
 * secção e não tem a medida do bloco. Por isso multiplica-se a `--bloco-fs`,
 * que cada tipo de bloco declara na folha de estilo. A entrelinha, sendo um
 * número sem unidade, acompanha sozinha nos dois casos.
 */
export function estiloDoTexto({ tamanho = 1, largura = 100, alinhar = '' }, embrulhado = false) {
  const estilo = {}
  if (tamanho !== 1) {
    if (embrulhado) {
      estilo.fontSize = `${tamanho}em`
      estilo.display = 'inline-block'
    } else {
      estilo.fontSize = `calc(var(--bloco-fs, 1em) * ${tamanho})`
    }
  }
  if (largura !== 100 || alinhar) {
    if (embrulhado) estilo.display = 'block'
    estilo.maxWidth = `${largura}%`
    if (alinhar) estilo.textAlign = alinhar
    // São as margens que encostam a caixa; o `text-align` só arruma as linhas
    // lá dentro. Sem isto, estreitar a caixa deixava-a sempre à esquerda.
    estilo.marginLeft = alinhar === 'left' ? '0' : 'auto'
    estilo.marginRight = alinhar === 'right' ? '0' : 'auto'
  }
  return estilo
}

const ALINHAMENTOS = [
  ['left', '⇤', 'Encostar à esquerda'],
  ['center', '⇔', 'Ao centro'],
  ['right', '⇥', 'Encostar à direita'],
]

export default function AjustesTexto({ alvo, tamanho, largura, alinhar, aoMudar, aoRepor }) {
  const [pos, setPos] = useState(null)

  // `useLayoutEffect` para a barra não aparecer primeiro no canto e só depois
  // saltar para o sítio certo.
  useLayoutEffect(() => {
    const medir = () => {
      const el = alvo.current
      if (!el) return
      const r = el.getBoundingClientRect()
      // Vai para baixo do texto quando não há espaço por cima — senão ficava
      // fora do ecrã em tudo o que está encostado ao topo da página.
      const acima = r.top > 70
      setPos({ top: acima ? r.top : r.bottom, left: r.left + r.width / 2, acima })
    }
    medir()
    window.addEventListener('scroll', medir, true)
    window.addEventListener('resize', medir)
    return () => {
      window.removeEventListener('scroll', medir, true)
      window.removeEventListener('resize', medir)
    }
  }, [alvo])

  if (!pos) return null

  // `onMouseDown` travado: sem isto o clique tirava o foco ao campo de texto e
  // os botões desapareciam antes de chegarem a responder.
  const botao = (etiqueta, titulo, aoCarregar, opcoes = {}) => (
    <button
      type="button"
      title={titulo}
      aria-label={titulo}
      aria-pressed={opcoes.ativo}
      className={opcoes.ativo ? 'is-ativo' : undefined}
      disabled={opcoes.desativado}
      onMouseDown={(e) => e.preventDefault()}
      onClick={aoCarregar}
    >
      {etiqueta}
    </button>
  )

  const passo = (tipo, valor, sinal) => {
    const { min, max, passo: p, escada } = LIMITES[tipo]
    const seguinte = escada ? degrau(escada, valor, sinal) : arredondar(valor + sinal * p)
    return () => aoMudar(tipo, Math.min(max, Math.max(min, seguinte)))
  }

  return (
    <div
      className={'ajuste-texto' + (pos.acima ? '' : ' is-abaixo')}
      style={{ top: pos.top, left: pos.left }}
      contentEditable={false}
    >
      <span className="ajuste-texto__grupo">
        {botao('A−', 'Diminuir o texto', passo('tamanho', tamanho, -1), {
          desativado: tamanho <= LIMITES.tamanho.min,
        })}
        <span className="ajuste-texto__valor">{Math.round(tamanho * 100)}%</span>
        {botao('A+', 'Aumentar o texto', passo('tamanho', tamanho, +1), {
          desativado: tamanho >= LIMITES.tamanho.max,
        })}
      </span>

      <span className="ajuste-texto__grupo">
        {ALINHAMENTOS.map(([valor, etiqueta, titulo]) =>
          botao(etiqueta, titulo, () => aoMudar('alinhar', valor), { ativo: alinhar === valor })
        )}
      </span>

      <span className="ajuste-texto__grupo">
        {botao('◧−', 'Estreitar a caixa', passo('largura', largura, -1), {
          desativado: largura <= LIMITES.largura.min,
        })}
        <span className="ajuste-texto__valor">{Math.round(largura)}%</span>
        {botao('◧+', 'Alargar a caixa', passo('largura', largura, +1), {
          desativado: largura >= LIMITES.largura.max,
        })}
      </span>

      {botao('↺', 'Voltar ao normal', aoRepor)}
    </div>
  )
}
