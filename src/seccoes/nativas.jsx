import { Fragment } from 'react'
import { Link } from '../lib/router.jsx'
import { caminho } from '../lib/caminho.js'
import { useConteudo, useTexto } from '../lib/conteudo.jsx'
import Carousel from '../components/Carousel.jsx'
import RsvpForm from '../components/RsvpForm.jsx'
import PresenteForm from '../components/PresenteForm.jsx'
import { fotosInfancia, fotosNamoro, fotosLuaDeMel, molduras2022 } from '../data/fotos.js'

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
  const t = useTexto()
  return (
    <section className="hero">
      <div className="hero__panel">
        <h1 className="display hero__nomes">
          {t('hero.nome1')}
          <br />
          {t('hero.nome2')}
        </h1>
        <p className="hero__data">{t('hero.data')}</p>
      </div>
      <div className="hero__foto">
        <img src={caminho('/images/hero-casal.png')} alt="Rosarinho e Manel" />
      </div>
    </section>
  )
}

function BandaMissa() {
  const t = useTexto()
  return (
    <section className="banda banda--missa">
      <img className="banda__bg" src={caminho('/images/igreja.png')} alt="" data-revelar-zoom />
      <div className="banda__caixa" data-revelar>
        <h2 className="display banda__titulo">{t('missa.titulo')}</h2>
        <p className="corpo banda__local">{t('missa.local')}</p>
        <p className="corpo banda__hora">{t('missa.hora')}</p>
      </div>
    </section>
  )
}

function BandaCopo() {
  const t = useTexto()
  return (
    <section className="banda banda--copo">
      <img className="banda__bg" src={caminho('/images/quinta.png')} alt="" data-revelar-zoom />
      <div className="banda__caixa" data-revelar>
        <h2 className="display banda__titulo">{t('copo.titulo')}</h2>
        <p className="corpo banda__local">{t('copo.local')}</p>
        <p className="corpo banda__hora">{t('copo.hora')}</p>
      </div>
    </section>
  )
}

function Rsvp() {
  const t = useTexto()
  return (
    <section className="rsvp" id="rsvp">
      <p className="corpo rsvp__texto" data-revelar>
        <strong>{t('rsvp.destaque')}</strong>
        <br />
        {t('rsvp.texto')}
      </p>
      <div className="rsvp__cartao" data-revelar style={{ '--atraso': '0.14s' }}>
        <RsvpForm />
      </div>
    </section>
  )
}

function Historia() {
  const t = useTexto()
  return (
    <section className="historia">
      <div className="historia__texto" data-revelar>
        <p className="corpo">
          {t('historia.texto')} <strong>{t('historia.destaque')}</strong>
        </p>
        <Link className="botao-aqui" to="/noivos">
          {t('historia.botao')}
        </Link>
      </div>
      <div className="historia__arco" data-revelar style={{ '--atraso': '0.16s' }}>
        <img src={caminho('/images/casal-arco.jpeg')} alt="Rosarinho e Manel" />
      </div>
    </section>
  )
}

function PresentesCta() {
  const t = useTexto()
  return (
    <section className="presentes-cta">
      <h2 className="display presentes-cta__titulo" data-revelar>
        {t('presentes.titulo')}
      </h2>
      <div className="presentes-cta__botoes" data-revelar style={{ '--atraso': '0.16s' }}>
        <Link className="botao-contorno" to="/presentes#casa">
          {t('presentes.botaoCasa')}
        </Link>
        <Link className="botao-contorno" to="/presentes#lua">
          {t('presentes.botaoLua')}
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
        {t('drivers.texto')}
        <br />
        {t('drivers.contactoTexto')}{' '}
        <strong>
          {t('drivers.contactoNome')} -{' '}
          <a href={`tel:+351${t('drivers.telefone').replace(/\s/g, '')}`} className="drivers__tel">
            {t('drivers.telefone')}
          </a>
        </strong>
      </p>
      <img
        className="drivers__carros"
        src={caminho('/images/carros.png')}
        alt=""
        data-revelar
        style={{ '--atraso': '0.12s' }}
      />
    </section>
  )
}

function Hoteis() {
  const t = useTexto()
  return (
    <section className="hoteis">
      <h2 className="display hoteis__titulo" data-revelar>
        {t('hoteis.titulo')
          .split('\n')
          .map((linha, i) => (
            <span key={i}>
              {linha}
              <br />
            </span>
          ))}
      </h2>
    </section>
  )
}

// ---------------------------------------------------------------- Noivos

function NoivosIntro() {
  const t = useTexto()
  return (
    <section className="noivos__intro">
      <h1 className="display noivos__titulo" data-revelar>
        {t('noivos.titulo')}
      </h1>
      <Carousel slides={fotosInfancia} fit="natural" height={260} auto label="Fotografias de infância" />
    </section>
  )
}

function Ano2018() {
  const t = useTexto()
  return (
    <section className="ano ano--creme">
      <div className="ano__texto" data-revelar>
        <h2 className="display ano__numero">{t('ano2018.numero')}</h2>
        <p className="corpo-sm">{t('ano2018.texto')}</p>
      </div>
      <div className="ano__foto" data-revelar style={{ '--atraso': '0.16s' }}>
        <img src={caminho('/images/mapa-2018.jpeg')} alt="Campo do MAPA, agosto de 2018" />
      </div>
    </section>
  )
}

function Ano2022() {
  const t = useTexto()
  return (
    <section className="ano ano--azul ano--centrado">
      <div className="ano__texto" data-revelar>
        <h2 className="display ano__numero">{t('ano2022.numero')}</h2>
        <p className="corpo-sm">{t('ano2022.texto')}</p>
      </div>
      <div className="ano__carrossel">
        <Carousel
          slides={fotosNamoro.length ? fotosNamoro : molduras2022}
          fit="natural"
          height={260}
          auto={fotosNamoro.length > 0}
          label="Fotografias do namoro"
        />
      </div>
    </section>
  )
}

function Ano2026() {
  const t = useTexto()
  return (
    <section className="ano ano--creme">
      <div className="ano__texto" data-revelar>
        <h2 className="display ano__numero">{t('ano2026.numero')}</h2>
        <p className="corpo-sm">{t('ano2026.texto')}</p>
      </div>
      <div className="ano__foto ano__foto--alta" data-revelar style={{ '--atraso': '0.16s' }}>
        <img src={caminho('/images/noivado-2026.jpeg')} alt="O pedido, no santuário da Peninha" />
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
  const preco = precoPt(item.preco)
  const conteudo = (
    <>
      <div className="loja__imagem">
        {item.imagem ? (
          <img src={item.imagem} alt="" loading="lazy" />
        ) : (
          <div className="loja__sem-imagem" aria-hidden="true" />
        )}
        {item.reservado && <span className="loja__selo">Já oferecido</span>}
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
        {t('casa.titulo')}
      </h1>

      {presentesCasa === null ? null : presentesCasa.length === 0 ? (
        <p className="loja__vazio">{t('casa.vazio')}</p>
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
        {t('lua.titulo')}
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
        <Carousel slides={fotosLuaDeMel} perView={5} aspect="3 / 4" label="Destinos da lua de mel" />
      </div>
    </section>
  )
}

function Contribuicao() {
  const t = useTexto()
  return (
    <section className="contribuicao">
      <div className="contribuicao__texto" data-revelar>
        <p>{t('contribuicao.texto1')}</p>
        <p>{t('contribuicao.texto2')}</p>
        <p className="contribuicao__iban">{t('contribuicao.iban')}</p>
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
