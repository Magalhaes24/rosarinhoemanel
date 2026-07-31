import PresenteForm from '../components/PresenteForm.jsx'
import Carousel from '../components/Carousel.jsx'
import { fotosLuaDeMel } from '../data/fotos.js'
import './Presentes.css'

const DESTINOS = ['Peru', 'Colombia', 'Panamá']

function Separador() {
  return <span className="destinos__sep" aria-hidden="true" />
}

export default function Presentes() {
  return (
    <main className="presentes">
      {/* ---------- Para a casa ---------- */}
      <section className="presentes__bloco" id="casa">
        <h1 className="display presentes__titulo" data-revelar>Para a casa</h1>
      </section>

      {/* ---------- Lua de mel ---------- */}
      <section className="presentes__bloco" id="lua">
        <h2 className="display presentes__titulo" data-revelar>Lua de mel</h2>

        <div className="destinos" data-revelar>
          <Separador />
          {DESTINOS.map((d) => (
            <span key={d} className="destinos__item">
              {d}
              <Separador />
            </span>
          ))}
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
          <p>A melhor forma de nos ajudarem é com uma contribuição para o IBAN abaixo.</p>
          <p>
            Para conseguirmos agradecer a todos, deixem por favor uma nota com o presente que
            escolheram!
          </p>
          <p className="contribuicao__iban">IBAN:</p>
        </div>
        <div className="contribuicao__cartao">
          <PresenteForm />
        </div>
      </section>
    </main>
  )
}
