import { useConteudo } from '../lib/conteudo.jsx'
import { useEdicao } from '../lib/edicao.jsx'
import { useConfirmar } from '../components/Confirmacao.jsx'
import { tiposNativos } from './nativas.jsx'
import { tiposPersonalizados } from './personalizadas.jsx'
import './edicao.css'

/**
 * Registo único de tipos de secção.
 *
 * `nativo: true` marca os blocos desenhados a partir do rascunho: podem ser
 * reordenados e escondidos, mas não têm campos de forma — o texto edita-se no
 * próprio sítio, ou no separador «Textos» da administração.
 */
export const registo = {
  ...Object.fromEntries(
    Object.entries(tiposNativos).map(([id, def]) => [id, { ...def, nativo: true, campos: [] }])
  ),
  ...tiposPersonalizados,
}

/** Só os que fazem sentido no menu «acrescentar secção». */
export const tiposAcrescentaveis = Object.entries(tiposPersonalizados).map(([id, def]) => ({
  id,
  ...def,
}))

/** Desenha uma secção da lista. Um tipo desconhecido é ignorado, não rebenta. */
export function Seccao({ seccao }) {
  const def = registo[seccao.tipo]
  if (!def || seccao.escondida) return null
  const { Componente } = def
  return <Componente dados={seccao} />
}

/** Controlos que aparecem por cima de cada secção, em modo de edição. */
function ControlosDaSeccao({ pagina, seccoes, indice, aoMudar }) {
  const confirmar = useConfirmar()
  const s = seccoes[indice]
  const def = registo[s.tipo]

  const mover = (dir) => {
    const nova = [...seccoes]
    const destino = indice + dir
    if (destino < 0 || destino >= nova.length) return
    ;[nova[indice], nova[destino]] = [nova[destino], nova[indice]]
    aoMudar(pagina, nova)
  }

  const alternarVisivel = () => {
    const nova = [...seccoes]
    nova[indice] = { ...s, escondida: !s.escondida }
    aoMudar(pagina, nova)
  }

  const remover = async () => {
    const ok = await confirmar({
      titulo: 'Remover esta secção?',
      mensagem: 'Só sai do site quando gravares. Até lá podes descartar as alterações.',
      detalhe: def?.nome || s.tipo,
      textoConfirmar: 'Remover secção',
    })
    if (!ok) return
    aoMudar(
      pagina,
      seccoes.filter((_, i) => i !== indice)
    )
  }

  return (
    <div className="ctrl-seccao" contentEditable={false}>
      <span className="ctrl-seccao__nome">{def?.nome || s.tipo}</span>
      <button type="button" onClick={() => mover(-1)} disabled={indice === 0} aria-label="Subir">
        ↑
      </button>
      <button
        type="button"
        onClick={() => mover(1)}
        disabled={indice === seccoes.length - 1}
        aria-label="Descer"
      >
        ↓
      </button>
      <button type="button" onClick={alternarVisivel}>
        {s.escondida ? 'Mostrar' : 'Esconder'}
      </button>
      {!def?.nativo && (
        <button type="button" className="is-perigo" onClick={remover}>
          Remover
        </button>
      )}
    </div>
  )
}

/**
 * Desenha uma página inteira a partir da sua lista de secções.
 *
 * Fora do modo de edição não acrescenta um único elemento à volta das secções
 * — a marcação continua exatamente a que se mediu contra o rascunho.
 */
export function Pagina({ pagina, seccoes }) {
  const { emEdicao, alterarPagina } = useEdicao()

  if (!emEdicao) return seccoes.map((s) => <Seccao key={s.id} seccao={s} />)

  return seccoes.map((s, i) => {
    const def = registo[s.tipo]
    return (
      <div key={s.id} className={'envolve-seccao' + (s.escondida ? ' is-escondida' : '')}>
        <ControlosDaSeccao
          pagina={pagina}
          seccoes={seccoes}
          indice={i}
          aoMudar={alterarPagina}
        />
        {s.escondida ? (
          <p className="envolve-seccao__oculta">
            «{def?.nome || s.tipo}» está escondida dos convidados.
          </p>
        ) : (
          <Seccao seccao={s} />
        )}
      </div>
    )
  })
}

/** Atalho usado pelas três páginas. */
export function PaginaDoConteudo({ id }) {
  const { paginas } = useConteudo()
  return <Pagina pagina={id} seccoes={paginas[id] || []} />
}
