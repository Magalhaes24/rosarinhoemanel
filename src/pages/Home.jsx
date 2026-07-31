import { Link } from 'react-router-dom'
import RsvpForm from '../components/RsvpForm.jsx'
import './Home.css'

export default function Home() {
  return (
    <main className="home">
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero__panel">
          <h1 className="display hero__nomes">
            Rosarinho
            <br />e Manel
          </h1>
          <p className="hero__data">5 | 12 | 2026</p>
        </div>
        <div className="hero__foto">
          <img src="/images/hero-casal.png" alt="Rosarinho e Manel" />
        </div>
      </section>

      {/* ---------- Missa ---------- */}
      <section className="banda banda--missa">
        <img className="banda__bg" src="/images/igreja.png" alt="" />
        <div className="banda__caixa">
          <h2 className="display banda__titulo">Missa</h2>
          <p className="corpo banda__local">Igreja de Santa Isabel, Lisboa</p>
          <p className="corpo banda__hora">12:30</p>
        </div>
      </section>

      {/* ---------- Copo d'água ---------- */}
      <section className="banda banda--copo">
        <img className="banda__bg" src="/images/quinta.png" alt="" />
        <div className="banda__caixa">
          <h2 className="display banda__titulo">Copo d’água</h2>
          <p className="corpo banda__local">Quinta de D. Carlos, Alenquer</p>
          <p className="corpo banda__hora">14:30</p>
        </div>
      </section>

      {/* ---------- Confirmação de presença ---------- */}
      <section className="rsvp" id="rsvp">
        <p className="corpo rsvp__texto">
          <strong>Gostávamos muito que fizessem parte deste dia!</strong>
          <br />
          Se ainda não o fizeram, pedimos que confirmem aqui a vossa presença.
        </p>
        <div className="rsvp__cartao">
          <RsvpForm />
        </div>
      </section>

      {/* ---------- História ---------- */}
      <section className="historia">
        <div className="historia__texto">
          <p className="corpo">
            Deixamos aqui uma parte da nossa história,{' '}
            <strong>para que nos possam conhecer melhor.</strong>
          </p>
          <Link className="botao-aqui" to="/noivos">
            Aqui!
          </Link>
        </div>
        <div className="historia__arco">
          <img src="/images/casal-arco.jpeg" alt="Rosarinho e Manel" />
        </div>
      </section>

      {/* ---------- Lista de presentes ---------- */}
      <section className="presentes-cta">
        <h2 className="display presentes-cta__titulo">Lista de presentes</h2>
        <div className="presentes-cta__botoes">
          <Link className="botao-contorno" to="/presentes#casa">
            Para a casa
          </Link>
          <Link className="botao-contorno" to="/presentes#lua">
            Lua de mel
          </Link>
        </div>
      </section>

      {/* ---------- Drivers ---------- */}
      <section className="drivers">
        <p className="corpo drivers__texto">
          Para que todos se possam divertir sem preocupações, deixamos aqui um serviço de
          drivers.
          <br />
          Para organizarem tudo atempadamente falem com o{' '}
          <strong>
            Manel Sousa Guedes -{' '}
            <a href="tel:+351967590817" className="drivers__tel">
              967 590 817
            </a>
          </strong>
        </p>
        <img className="drivers__carros" src="/images/carros.png" alt="" />
      </section>

      {/* ---------- Onde ficar ---------- */}
      <section className="hoteis">
        <h2 className="display hoteis__titulo">
          Onde
          <br />
          ficar?
          <br />
          Hoteis
        </h2>
      </section>
    </main>
  )
}
