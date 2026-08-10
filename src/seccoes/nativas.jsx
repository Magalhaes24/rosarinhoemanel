import { Fragment } from 'react'
import { Link } from '../lib/router.jsx'
import { useConteudo, useTexto } from '../lib/conteudo.jsx'
import T from '../components/T.jsx'
import Img from '../components/Img.jsx'
import Galeria from '../components/Galeria.jsx'
import RsvpForm from '../components/RsvpForm.jsx'
import PresenteForm from '../components/PresenteForm.jsx'
import { molduras2022 } from '../data/molduras.js'
import iconeApple from '../assets/mapas/apple-maps.svg'
import iconeGoogle from '../assets/mapas/google-maps.svg'
import iconeWaze from '../assets/mapas/waze.svg'

/**
 * As secções desenhadas a partir do rascunho.
 *
 * Entram no mesmo registo das secções personalizadas para poderem ser
 * reordenadas e escondidas na administração — mas o markup e o CSS ficam
 * exatamente como estavam, porque foi este que se mediu contra o PDF. Só o
 * texto é editável; a forma não.
 */

// ---------------------------------------------------------------- Início

function Hero() {
  return (
    <section className="hero">
      <div className="hero__panel">
        <h1 className="display hero__nomes">
          <T k="hero.nome1" />
          <br />
          <T k="hero.nome2" />
        </h1>
        <p className="hero__data"><T k="hero.data" multilinha={false} /></p>
      </div>
      <div className="hero__fotografia">
        <Img k="hero.casal" alt="Rosarinho e Manel" />
      </div>
    </section>
  )
}

/**
 * Atalhos de navegação para a morada da secção.
 *
 * Cada aplicação tem o seu esquema de ligação; todas aceitam a morada por
 * texto, por isso basta o que está escrito no campo «morada» da administração.
 */
function ComoChegar({ chaveMorada }) {
  const t = useTexto()
  const morada = (t(chaveMorada) || '').trim()
  if (!morada) return null

  const destino = encodeURIComponent(morada)
  const ligacoes = [
    ['Google Maps', iconeGoogle, `https://www.google.com/maps/dir/?api=1&destination=${destino}`],
    ['Apple Maps', iconeApple, `https://maps.apple.com/?daddr=${destino}&dirflg=d`],
    ['Waze', iconeWaze, `https://waze.com/ul?q=${destino}&navigate=yes`],
  ]

  return (
    <div className="comoChegar">
      <span className="corpo comoChegar__legenda"><T k="mapas.legenda" /></span>
      <div className="comoChegar__pills">
        {ligacoes.map(([nome, icone, href]) => (
          <a
            key={nome}
            className="corpo comoChegar__pill"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={`${nome} — ${morada}`}
          >
            <img src={icone} alt="" />
            <span>{nome}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

function BandaMissa() {
  return (
    <section className="banda banda--missa">
      <Img k="missa.fundo" className="banda__bg" alt="" data-revelar-zoom />
      <div className="banda__caixa" data-revelar>
        <h2 className="display banda__titulo"><T k="missa.titulo" /></h2>
        <p className="corpo banda__local"><T k="missa.local" /></p>
        <p className="corpo banda__hora"><T k="missa.hora" multilinha={false} /></p>
        <ComoChegar chaveMorada="missa.morada" />
      </div>
    </section>
  )
}

function BandaCopo() {
  return (
    <section className="banda banda--copo">
      <Img k="copo.fundo" className="banda__bg" alt="" data-revelar-zoom />
      <div className="banda__caixa" data-revelar>
        <h2 className="display banda__titulo"><T k="copo.titulo" /></h2>
        <p className="corpo banda__local"><T k="copo.local" /></p>
        <p className="corpo banda__hora"><T k="copo.hora" multilinha={false} /></p>
        <ComoChegar chaveMorada="copo.morada" />
      </div>
    </section>
  )
}

function Rsvp() {
  return (
    <section className="rsvp" id="rsvp">
      <p className="corpo rsvp__texto" data-revelar>
        <strong><T k="rsvp.destaque" /></strong>
        <br />
        <T k="rsvp.texto" />
      </p>
      <div className="rsvp__cartao" data-revelar style={{ '--atraso': '0.14s' }}>
        <RsvpForm />
      </div>
    </section>
  )
}

function Historia() {
  return (
    <section className="historia">
      <div className="historia__texto" data-revelar>
        <p className="corpo">
          <T k="historia.texto" /> <strong><T k="historia.destaque" /></strong>
        </p>
        <Link className="botao-aqui" to="/noivos">
          <T k="historia.botao" />
        </Link>
      </div>
      <div className="historia__arco" data-revelar style={{ '--atraso': '0.16s' }}>
        <Img k="historia.arco" alt="Rosarinho e Manel" />
      </div>
    </section>
  )
}

function PresentesCta() {
  return (
    <section className="presentes-cta">
      <h2 className="display presentes-cta__titulo" data-revelar>
        <T k="presentes.titulo" />
      </h2>
      <div className="presentes-cta__botoes" data-revelar style={{ '--atraso': '0.16s' }}>
        <Link className="botao-contorno" to="/presentes#casa">
          <T k="presentes.botaoCasa" />
        </Link>
        <Link className="botao-contorno" to="/presentes#lua">
          <T k="presentes.botaoLua" />
        </Link>
      </div>
    </section>
  )
}

function Drivers() {
  const t = useTexto()
  return (
    <section className="drivers">
      <p className="corpo drivers__texto" data-revelar>
        <T k="drivers.texto" />
        <br />
        <T k="drivers.contactoTexto" />{' '}
        <strong>
          <T k="drivers.contactoNome" /> -{' '}
          <a href={`tel:+351${t('drivers.telefone').replace(/\s/g, '')}`} className="drivers__tel">
            <T k="drivers.telefone" multilinha={false} />
          </a>
        </strong>
      </p>
      <Img
          k="drivers.carros"
          className="drivers__carros"
          alt=""
          data-revelar
          style={{ '--atraso': '0.12s' }}
        />
    </section>
  )
}

function Hoteis() {
  // As quebras de linha vêm do próprio texto (`white-space: pre-line` no CSS),
  // para o título continuar editável no sítio como um bloco só.
  return (
    <section className="hoteis">
      <h2 className="display hoteis__titulo" data-revelar>
        <T k="hoteis.titulo" multilinha />
      </h2>
    </section>
  )
}

// ---------------------------------------------------------------- Noivos

function NoivosIntro() {
  return (
    <section className="noivos__intro">
      <h1 className="display noivos__titulo" data-revelar>
        <T k="noivos.titulo" />
      </h1>
      <Galeria nome="infancia" fit="natural" height={260} auto label="Fotografias de infância" />
    </section>
  )
}

function Ano2018() {
  return (
    <section className="ano ano--creme">
      <div className="ano__texto" data-revelar>
        <h2 className="display ano__numero"><T k="ano2018.numero" multilinha={false} /></h2>
        <p className="corpo-sm"><T k="ano2018.texto" /></p>
      </div>
      <div className="ano__fotografia" data-revelar style={{ '--atraso': '0.16s' }}>
        <Img k="ano2018.fotografia" alt="Campo do MAPA, agosto de 2018" />
      </div>
    </section>
  )
}

function Ano2022() {
  return (
    <section className="ano ano--azul ano--centrado">
      <div className="ano__texto" data-revelar>
        <h2 className="display ano__numero"><T k="ano2022.numero" multilinha={false} /></h2>
        <p className="corpo-sm"><T k="ano2022.texto" /></p>
      </div>
      <div className="ano__carrossel">
        <Galeria
          nome="namoro"
          molduras={molduras2022}
          fit="natural"
          height={260}
          auto
          label="Fotografias do namoro"
        />
      </div>
    </section>
  )
}

function Ano2026() {
  return (
    <section className="ano ano--creme">
      <div className="ano__texto" data-revelar>
        <h2 className="display ano__numero"><T k="ano2026.numero" multilinha={false} /></h2>
        <p className="corpo-sm"><T k="ano2026.texto" /></p>
      </div>
      <div className="ano__fotografia ano__fotografia--alta" data-revelar style={{ '--atraso': '0.16s' }}>
        <Img k="ano2026.fotografia" alt="O pedido, no santuário da Peninha" />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- Presentes

function precoPt(valor) {
  if (valor === undefined || valor === null || valor === '') return null
  const n = Number(valor)
  if (Number.isNaN(n)) return String(valor)
  return n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })
}

function CartaoPresente({ item }) {
  const t = useTexto()
  const preco = precoPt(item.preco)
  const conteudo = (
    <>
      <div className="loja__imagem">
        {item.imagem ? (
          <img src={item.imagem} alt="" loading="lazy" />
        ) : (
          <div className="loja__sem-imagem" aria-hidden="true" />
        )}
        {item.reservado && <span className="loja__selo">{t('loja.reservado')}</span>}
      </div>
      <h3 className="loja__nome">{item.nome}</h3>
      {item.descricao && <p className="loja__descricao">{item.descricao}</p>}
      {preco && <p className="loja__preco">{preco}</p>}
    </>
  )

  const classe = 'loja__item' + (item.reservado ? ' is-reservado' : '')

  // Só é ligação se houver para onde ir. `noopener` fecha o acesso ao
  // `window.opener` a partir do site de destino.
  return item.link ? (
    <a className={classe} href={item.link} target="_blank" rel="noopener noreferrer">
      {conteudo}
    </a>
  ) : (
    <div className={classe}>{conteudo}</div>
  )
}

function ParaACasa() {
  const { t, presentesCasa } = useConteudo()
  return (
    <section className="presentes__bloco" id="casa">
      <h1 className="display presentes__titulo" data-revelar>
        <T k="casa.titulo" />
      </h1>

      {presentesCasa === null ? null : presentesCasa.length === 0 ? (
        <p className="loja__vazio"><T k="casa.vazio" /></p>
      ) : (
        <ul className="loja" data-revelar>
          {presentesCasa.map((item) => (
            <li key={item.id}>
              <CartaoPresente item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Separador() {
  return <span className="destinos__sep" aria-hidden="true" />
}

function LuaDeMel() {
  const t = useTexto()
  const destinos = t('lua.destinos')
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean)

  return (
    <section className="presentes__bloco" id="lua">
      <h2 className="display presentes__titulo" data-revelar>
        <T k="lua.titulo" />
      </h2>

      {/* Achatado de propósito: separadores e nomes são todos filhos diretos
          do mesmo flex. Se os separadores ficarem aninhados dentro dos nomes,
          só o primeiro cresce e empurra tudo para um lado. */}
      <div className="destinos" data-revelar>
        {destinos.map((d) => (
          <Fragment key={d}>
            <Separador />
            <span className="destinos__item">{d}</span>
          </Fragment>
        ))}
        <Separador />
      </div>

      <div className="presentes__carrossel" data-revelar style={{ '--atraso': '0.14s' }}>
        <Galeria nome="luaDeMel" perView={5} aspect="3 / 4" label="Destinos da lua de mel" />
      </div>
    </section>
  )
}

function Contribuicao() {
  return (
    <section className="contribuicao">
      <div className="contribuicao__texto" data-revelar>
        <p><T k="contribuicao.texto1" /></p>
        <p><T k="contribuicao.texto2" /></p>
        <p className="contribuicao__iban"><T k="contribuicao.iban" /></p>
      </div>
      <div className="contribuicao__cartao">
        <PresenteForm />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------

/**
 * As nativas não têm campos: a forma vem do rascunho e o texto edita-se no
 * separador «Textos». Na administração só se reordenam e escondem.
 */
export const tiposNativos = {
  hero: { nome: 'Início — nomes e data', Componente: Hero },
  missa: { nome: 'Missa', Componente: BandaMissa },
  copo: { nome: 'Copo d’água', Componente: BandaCopo },
  rsvp: { nome: 'Confirmação de presença', Componente: Rsvp },
  historia: { nome: 'História', Componente: Historia },
  presentesCta: { nome: 'Lista de presentes (chamada)', Componente: PresentesCta },
  drivers: { nome: 'Drivers', Componente: Drivers },
  hoteis: { nome: 'Onde ficar', Componente: Hoteis },

  noivosIntro: { nome: 'Noivos — título e infância', Componente: NoivosIntro },
  ano2018: { nome: '2018', Componente: Ano2018 },
  ano2022: { nome: '2022', Componente: Ano2022 },
  ano2026: { nome: '2026', Componente: Ano2026 },

  paraACasa: { nome: 'Para a casa', Componente: ParaACasa },
  luaDeMel: { nome: 'Lua de mel', Componente: LuaDeMel },
  contribuicao: { nome: 'IBAN e mensagem', Componente: Contribuicao },
}
