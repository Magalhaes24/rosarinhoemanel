import { useLayoutEffect, useState } from 'react'
import EscolherCor from './EscolherCor.jsx'
import EscolherFonte from './EscolherFonte.jsx'

/**
 * Quanto vale, em pixels, um ponto da medida do site (`--pt`).
 *
 * O site inteiro está escrito em pontos do rascunho, e o `--pt` traduz-os para
 * o ecrã de cada um. Para mostrar um tamanho em pontos — e não em
 * percentagem, que não diz nada — é preciso medir esse ponto onde o texto
 * está, porque a escala dos títulos e a do corpo podem ser diferentes.
 */
function unidadeDePonto(el) {
  if (!el || !el.parentElement) return 0
  const sonda = document.createElement('span')
  sonda.style.cssText =
    'position:absolute;visibility:hidden;font-size:calc(100 * var(--pt));line-height:0'
  el.parentElement.appendChild(sonda)
  const px = parseFloat(getComputedStyle(sonda).fontSize) / 100
  sonda.remove()
  return px || 0
}

/** O tamanho do texto em pontos do rascunho, tal como se vê neste momento. */
function pontosDoTexto(el) {
  const unidade = unidadeDePonto(el)
  if (!unidade) return null
  return parseFloat(getComputedStyle(el).fontSize) / unidade
}

/**
 * O espaço por baixo do item, em pontos.
 *
 * O espaçamento vertical do site anda no `--esp`, que é o `--pt` com o
 * respiro por cima; é essa a unidade em que se mede aqui, para o número na
 * barra querer dizer o mesmo que os números da folha de estilo.
 */
function unidadeDeEspaco(el) {
  if (!el || !el.parentElement) return 0
  const sonda = document.createElement('div')
  sonda.style.cssText = 'position:absolute;visibility:hidden;height:calc(100 * var(--esp))'
  el.parentElement.appendChild(sonda)
  const px = sonda.getBoundingClientRect().height / 100
  sonda.remove()
  return px || 0
}

function espacoDoTexto(el) {
  const unidade = unidadeDeEspaco(el)
  if (!unidade) return null
  return parseFloat(getComputedStyle(el).marginBottom) / unidade
}

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
 * O tamanho continua guardado como proporção do tamanho de origem — é o que
 * mantém um título a comportar-se como título e a acompanhar a escala global.
 * O que muda é o que se vê e se comanda: pontos, de um em um.
 */
export const LIMITES = {
  tamanho: { min: 0.25, max: 4, omissao: 1 },
  largura: { min: 20, max: 100, passo: 5, omissao: 100 },
}

/** Passo em pontos: de um em um nos tamanhos de texto, de dois nos de título. */
function passoEmPontos(pt) {
  return pt >= 40 ? 2 : 1
}

export function arredondar(v) {
  return Math.round(v * 100) / 100
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
export function estiloDoTexto(
  { tamanho = 1, largura = 100, alinhar = '', cor = '', fundo = '', espaco = '', peso = '', fonte = '' },
  embrulhado = false
) {
  const estilo = {}
  // Vazio quer dizer «o peso que a folha de estilo lhe dá»; só se escreve
  // `font-weight` quando o admin escolheu um.
  if (peso) estilo.fontWeight = Number(peso)
  if (fonte) estilo.fontFamily = fonte
  // `espaco` vazio quer dizer «não lhe toquei»; um zero escrito à mão é uma
  // escolha, e cola mesmo o item ao seguinte.
  if (espaco !== '' && espaco !== null && espaco !== undefined) {
    estilo.marginBottom = `calc(${Number(espaco) || 0} * var(--esp))`
    if (embrulhado) estilo.display = estilo.display || 'inline-block'
  }
  if (cor) estilo.color = cor
  // O fundo precisa de folga à volta das letras, senão fica um bloco de cor
  // colado ao texto. `inline-block` para a caixa existir de facto.
  if (fundo) {
    estilo.background = fundo
    estilo.padding = '0.25em 0.5em'
    estilo.borderRadius = '0.25em'
    if (embrulhado) estilo.display = 'inline-block'
  }
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

export default function AjustesTexto({
  alvo,
  tamanho,
  largura,
  alinhar,
  cor,
  fundo,
  espaco,
  peso,
  fonte,
  oculto = false,
  aoMudar,
  aoRepor,
  aoEliminar,
  aoNegritoDaSelecao,
}) {
  const [pos, setPos] = useState(null)
  const [pt, setPt] = useState(null)
  const [espacoPt, setEspacoPt] = useState(null)

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
      setPt(pontosDoTexto(el))
      setEspacoPt(espacoDoTexto(el))
    }
    medir()
    window.addEventListener('scroll', medir, true)
    window.addEventListener('resize', medir)
    return () => {
      window.removeEventListener('scroll', medir, true)
      window.removeEventListener('resize', medir)
    }
  }, [alvo, tamanho, espaco])

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
    const { min, max, passo: p } = LIMITES[tipo]
    const seguinte = arredondar(valor + sinal * p)
    return () => aoMudar(tipo, Math.min(max, Math.max(min, seguinte)))
  }

  /**
   * Sobe ou desce um ponto.
   *
   * O que se guarda continua a ser a proporção, mas ela sai da conta em vez de
   * ser escolhida à mão: sabendo o tamanho de origem — os pontos que o texto
   * teria sem ajuste nenhum — a proporção para chegar aos pontos que se querem
   * é uma divisão. Assim o número na barra é o tamanho real, e o texto continua
   * a encolher com o ecrã e a obedecer à escala global.
   */
  const passoEmPt = (sinal) => () => {
    if (!pt) return
    const { min, max } = LIMITES.tamanho
    const origem = pt / (tamanho || 1)
    const alvoPt = Math.max(1, Math.round(pt) + sinal * passoEmPontos(pt))
    aoMudar('tamanho', Math.min(max, Math.max(min, arredondar(alvoPt / origem))))
  }

  /**
   * O negrito, com dois destinos conforme o que está escolhido.
   *
   * Com palavras seleccionadas dentro do texto, são só essas que engordam — o
   * `execCommand` embrulha-as num `<b>` e o que ficar gravado passa pela
   * limpeza de quem nos chamou. Sem selecção, o negrito é do elemento todo,
   * como era antes, e vai para os ajustes como qualquer outro.
   */
  const negrito = () => {
    const sel = window.getSelection?.()
    const el = alvo.current
    const dentro =
      sel &&
      !sel.isCollapsed &&
      sel.rangeCount > 0 &&
      el &&
      el.contains(sel.getRangeAt(0).commonAncestorContainer)

    if (dentro && aoNegritoDaSelecao) {
      // `styleWithCSS` a falso para vir `<b>` e não uma `<span>` com estilo:
      // é `<b>` a única etiqueta que o texto pode guardar.
      document.execCommand('styleWithCSS', false, false)
      document.execCommand('bold')
      aoNegritoDaSelecao()
      return
    }

    aoMudar('peso', Number(peso) === 700 ? '' : 700)
  }

  /** O espaço por baixo sobe e desce de quatro em quatro pontos. */
  const mudarEspaco = (sinal) => {
    if (espacoPt === null) return
    aoMudar('espaco', Math.max(0, Math.round(espacoPt) + sinal * 4))
  }

  return (
    <div
      className={'ajuste-texto' + (pos.acima ? '' : ' is-abaixo')}
      style={{ top: pos.top, left: pos.left }}
      contentEditable={false}
    >
      <span className="ajuste-texto__grupo">
        {botao('A−', 'Diminuir o texto', passoEmPt(-1), {
          desativado: !pt || tamanho <= LIMITES.tamanho.min,
        })}
        <span className="ajuste-texto__valor">{pt ? `${Math.round(pt)} pt` : '—'}</span>
        {botao('A+', 'Aumentar o texto', passoEmPt(+1), {
          desativado: !pt || tamanho >= LIMITES.tamanho.max,
        })}
      </span>

      <span className="ajuste-texto__grupo">
        {/* Carregar uma vez põe a negrito; carregar outra devolve o peso de
            origem, que nuns sítios é fino e noutros já era grosso. */}
        {botao(
          'B',
          Number(peso) === 700 ? 'Tirar o negrito' : 'Pôr a negrito (ou só as palavras escolhidas)',
          negrito,
          { ativo: Number(peso) === 700 }
        )}
        {botao(
          'n',
          Number(peso) === 400 ? 'Voltar ao peso de origem' : 'Peso normal',
          () => aoMudar('peso', Number(peso) === 400 ? '' : 400),
          { ativo: Number(peso) === 400 }
        )}
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

      <span className="ajuste-texto__grupo">
        {botao('↕−', 'Menos espaço por baixo', () => mudarEspaco(-1), {
          desativado: espacoPt === null || Math.round(espacoPt) <= 0,
        })}
        <span className="ajuste-texto__valor">
          {espacoPt === null ? '—' : `${Math.round(espacoPt)} pt`}
        </span>
        {botao('↕+', 'Mais espaço por baixo', () => mudarEspaco(+1), {
          desativado: espacoPt === null,
        })}
      </span>

      <span className="ajuste-texto__grupo">
        <EscolherFonte valor={fonte} aoMudar={(v) => aoMudar('fonte', v)} />
        <EscolherCor
          etiqueta="Cor do texto"
          icone="A"
          valor={cor}
          aoMudar={(v) => aoMudar('cor', v)}
        />
        <EscolherCor
          etiqueta="Cor de fundo do texto"
          icone="■"
          valor={fundo}
          aoMudar={(v) => aoMudar('fundo', v)}
        />
      </span>

      {botao('↺', 'Voltar ao normal', aoRepor)}
      {/* Eliminar não apaga o texto: tira o item da página. Nos originais do
          site é uma escolha que se pode desfazer aqui mesmo, porque em edição
          o item continua visível — apagado, mas visível. */}
      {aoEliminar &&
        botao(oculto ? '⤾' : '🗑', oculto ? 'Repor este item' : 'Eliminar este item', aoEliminar, {
          ativo: oculto,
        })}
    </div>
  )
}
