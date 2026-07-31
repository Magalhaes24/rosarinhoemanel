import Carousel from '../components/Carousel.jsx'
import { fotosInfancia, fotosNamoro } from '../data/fotos.js'
import './Noivos.css'

export default function Noivos() {
  return (
    <main className="noivos">
      {/* ---------- Infância ---------- */}
      <section className="noivos__intro">
        <h1 className="display noivos__titulo">Rosarinho e Manel</h1>
        <Carousel
          slides={fotosInfancia}
          fit="natural"
          height={260}
          label="Fotografias de infância"
        />
      </section>

      {/* ---------- 2018 ---------- */}
      <section className="ano ano--creme">
        <div className="ano__texto">
          <h2 className="display ano__numero">2018</h2>
          <p className="corpo-sm">Conhecemos-nos em agosto de 2018, no campo do MAPA.</p>
        </div>
        <div className="ano__foto">
          <img src="/images/mapa-2018.jpeg" alt="Campo do MAPA, agosto de 2018" />
        </div>
      </section>

      {/* ---------- 2022 ---------- */}
      <section className="ano ano--azul ano--centrado">
        <div className="ano__texto">
          <h2 className="display ano__numero">2022</h2>
          <p className="corpo-sm">
            Depois de 4 anos de amizade, começámos a namorar no dia 13 de agosto de 2022.
            Aqui estão algumas fotografias dos anos que se seguiram.
          </p>
        </div>
        {fotosNamoro.length > 0 && (
          <div className="ano__carrossel">
            <Carousel
              slides={fotosNamoro}
              fit="natural"
              height={260}
              label="Fotografias do namoro"
            />
          </div>
        )}
      </section>

      {/* ---------- 2026 ---------- */}
      <section className="ano ano--creme">
        <div className="ano__texto">
          <h2 className="display ano__numero">2026</h2>
          <p className="corpo-sm">
            Ficámos noivos no dia 10 de Janeiro deste ano! No santuário da Peninha, em Sintra
          </p>
        </div>
        <div className="ano__foto ano__foto--alta">
          <img src="/images/noivado-2026.jpeg" alt="O pedido, no santuário da Peninha" />
        </div>
      </section>
    </main>
  )
}
