import { Link } from '../lib/router.jsx'
import { caminho } from '../lib/caminho.js'
import { useTexto } from '../lib/conteudo.jsx'
import RsvpForm from '../components/RsvpForm.jsx'
import './Home.css'

export default function Home() {
  const t = useTexto()

  return (
    <main className="home">
      {/* ---------- Hero ---------- */}
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

      {/* ---------- Missa ---------- */}
      <section className="banda banda--missa">
        <img className="banda__bg" src={caminho('/images/igreja.png')} alt="" data-revelar-zoom />
        <div className="banda__caixa" data-revelar>
          <h2 className="display banda__titulo">{t('missa.titulo')}</h2>
          <p className="corpo banda__local">{t('missa.local')}</p>
          <p className="corpo banda__hora">{t('missa.hora')}</p>
        </div>
      </section>

      {/* ---------- Copo d'água ---------- */}
      <section className="banda banda--copo">
        <img className="banda__bg" src={caminho('/images/quinta.png')} alt="" data-revelar-zoom />
        <div className="banda__caixa" data-revelar>
          <h2 className="display banda__titulo">{t('copo.titulo')}</h2>
          <p className="corpo banda__local">{t('copo.local')}</p>
          <p className="corpo banda__hora">{t('copo.hora')}</p>
        </div>
      </section>

      {/* ---------- Confirmação de presença ---------- */}
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

      {/* ---------- História ---------- */}
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

      {/* ---------- Lista de presentes ---------- */}
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

      {/* ---------- Drivers ---------- */}
      <section className="drivers">
        <p className="corpo drivers__texto" data-revelar>
          {t('drivers.texto')}
          <br />
          {t('drivers.contactoTexto')}{' '}
          <strong>
            {t('drivers.contactoNome')} -{' '}
            <a
              href={`tel:+351${t('drivers.telefone').replace(/\s/g, '')}`}
              className="drivers__tel"
            >
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

      {/* ---------- Onde ficar ---------- */}
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
    </main>
  )
}
