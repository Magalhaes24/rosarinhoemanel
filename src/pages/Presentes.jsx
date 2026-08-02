import { Fragment } from 'react'
import PresenteForm from '../components/PresenteForm.jsx'
import Carousel from '../components/Carousel.jsx'
import { fotosLuaDeMel } from '../data/fotos.js'
import { useConteudo } from '../lib/conteudo.jsx'
import './Presentes.css'

function Separador() {
  return <span className="destinos__sep" aria-hidden="true" />
}

function precoPt(valor) {
  if (valor === undefined || valor === null || valor === '') return null
  const n = Number(valor)
  if (Number.isNaN(n)) return String(valor)
  return n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })
}

/** Cartão de um presente da lista "Para a casa". */
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

export default function Presentes() {
  const { t, presentesCasa } = useConteudo()
  const destinos = t('lua.destinos')
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean)

  return (
    <main className="presentes">
      {/* ---------- Para a casa ---------- */}
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

      {/* ---------- Lua de mel ---------- */}
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
          <Carousel
            slides={fotosLuaDeMel}
            perView={5}
            aspect="3 / 4"
            label="Destinos da lua de mel"
          />
        </div>
      </section>

      {/* ---------- IBAN + formulário ---------- */}
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
    </main>
  )
}
