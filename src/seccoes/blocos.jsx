import { createContext, useContext, useEffect, useRef, useState } from 'react'
import AjustesTexto, { LIMITES, estiloDoTexto, numero } from '../components/AjustesTexto.jsx'

/**
 * Blocos de conteúdo dentro de uma secção.
 *
 * Uma secção «Conteúdo livre» é uma lista destes: títulos, subtítulos,
 * parágrafos, fotografias, botões e espaços, pela ordem que o admin quiser.
 * Cada bloco declara os seus campos com a mesma forma que os tipos de secção
 * usam, para o formulário do painel de edição servir aos dois sem saber a
 * diferença.
 *
 * A ordem vive na lista e não em campos numerados: reordenar é mexer na lista,
 * e é isso que permite arrastar sem deixar buracos nas chaves.
 */

/**
 * Por onde um bloco escreve de volta na sua secção.
 *
 * Quem desenha a secção em modo de edição põe aqui uma função que recebe o
 * índice do bloco e os dados novos. Fora da edição não há contexto nenhum e
 * os blocos desenham-se como sempre, sem uma linha de código a mais.
 */
export const ContextoBlocos = createContext(null)

const ALINHAMENTOS_DO_BLOCO = [
  ['', 'Como a secção'],
  ['left', 'À esquerda'],
  ['center', 'Ao centro'],
  ['right', 'À direita'],
]

const campoAlinhamentoDoBloco = {
  chave: 'alinhamento',
  etiqueta: 'Alinhamento',
  tipo: 'escolha',
  opcoes: ALINHAMENTOS_DO_BLOCO,
}

export const TIPOS_DE_BLOCO = {
  titulo: {
    nome: 'Título',
    omissao: { texto: 'Novo título' },
    campos: [{ chave: 'texto', etiqueta: 'Texto', tipo: 'texto' }, campoAlinhamentoDoBloco],
  },

  subtitulo: {
    nome: 'Subtítulo',
    omissao: { texto: 'Novo subtítulo' },
    campos: [{ chave: 'texto', etiqueta: 'Texto', tipo: 'texto' }, campoAlinhamentoDoBloco],
  },

  texto: {
    nome: 'Parágrafo',
    omissao: { texto: '' },
    campos: [{ chave: 'texto', etiqueta: 'Texto', tipo: 'textoLongo' }, campoAlinhamentoDoBloco],
  },

  imagem: {
    nome: 'Fotografia',
    omissao: { fotografia: '', legenda: '', largura: 'media' },
    campos: [
      { chave: 'fotografia', etiqueta: 'Fotografia', tipo: 'fotografia' },
      { chave: 'legenda', etiqueta: 'Legenda', tipo: 'texto' },
      {
        chave: 'largura',
        etiqueta: 'Largura',
        tipo: 'escolha',
        opcoes: [
          ['pequena', 'Pequena'],
          ['media', 'Média'],
          ['inteira', 'Toda a largura'],
        ],
      },
      campoAlinhamentoDoBloco,
    ],
  },

  botao: {
    nome: 'Botão',
    omissao: { texto: 'Botão', destino: '' },
    campos: [
      { chave: 'texto', etiqueta: 'Texto do botão', tipo: 'texto' },
      { chave: 'destino', etiqueta: 'Destino', tipo: 'texto', ajuda: '/noivos ou https://…' },
      campoAlinhamentoDoBloco,
    ],
  },

  espaco: {
    nome: 'Espaço',
    omissao: { altura: 60 },
    campos: [{ chave: 'altura', etiqueta: 'Altura', tipo: 'numero', min: 10, max: 400, passo: 10 }],
  },
}

const LARGURAS = { pequena: '40%', media: '70%', inteira: '100%' }

/** Os três blocos que são texto e mais nada, com a etiqueta que os desenha. */
const BLOCOS_DE_TEXTO = {
  titulo: ['h2', 'display bloco__titulo'],
  subtitulo: ['h3', 'bloco__subtitulo'],
  texto: ['p', 'corpo bloco__texto'],
}

/**
 * Um bloco de texto, escrito no próprio sítio quando se está em edição.
 *
 * É o mesmo gesto dos textos do site: carrega-se, escreve-se, e por cima
 * aparecem os botões de tamanho, lado e largura. A diferença é onde os
 * valores ficam — aqui viajam dentro do próprio bloco, e não no tema, porque
 * um bloco não tem chave de texto que sirva de nome.
 */
function BlocoDeTexto({ dados, indice, aoMudar, aoRemover }) {
  const [Etiqueta, classe] = BLOCOS_DE_TEXTO[dados.tipo]
  const ref = useRef(null)
  const [focado, setFocado] = useState(false)

  const tamanho = numero(dados.tamanho, LIMITES.tamanho)
  const largura = numero(dados.largura, LIMITES.largura)
  const alinhar = dados.alinhamento || ''

  // Um bloco já é um elemento de bloco: não precisa do `inline-block` que a
  // `span` de um texto do site precisa para ter caixa de linhas própria.
  const estilo = estiloDoTexto(
    {
      tamanho,
      largura,
      alinhar,
      cor: dados.cor || '',
      fundo: dados.fundo || '',
      espaco: dados.espaco ?? '',
      peso: dados.peso || '',
      fonte: dados.fonte || '',
    },
    false
  )

  useEffect(() => {
    const el = ref.current
    if (el && el.textContent !== (dados.texto || '')) el.textContent = dados.texto || ''
  }, [dados.texto])

  const mudar = (campo, v) =>
    aoMudar(indice, { ...dados, [campo === 'alinhar' ? 'alinhamento' : campo]: v })

  return (
    <>
      <Etiqueta
        ref={ref}
        className={classe + ' editavel'}
        style={Object.keys(estilo).length ? estilo : undefined}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        role="textbox"
        aria-label={dados.tipo}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        onInput={(e) => aoMudar(indice, { ...dados, texto: e.currentTarget.textContent })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            // Como nos textos do site: a quebra do próprio contentEditable mete
            // <div>/<br> e o `textContent` — que é o que se grava — perdia-a.
            e.preventDefault()
            document.execCommand('insertText', false, '\n')
          }
          if (e.key === 'Escape') e.currentTarget.blur()
        }}
        onPaste={(e) => {
          e.preventDefault()
          document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
        }}
      />
      {focado && (
        <AjustesTexto
          alvo={ref}
          tamanho={tamanho}
          largura={largura}
          alinhar={alinhar}
          aoMudar={mudar}
          cor={dados.cor || ''}
          fundo={dados.fundo || ''}
          espaco={dados.espaco ?? ''}
          peso={dados.peso || ''}
          fonte={dados.fonte || ''}
          aoEliminar={aoRemover ? () => aoRemover(indice) : undefined}
          aoRepor={() =>
            aoMudar(indice, {
              ...dados,
              tamanho: 1,
              largura: 100,
              alinhamento: '',
              cor: '',
              fundo: '',
              espaco: '',
              peso: '',
              fonte: '',
            })
          }
        />
      )}
    </>
  )
}

/** Um bloco. Tipo desconhecido não desenha nada, em vez de rebentar a página. */
export function Bloco({ dados, indice }) {
  const edicao = useContext(ContextoBlocos)
  const alinhamento = dados.alinhamento || undefined

  // Em edição os blocos de texto escrevem-se no sítio. Um bloco vazio continua
  // a aparecer, senão um parágrafo acabado de acrescentar não teria onde se
  // carregar para o escrever.
  if (edicao && BLOCOS_DE_TEXTO[dados.tipo]) {
    return (
      <BlocoDeTexto
        dados={dados}
        indice={indice}
        aoMudar={edicao.aoMudarBloco}
        aoRemover={edicao.aoRemoverBloco}
      />
    )
  }

  // Só declara `text-align` quando o bloco tem alinhamento próprio; sem isso
  // herda o da secção, que é o que a opção «Como a secção» promete.
  const estiloTexto = estiloDoTexto(
    {
      tamanho: numero(dados.tamanho, LIMITES.tamanho),
      largura: numero(dados.largura, LIMITES.largura),
      alinhar: alinhamento || '',
      cor: dados.cor || '',
      fundo: dados.fundo || '',
      espaco: dados.espaco ?? '',
      peso: dados.peso || '',
      fonte: dados.fonte || '',
    },
    false
  )
  const estilo = Object.keys(estiloTexto).length ? estiloTexto : undefined

  switch (dados.tipo) {
    case 'titulo':
      return dados.texto ? (
        <h2 className="display bloco__titulo" style={estilo}>
          {dados.texto}
        </h2>
      ) : null

    case 'subtitulo':
      return dados.texto ? (
        <h3 className="bloco__subtitulo" style={estilo}>
          {dados.texto}
        </h3>
      ) : null

    case 'texto':
      return dados.texto ? (
        <p className="corpo bloco__texto" style={estilo}>
          {dados.texto}
        </p>
      ) : null

    case 'imagem':
      return dados.fotografia ? (
        <figure
          className="bloco__figura"
          style={{
            width: LARGURAS[dados.largura] || LARGURAS.media,
            marginLeft: alinhamento === 'left' ? 0 : 'auto',
            marginRight: alinhamento === 'right' ? 0 : 'auto',
            textAlign: alinhamento,
          }}
        >
          <img src={dados.fotografia} alt={dados.legenda || ''} loading="lazy" />
          {dados.legenda && <figcaption className="corpo-sm">{dados.legenda}</figcaption>}
        </figure>
      ) : null

    case 'botao':
      return dados.texto ? (
        <div className="bloco__botao" style={alinhamento ? { textAlign: alinhamento } : undefined}>
          <a className="botao-contorno" href={dados.destino || '#'}>
            {dados.texto}
          </a>
        </div>
      ) : null

    case 'espaco':
      return (
        <div
          className="bloco__espaco"
          style={{ height: `calc(${dados.altura || 60} * var(--esp))` }}
          aria-hidden="true"
        />
      )

    default:
      return null
  }
}
