import { useConteudo } from '../lib/conteudo.jsx'
import { Pagina } from '../seccoes/registo.jsx'
import './Noivos.css'

export default function Noivos() {
  const { paginas } = useConteudo()
  return (
    <main className="noivos">
      <Pagina seccoes={paginas.noivos || []} />
    </main>
  )
}
