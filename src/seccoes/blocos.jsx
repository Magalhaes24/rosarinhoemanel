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

/** Um bloco. Tipo desconhecido não desenha nada, em vez de rebentar a página. */
export function Bloco({ dados }) {
  const alinhamento = dados.alinhamento || undefined
  // Só declara `text-align` quando o bloco tem alinhamento próprio; sem isso
  // herda o da secção, que é o que a opção «Como a secção» promete.
  const estilo = alinhamento ? { textAlign: alinhamento } : undefined

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
        <div className="bloco__botao" style={estilo}>
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
