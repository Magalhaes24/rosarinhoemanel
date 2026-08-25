import { Fragment, useState } from 'react'
import { Link } from '../lib/router.jsx'
import { useConteudo, useTexto, resolverImagem } from '../lib/conteudo.jsx'
import { useEdicao } from '../lib/edicao.jsx'
import T from '../components/T.jsx'
import Img from '../components/Img.jsx'
import Galeria from '../components/Galeria.jsx'
import RsvpForm from '../components/RsvpForm.jsx'
import MetodosPagamento from '../components/MetodosPagamento.jsx'
import OferecerPresente, { Progresso, euros } from '../components/OferecerPresente.jsx'
import { molduras2022 } from '../data/molduras.js'
import { hoteisIds } from '../data/conteudoPadrao.js'
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

/**
 * Contactos de um hotel.
 *
 * Cada valor pode trazer mais do que um contacto separados por `/` — há
 * casas com duas linhas e hotéis com dois emails. São partidos aqui para cada
 * um ficar clicável por si: no telemóvel, ligar tem de ser um toque.
 */
function Contactos({ telefone, email }) {
  const partes = (valor) =>
    (valor || '')
      .split('/')
      .map((v) => v.trim())
      .filter(Boolean)

  const telefones = partes(telefone)
  const emails = partes(email)
  if (telefones.length === 0 && emails.length === 0) return null

  return (
    <p className="hoteis__contacto">
      {telefones.map((tel) => (
        <a key={tel} href={`tel:+351${tel.replace(/\s/g, '')}`}>
          {tel}
        </a>
      ))}
      {emails.map((mail) => (
        <a key={mail} href={`mailto:${mail}`}>
          {mail}
        </a>
      ))}
    </p>
  )
}

/**
 * A fotografia de um hotel.
 *
 * Não vem nenhuma de origem: cada uma é carregada na administração, no
 * botão «Trocar fotografia» que aparece sobre o cartão em modo de edição.
 * Enquanto não houver, o cartão fica só com o texto — mais vale isso do que
 * oito lugares vazios a dizer que falta uma fotografia.
 */
function FotoHotel({ chave, nome }) {
  const { img } = useConteudo()
  const { emEdicao } = useEdicao()

  if (!img(chave) && !emEdicao) return null

  return (
    <div className="hoteis__foto">
      <Img k={chave} alt={nome} ancora="centro" loading="lazy" />
    </div>
  )
}

/**
 * Onde ver o espaço.
 *
 * Quatro destas casas não têm sítio próprio nenhum — são quintas que só
 * existem no Booking e no Google. Por isso, sem `site` preenchido, o botão
 * leva ao Google Maps: tem as fotografias do lugar, as opiniões e o caminho,
 * que é o que quem procura dormida quer ver.
 */
function ligacaoDoEspaco(site, nome, regiao) {
  if (site) return site
  const procura = [nome, regiao].filter(Boolean).join(' ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(procura)}`
}

function Hoteis() {
  const t = useTexto()

  // As quebras de linha vêm do próprio texto (`white-space: pre-line` no CSS),
  // para o título continuar editável no sítio como um bloco só.
  return (
    <section className="hoteis">
      <h2 className="display hoteis__titulo" data-revelar>
        <T k="hoteis.titulo" multilinha />
      </h2>

      <p className="hoteis__intro" data-revelar style={{ '--atraso': '0.08s' }}>
        <T k="hoteis.intro" />
      </p>

      {/* Sem distâncias de propósito: as que constavam da origem eram medidas
          a outra quinta e só iam enganar quem as lesse. */}
      <ul className="hoteis__lista" data-revelar style={{ '--atraso': '0.14s' }}>
        {hoteisIds
          .filter((n) => t(`hoteis.${n}.nome`))
          .map((n) => (
            <li key={n} className="hoteis__cartao">
              <FotoHotel chave={`hoteis.${n}.foto`} nome={t(`hoteis.${n}.nome`)} />
              <h3 className="hoteis__nome">
                <T k={`hoteis.${n}.nome`} multilinha={false} />
              </h3>
              <p className="hoteis__tipo">
                <T k={`hoteis.${n}.tipo`} multilinha={false} />
              </p>
              <Contactos telefone={t(`hoteis.${n}.telefone`)} email={t(`hoteis.${n}.email`)} />

              {/* `noopener` fecha o acesso ao `window.opener` a partir do
                  sítio do hotel. */}
              <a
                className="hoteis__espaco"
                href={ligacaoDoEspaco(
                  t(`hoteis.${n}.site`),
                  t(`hoteis.${n}.nome`),
                  t('hoteis.regiao')
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <T k="hoteis.verEspaco" multilinha={false} />
                <span aria-hidden="true"> ↗</span>
              </a>
            </li>
          ))}
      </ul>
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

/**
 * Um presente da lista. O cartão inteiro abre a janela de oferta — é o gesto
 * que as pessoas já fazem por instinto num sítio destes.
 *
 * Quando o presente tem preço, mostra quanto já foi reunido: assim um presente
 * caro deixa de ser um bloco de pedra e passa a ser uma coisa para a qual se
 * pode dar vinte euros.
 */
function CartaoPresente({ item, jaContribuido, aoOferecer }) {
  const t = useTexto()
  const preco = Number(item.preco) || 0
  const completo = item.reservado || (preco > 0 && jaContribuido >= preco)
  const falta = Math.max(0, preco - jaContribuido)

  const classe = 'loja__item' + (completo ? ' is-reservado' : '')

  return (
    <button
      type="button"
      className={classe}
      onClick={() => !completo && aoOferecer(item)}
      disabled={completo}
    >
      <div className="loja__imagem">
        {item.imagem ? (
          <img src={item.imagem} alt="" loading="lazy" />
        ) : (
          <div className="loja__sem-imagem" aria-hidden="true" />
        )}
        {completo && <span className="loja__selo">{t('loja.reservado')}</span>}
      </div>
      <h3 className="loja__nome">{item.nome}</h3>
      {item.descricao && <p className="loja__descricao">{item.descricao}</p>}

      {preco > 0 && (
        <div className="loja__estado">
          <p className="loja__preco">{precoPt(preco)}</p>
          {!item.reservado && (
            <>
              <Progresso contribuido={jaContribuido} preco={preco} />
              <p className="loja__falta">
                {falta === 0 ? 'Já foi oferecido' : `Faltam ${euros(falta)}`}
              </p>
            </>
          )}
        </div>
      )}

      {!completo && <span className="loja__oferecer">Oferecer</span>}
    </button>
  )
}

function ParaACasa() {
  const { presentesCasa, contribuido, fotografias } = useConteudo()
  const [aOferecer, setAOferecer] = useState(null)

  // A fotografia é resolvida aqui, uma vez, e não em cada sítio que a mostra:
  // o que está gravado no presente pode ser `firestore:<id>`, que não serve
  // como `src` — era assim que as fotografias enviadas apareciam em branco.
  const itens = (presentesCasa || []).map((item) => ({
    ...item,
    imagem: resolverImagem(item.imagem, fotografias),
  }))

  return (
    <section className="presentes__bloco" id="casa">
      <h1 className="display presentes__titulo" data-revelar>
        <T k="casa.titulo" />
      </h1>

      <p className="presentes__intro" data-revelar style={{ '--atraso': '0.08s' }}>
        <T k="casa.intro" />
      </p>

      {presentesCasa === null ? null : itens.length === 0 ? (
        <p className="loja__vazio"><T k="casa.vazio" /></p>
      ) : (
        <ul className="loja" data-revelar>
          {itens.map((item) => (
            <li key={item.id}>
              <CartaoPresente
                item={item}
                jaContribuido={contribuido[item.id] || 0}
                aoOferecer={setAOferecer}
              />
            </li>
          ))}
        </ul>
      )}

      {aOferecer && (
        <OferecerPresente
          item={aOferecer}
          jaContribuido={contribuido[aOferecer.id] || 0}
          aoFechar={() => setAOferecer(null)}
        />
      )}
    </section>
  )
}

function Separador() {
  return <span className="destinos__sep" aria-hidden="true" />
}

/**
 * A lua de mel não é um presente da lista: não tem preço nem barra de
 * progresso. Entra na mesma janela dos outros com preço zero — assim quem
 * contribui escreve o valor que quiser e o registo sai igual ao dos restantes.
 */
const presenteLuaDeMel = (nome) => ({ id: 'luaDeMel', nome, preco: 0 })

function LuaDeMel() {
  const t = useTexto()
  const { contribuido } = useConteudo()
  const [aContribuir, setAContribuir] = useState(false)
  const destinos = t('lua.destinos')
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean)

  return (
    <section className="presentes__bloco" id="lua">
      <h2 className="display presentes__titulo" data-revelar>
        <T k="lua.titulo" />
      </h2>

      <p className="presentes__intro" data-revelar style={{ '--atraso': '0.08s' }}>
        <T k="lua.intro" />
      </p>

      <div className="presentes__acao" data-revelar style={{ '--atraso': '0.1s' }}>
        <button type="button" className="botao-contorno" onClick={() => setAContribuir(true)}>
          <T k="lua.botao" multilinha={false} />
        </button>
      </div>

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

      {aContribuir && (
        <OferecerPresente
          item={presenteLuaDeMel(t('lua.titulo'))}
          jaContribuido={contribuido.luaDeMel || 0}
          aoFechar={() => setAContribuir(false)}
        />
      )}
    </section>
  )
}

/**
 * O fecho da página dos presentes: o texto e os dados para pagar.
 *
 * Já não tem formulário — esse passou para dentro da janela de cada
 * presente, onde já se sabe o que está a ser oferecido e por quanto. Aqui
 * ficam só os dados, para quem preferir dar sem escolher nada da lista.
 */
function Contribuicao() {
  const t = useTexto()
  return (
    <section className="contribuicao">
      <div className="contribuicao__texto" data-revelar>
        <p><T k="contribuicao.texto1" /></p>
        <p><T k="contribuicao.texto2" /></p>
      </div>
      <div className="contribuicao__dados" data-revelar style={{ '--atraso': '0.1s' }}>
        <MetodosPagamento titulo={t('pagamento.titulo')} nota={t('pagamento.nota')} />
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
  contribuicao: { nome: 'Dados para transferência', Componente: Contribuicao },
}
