import { useConteudo } from '../lib/conteudo.jsx'
import { Pagina } from '../seccoes/registo.jsx'
import './Presentes.css'

export default function Presentes() {
  const { paginas } = useConteudo()
  return (
    <main className="presentes">
      <Pagina seccoes={paginas.presentes || []} />
    </main>
  )
}
