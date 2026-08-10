import { useEffect, useRef, useState } from 'react'
import { useConteudo } from '../lib/conteudo.jsx'
import { useEdicao } from '../lib/edicao.jsx'
import { useConfirmar } from '../components/Confirmacao.jsx'
import { tiposNativos } from './nativas.jsx'
import { tiposPersonalizados } from './personalizadas.jsx'
import Campos from './campos.jsx'
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

/** Identificador estável, para o React e para a reordenação. */
function novoId(tipo) {
  return `${tipo}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Botão de acrescentar que vive entre duas secções.
 *
 * Fica quase invisível até se lhe passar por cima: em edição há um destes em
 * cada intervalo, e a página ficaria ilegível se todos se vissem sempre.
 */
function AcrescentarAqui({ indice, aoAcrescentar, ultimo = false }) {
  const [aberto, setAberto] = useState(false)
  const caixa = useRef(null)

  // O botão «Acrescentar secção» da barra de edição abre o último destes e
  // rola até ele: sem isto era preciso descobrir a linha entre duas secções.
  useEffect(() => {
    if (!ultimo) return
    const abrir = () => {
      setAberto(true)
      caixa.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    window.addEventListener('acrescentar-seccao', abrir)
    return () => window.removeEventListener('acrescentar-seccao', abrir)
  }, [ultimo])

  if (!aberto) {
    return (
      <div className="acrescentar" contentEditable={false} ref={caixa}>
        <button type="button" className="acrescentar__botao" onClick={() => setAberto(true)}>
          + Acrescentar secção aqui
        </button>
      </div>
    )
  }

  return (
    <div className="acrescentar is-aberto" contentEditable={false} ref={caixa}>
      <div className="acrescentar__tipos">
        {tiposAcrescentaveis.map((t) => (
          <button
            key={t.id}
            type="button"
            className="acrescentar__tipo"
            onClick={() => {
              aoAcrescentar(indice, t.id)
              setAberto(false)
            }}
          >
            <strong>{t.nome}</strong>
            <span>{t.descricao}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="acrescentar__botao"
        onClick={() => setAberto(false)}
      >
        Cancelar
      </button>
    </div>
  )
}

/**
 * Painel de campos de uma secção acrescentada, aberto por cima do site.
 *
 * É o mesmo formulário do separador «Secções» da administração — só muda o
 * sítio onde aparece. Cada alteração entra logo no rascunho, para se ver o
 * resultado por baixo enquanto se mexe nos campos.
 */
function PainelDaSeccao({ definicao, dados, aoMudar, aoFechar }) {
  return (
    <div className="painel-seccao" contentEditable={false}>
      <div className="painel-seccao__topo">
        <strong>{definicao.nome}</strong>
        <button type="button" className="painel-seccao__fechar" onClick={aoFechar}>
          Fechar
        </button>
      </div>
      <div className="painel-seccao__corpo">
        <Campos definicao={definicao} dados={dados} aoMudar={aoMudar} />
      </div>
    </div>
  )
}

/** Controlos que aparecem por cima de cada secção, em modo de edição. */
function ControlosDaSeccao({ pagina, seccoes, indice, aoMudar, aEditar, setAEditar }) {
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
        <>
          <button type="button" onClick={() => setAEditar(aEditar === s.id ? null : s.id)}>
            {aEditar === s.id ? 'Fechar' : 'Editar'}
          </button>
          <button type="button" className="is-perigo" onClick={remover}>
            Remover
          </button>
        </>
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
  const [aEditar, setAEditar] = useState(null)

  if (!emEdicao) return seccoes.map((s) => <Seccao key={s.id} seccao={s} />)

  /** Entra na posição pedida — não só no fim, para se poder pôr no meio. */
  const acrescentar = (indice, tipo) => {
    const def = registo[tipo]
    const nova = [...seccoes]
    nova.splice(indice, 0, { id: novoId(tipo), tipo, ...def.omissao })
    alterarPagina(pagina, nova)
    setAEditar(nova[indice].id)
  }

  const editar = (indice, dados) => {
    const nova = [...seccoes]
    nova[indice] = dados
    alterarPagina(pagina, nova)
  }

  return (
    <>
      {seccoes.map((s, i) => {
        const def = registo[s.tipo]
        return (
          <div key={s.id}>
            <AcrescentarAqui indice={i} aoAcrescentar={acrescentar} />
            <div className={'envolve-seccao' + (s.escondida ? ' is-escondida' : '')}>
              <ControlosDaSeccao
                pagina={pagina}
                seccoes={seccoes}
                indice={i}
                aoMudar={alterarPagina}
                aEditar={aEditar}
                setAEditar={setAEditar}
              />
              {aEditar === s.id && def && !def.nativo && (
                <PainelDaSeccao
                  definicao={def}
                  dados={s}
                  aoMudar={(d) => editar(i, d)}
                  aoFechar={() => setAEditar(null)}
                />
              )}
              {s.escondida ? (
                <p className="envolve-seccao__oculta">
                  «{def?.nome || s.tipo}» está escondida dos convidados.
                </p>
              ) : (
                <Seccao seccao={s} />
              )}
            </div>
          </div>
        )
      })}
      <AcrescentarAqui indice={seccoes.length} aoAcrescentar={acrescentar} ultimo />
    </>
  )
}

/** Atalho usado pelas três páginas. */
export function PaginaDoConteudo({ id }) {
  const { paginas } = useConteudo()
  return <Pagina pagina={id} seccoes={paginas[id] || []} />
}
