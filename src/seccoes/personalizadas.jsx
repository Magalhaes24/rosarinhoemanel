import { useResolverImagem } from '../lib/conteudo.jsx'
import Carousel from '../components/Carousel.jsx'
import RsvpForm from '../components/RsvpForm.jsx'
import PresenteForm from '../components/PresenteForm.jsx'
import { Bloco } from './blocos.jsx'
import './seccoes.css'

/**
 * Tipos de secção que o admin pode acrescentar.
 *
 * Cada um declara os campos que a administração mostra e o componente que os
 * desenha. Acrescentar um tipo novo é acrescentar uma entrada aqui — nem a
 * administração nem o encaminhamento precisam de saber nada sobre ele.
 *
 * As cores vêm todas do tema (variáveis CSS), para uma secção nova nunca
 * destoar do resto do site nem sobreviver a uma mudança de paleta.
 */

export const FUNDOS = [
  ['creme', 'Creme'],
  ['creme2', 'Creme alternativo'],
  ['verde', 'Verde'],
  ['azul', 'Azul'],
  ['branco', 'Branco'],
]

/** Um fundo escuro pede texto claro. */
function classesFundo(fundo) {
  return `seccao--fundo-${fundo || 'creme'}`
}

function Titulo({ texto, className = '' }) {
  if (!texto) return null
  return <h2 className={`display seccao__titulo ${className}`}>{texto}</h2>
}

/** À esquerda, ao centro ou à direita — o mesmo em todos os tipos. */
export const ALINHAMENTOS = [
  ['center', 'Ao centro'],
  ['left', 'À esquerda'],
  ['right', 'À direita'],
]

const campoAlinhamento = {
  chave: 'alinhamento',
  etiqueta: 'Alinhamento',
  tipo: 'escolha',
  opcoes: ALINHAMENTOS,
}

/** O alinhamento aplica-se ao bloco inteiro: título, texto e botões. */
function estiloAlinhado(alinhamento) {
  return { textAlign: alinhamento || 'center' }
}

/** Texto simples, com título opcional. */
function Texto({ dados }) {
  return (
    <section className={`seccao seccao--texto ${classesFundo(dados.fundo)}`}>
      <div className="seccao__interior" data-revelar style={estiloAlinhado(dados.alinhamento)}>
        <Titulo texto={dados.titulo} />
        {dados.corpo && <p className="corpo seccao__corpo">{dados.corpo}</p>}
      </div>
    </section>
  )
}

/**
 * Secção montada bloco a bloco.
 *
 * É a que responde a «quero mais um título aqui e uma fotografia a seguir»:
 * em vez de campos fixos, uma lista de blocos pela ordem que o admin arrastar.
 */
function ConteudoLivre({ dados }) {
  const blocos = Array.isArray(dados.blocos) ? dados.blocos : []
  return (
    <section className={`seccao seccao--livre ${classesFundo(dados.fundo)}`}>
      <div className="seccao__interior" data-revelar style={estiloAlinhado(dados.alinhamento)}>
        {blocos.map((b, i) => (
          <Bloco key={i} indice={i} dados={b} />
        ))}
      </div>
    </section>
  )
}

/** Uma fotografia sozinha, com legenda opcional. */
function Fotografia({ dados }) {
  const resolver = useResolverImagem()
  if (!dados.fotografia) return null
  const larguras = { pequena: '40%', media: '70%', inteira: '100%' }
  return (
    <section className={`seccao seccao--fotografia ${classesFundo(dados.fundo)}`}>
      <div className="seccao__interior" data-revelar style={estiloAlinhado(dados.alinhamento)}>
        <figure
          className="seccao__figura"
          style={{
            width: larguras[dados.largura] || larguras.media,
            marginLeft: dados.alinhamento === 'left' ? 0 : 'auto',
            marginRight: dados.alinhamento === 'right' ? 0 : 'auto',
          }}
        >
          <img src={resolver(dados.fotografia)} alt={dados.legenda || ''} loading="lazy" />
          {dados.legenda && <figcaption className="corpo-sm">{dados.legenda}</figcaption>}
        </figure>
      </div>
    </section>
  )
}

/**
 * Grelha de cartões — 2, 3 ou 4 por linha.
 *
 * O número de linhas não se escolhe: sai do número de cartões. Seis cartões em
 * três colunas dão o 3x2; quatro em duas dão o 2x2. Nos telemóveis passa
 * sempre a uma coluna, que é a única leitura possível num ecrã estreito.
 */
function Grelha({ dados }) {
  const resolver = useResolverImagem()
  const cartoes = Array.isArray(dados.cartoes) ? dados.cartoes : []
  const colunas = Number(dados.colunas) || 2

  return (
    <section className={`seccao seccao--grelha ${classesFundo(dados.fundo)}`}>
      <div className="seccao__interior" data-revelar style={estiloAlinhado(dados.alinhamento)}>
        <Titulo texto={dados.titulo} />
        {cartoes.length > 0 && (
          <div className="grelha" style={{ '--colunas': colunas }}>
            {cartoes.map((c, i) => (
              <article
                key={i}
                className="grelha__cartao"
                // Um cartão é uma coluna flex: o alinhamento do bloco só chega
                // aos filhos em bloco, não ao botão.
                style={{
                  alignItems:
                    dados.alinhamento === 'left'
                      ? 'flex-start'
                      : dados.alinhamento === 'right'
                        ? 'flex-end'
                        : 'center',
                }}
              >
                {c.fotografia && (
                  <img
                    className="grelha__imagem"
                    src={resolver(c.fotografia)}
                    alt=""
                    loading="lazy"
                  />
                )}
                {c.titulo && <h3 className="grelha__titulo">{c.titulo}</h3>}
                {c.texto && <p className="corpo-sm grelha__texto">{c.texto}</p>}
                {c.botao && (
                  <a className="botao-contorno grelha__botao" href={c.destino || '#'}>
                    {c.botao}
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/** Um dos formulários do site, para o poder pôr onde fizer falta. */
function Formulario({ dados }) {
  return (
    <section className={`seccao seccao--formulario ${classesFundo(dados.fundo)}`}>
      <div className="seccao__interior" data-revelar>
        <Titulo texto={dados.titulo} />
        <div className="seccao__cartao">
          {dados.qual === 'presente' ? <PresenteForm /> : <RsvpForm />}
        </div>
      </div>
    </section>
  )
}

/** Fotografia a toda a largura com uma caixa por cima — como a «Missa». */
function Banda({ dados }) {
  const resolver = useResolverImagem()
  return (
    <section className="seccao banda banda--personalizada">
      {dados.fotografia && (
        <img className="banda__bg" src={resolver(dados.fotografia)} alt="" data-revelar-zoom />
      )}
      <div className="banda__caixa" data-revelar>
        <Titulo texto={dados.titulo} className="banda__titulo" />
        {dados.linha1 && <p className="corpo banda__local">{dados.linha1}</p>}
        {dados.linha2 && <p className="corpo banda__hora">{dados.linha2}</p>}
      </div>
    </section>
  )
}

/** Texto de um lado, fotografia do outro — como os anos na página dos noivos. */
function TextoEFotografia({ dados }) {
  const resolver = useResolverImagem()
  const fotografiaADireita = dados.lado !== 'esquerda'
  return (
    <section
      className={`seccao seccao--duas ${classesFundo(dados.fundo)} ${
        fotografiaADireita ? '' : 'seccao--invertida'
      }`}
    >
      <div className="seccao__texto" data-revelar>
        <Titulo texto={dados.titulo} />
        {dados.corpo && <p className="corpo-sm seccao__corpo">{dados.corpo}</p>}
      </div>
      <div className="seccao__fotografia" data-revelar style={{ '--atraso': '0.16s' }}>
        {dados.fotografia && <img src={resolver(dados.fotografia)} alt={dados.legenda || ''} />}
      </div>
    </section>
  )
}

/** Carrossel de fotografias. */
function Galeria({ dados }) {
  const resolver = useResolverImagem()
  const fotografias = (dados.fotografias || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((src) => ({ src: resolver(src), alt: '' }))

  return (
    <section className={`seccao seccao--galeria ${classesFundo(dados.fundo)}`}>
      <div className="seccao__interior" data-revelar>
        <Titulo texto={dados.titulo} />
        {fotografias.length > 0 && (
          <div className="seccao__carrossel">
            <Carousel
              slides={fotografias}
              fit="natural"
              height={260}
              auto={dados.automatico !== false}
              label={dados.titulo || 'Fotografias'}
            />
          </div>
        )}
      </div>
    </section>
  )
}

/** Título com um ou dois botões — como a chamada para a lista de presentes. */
function Botoes({ dados }) {
  const botoes = [
    { texto: dados.botao1, destino: dados.destino1 },
    { texto: dados.botao2, destino: dados.destino2 },
  ].filter((b) => b.texto)

  return (
    <section className={`seccao seccao--botoes ${classesFundo(dados.fundo)}`}>
      <div className="seccao__interior" data-revelar style={estiloAlinhado(dados.alinhamento)}>
        <Titulo texto={dados.titulo} />
        {botoes.length > 0 && (
          <div
            className="seccao__botoes"
            // Uma linha flex não obedece ao `text-align` herdado.
            style={{
              justifyContent:
                dados.alinhamento === 'left'
                  ? 'flex-start'
                  : dados.alinhamento === 'right'
                    ? 'flex-end'
                    : 'center',
            }}
          >
            {botoes.map((b, i) => (
              <a key={i} className="botao-contorno" href={b.destino || '#'}>
                {b.texto}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/** Espaço vazio, para dar respiro entre secções. */
function Espaco({ dados }) {
  return (
    <section
      className={`seccao seccao--espaco ${classesFundo(dados.fundo)}`}
      style={{ height: `calc(${dados.altura || 200} * var(--esp))` }}
      aria-hidden="true"
    />
  )
}

// ---------------------------------------------------------------------------
// Registo. `campos` é o que a administração mostra; `omissao` é o estado
// inicial ao acrescentar.
// ---------------------------------------------------------------------------

const campoFundo = { chave: 'fundo', etiqueta: 'Fundo', tipo: 'escolha', opcoes: FUNDOS }

export const tiposPersonalizados = {
  livre: {
    nome: 'Conteúdo livre',
    descricao: 'Títulos, textos, fotografias e botões pela ordem que quiseres.',
    Componente: ConteudoLivre,
    omissao: {
      alinhamento: 'center',
      fundo: 'creme',
      blocos: [
        { tipo: 'titulo', texto: 'Novo título' },
        { tipo: 'texto', texto: '' },
      ],
    },
    campos: [
      { chave: 'blocos', etiqueta: 'Blocos', tipo: 'blocos' },
      campoAlinhamento,
      campoFundo,
    ],
  },

  texto: {
    nome: 'Texto',
    descricao: 'Um título e um parágrafo.',
    Componente: Texto,
    omissao: { titulo: 'Novo título', corpo: '', fundo: 'creme', alinhamento: 'center' },
    campos: [
      { chave: 'titulo', etiqueta: 'Título', tipo: 'texto' },
      { chave: 'corpo', etiqueta: 'Texto', tipo: 'textoLongo' },
      campoFundo,
      campoAlinhamento,
    ],
  },

  fotografia: {
    nome: 'Fotografia',
    descricao: 'Uma fotografia sozinha, com legenda opcional.',
    Componente: Fotografia,
    omissao: { fotografia: '', legenda: '', largura: 'media', alinhamento: 'center', fundo: 'creme' },
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
      campoAlinhamento,
      campoFundo,
    ],
  },

  grelha: {
    nome: 'Grelha de cartões',
    descricao: 'Cartões em 2, 3 ou 4 colunas — 4 cartões em 2 colunas dão um 2x2.',
    Componente: Grelha,
    omissao: {
      titulo: '',
      colunas: 2,
      alinhamento: 'center',
      fundo: 'creme',
      cartoes: [
        { titulo: 'Primeiro', texto: '' },
        { titulo: 'Segundo', texto: '' },
      ],
    },
    campos: [
      { chave: 'titulo', etiqueta: 'Título', tipo: 'texto' },
      {
        chave: 'colunas',
        etiqueta: 'Colunas',
        tipo: 'escolha',
        opcoes: [
          ['2', 'Duas'],
          ['3', 'Três'],
          ['4', 'Quatro'],
        ],
      },
      { chave: 'cartoes', etiqueta: 'Cartões', tipo: 'cartoes' },
      campoAlinhamento,
      campoFundo,
    ],
  },

  formulario: {
    nome: 'Formulário',
    descricao: 'A confirmação de presença ou o formulário do presente.',
    Componente: Formulario,
    omissao: { titulo: '', qual: 'rsvp', fundo: 'creme' },
    campos: [
      { chave: 'titulo', etiqueta: 'Título', tipo: 'texto' },
      {
        chave: 'qual',
        etiqueta: 'Formulário',
        tipo: 'escolha',
        opcoes: [
          ['rsvp', 'Confirmação de presença'],
          ['presente', 'Presente oferecido'],
        ],
      },
      campoFundo,
    ],
  },

  banda: {
    nome: 'Fotografia com texto por cima',
    descricao: 'Uma fotografia a toda a largura, com uma caixa de texto ao centro.',
    Componente: Banda,
    omissao: { titulo: 'Novo título', linha1: '', linha2: '', fotografia: '' },
    campos: [
      { chave: 'fotografia', etiqueta: 'Fotografia', tipo: 'fotografia' },
      { chave: 'titulo', etiqueta: 'Título', tipo: 'texto' },
      { chave: 'linha1', etiqueta: 'Primeira linha', tipo: 'texto' },
      { chave: 'linha2', etiqueta: 'Segunda linha', tipo: 'texto' },
    ],
  },

  textoEFotografia: {
    nome: 'Texto e fotografia',
    descricao: 'Texto de um lado, fotografia do outro.',
    Componente: TextoEFotografia,
    omissao: { titulo: '', corpo: '', fotografia: '', lado: 'direita', fundo: 'creme' },
    campos: [
      { chave: 'titulo', etiqueta: 'Título', tipo: 'texto' },
      { chave: 'corpo', etiqueta: 'Texto', tipo: 'textoLongo' },
      { chave: 'fotografia', etiqueta: 'Fotografia', tipo: 'fotografia' },
      {
        chave: 'lado',
        etiqueta: 'Fotografia',
        tipo: 'escolha',
        opcoes: [
          ['direita', 'À direita'],
          ['esquerda', 'À esquerda'],
        ],
      },
      campoFundo,
    ],
  },

  galeria: {
    nome: 'Galeria',
    descricao: 'Carrossel de fotografias.',
    Componente: Galeria,
    omissao: { titulo: '', fotografias: '', fundo: 'creme', automatico: true },
    campos: [
      { chave: 'titulo', etiqueta: 'Título', tipo: 'texto' },
      {
        chave: 'fotografias',
        etiqueta: 'Fotografias',
        tipo: 'listaDeFotografias',
        ajuda: 'Um endereço por linha.',
      },
      { chave: 'automatico', etiqueta: 'Andar sozinho', tipo: 'booleano' },
      campoFundo,
    ],
  },

  botoes: {
    nome: 'Título com botões',
    descricao: 'Um título e até dois botões.',
    Componente: Botoes,
    omissao: { titulo: 'Novo título', botao1: '', destino1: '', botao2: '', destino2: '', fundo: 'verde' },
    campos: [
      { chave: 'titulo', etiqueta: 'Título', tipo: 'texto' },
      { chave: 'botao1', etiqueta: 'Primeiro botão', tipo: 'texto' },
      { chave: 'destino1', etiqueta: 'Destino do primeiro', tipo: 'texto', ajuda: '/noivos ou https://…' },
      { chave: 'botao2', etiqueta: 'Segundo botão', tipo: 'texto' },
      { chave: 'destino2', etiqueta: 'Destino do segundo', tipo: 'texto' },
      campoAlinhamento,
      campoFundo,
    ],
  },

  espaco: {
    nome: 'Espaço',
    descricao: 'Uma faixa vazia, para separar secções.',
    Componente: Espaco,
    omissao: { altura: 200, fundo: 'creme' },
    campos: [
      { chave: 'altura', etiqueta: 'Altura', tipo: 'numero', min: 40, max: 800, passo: 20 },
      campoFundo,
    ],
  },
}
