import { useConteudo } from '../lib/conteudo.jsx'
import { Pagina } from '../seccoes/registo.jsx'
import './Home.css'

export default function Home() {
  const { paginas } = useConteudo()
  return (
    <main className="home">
      <Pagina seccoes={paginas.inicio || []} />
    </main>
  )
}
