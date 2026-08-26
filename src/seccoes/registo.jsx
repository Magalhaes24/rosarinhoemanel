import { useState } from 'react'
import { useConteudo } from '../lib/conteudo.jsx'
import { useEdicao } from '../lib/edicao.jsx'
import { useConfirmar } from '../components/Confirmacao.jsx'
import { tiposNativos } from './nativas.jsx'
import { tiposPersonalizados } from './personalizadas.jsx'
import { Bloco, ContextoBlocos } from './blocos.jsx'
import EscolherCor from '../components/EscolherCor.jsx'
import Campos from './campos.jsx'
import './edicao.css'

/**
 * Blocos que se podem acrescentar ao fim de qualquer secção.
 *
 * A forma das nativas continua a ser a que se mediu do rascunho — não têm
 * campos que a mudem. Mas passam a poder levar mais coisas atrás: outro
 * parágrafo, um botão, uma fotografia. É o mesmo editor de blocos da secção
 * «Conteúdo livre», e por isso arrasta-se e reordena-se da mesma maneira.
 */
const campoBlocosExtra = {
  chave: 'blocos',
  etiqueta: 'Acrescentar a esta secção',
  tipo: 'blocos',
}

/**
 * Registo único de tipos de secção.
 *
 * `nativo: true` marca os blocos desenhados a partir do rascunho: podem ser
 * reordenados, escondidos, removidos e ganhar blocos no fim, mas não têm
 * campos que mudem a forma — o texto edita-se no próprio sítio, ou no
 * separador «Textos» da administração. Remover uma delas não perde nada: o
 * «Repor o original desta página» volta à lista de `paginasPadrao`.
 */
export const registo = {
  ...Object.fromEntries(
    Object.entries(tiposNativos).map(([id, def]) => [
      id,
      { ...def, nativo: true, campos: [campoBlocosExtra] },
    ])
  ),
  ...Object.fromEntries(
    Object.entries(tiposPersonalizados).map(([id, def]) => [
      id,
      // A «Conteúdo livre» já é feita de blocos e desenha-os ela própria; nas
      // outras o campo entra no fim da lista, a seguir aos campos de forma.
      id === 'livre' ? def : { ...def, campos: [...def.campos, campoBlocosExtra] },
    ])
  ),
}

/** Só os que fazem sentido no menu «acrescentar secção». */
export const tiposAcrescentaveis = Object.entries(tiposPersonalizados).map(([id, def]) => ({
  id,
  ...def,
}))

/**
 * Desenha uma secção da lista. Um tipo desconhecido é ignorado, não rebenta.
 *
 * `aoMudar` só chega em modo de edição: é por aí que os blocos de texto se
 * escrevem no próprio sítio. Sem ele não há contexto nenhum e os blocos
 * desenham-se como sempre.
 */
export function Seccao({ seccao, aoMudar }) {
  const def = registo[seccao.tipo]
  if (!def || seccao.escondida) return null
  const { Componente } = def

  // A «Conteúdo livre» trata dos seus blocos por dentro; nas outras os blocos
  // acrescentados vêm a seguir à secção, com o mesmo recuo do resto do site.
  const extra = seccao.tipo === 'livre' || !Array.isArray(seccao.blocos) ? [] : seccao.blocos

  const conteudo = (
    <>
      <Componente dados={seccao} />
      {extra.length > 0 && (
        <div className="seccao-extra" data-revelar>
          {extra.map((b, i) => (
            <Bloco key={i} indice={i} dados={b} />
          ))}
        </div>
      )}
    </>
  )

  const classes = [
    seccao.corFundo ? 'seccao-cores--fundo' : '',
    seccao.corTexto ? 'seccao-cores--texto' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const desenho = classes ? (
    <div
      className={`seccao-cores ${classes}`}
      style={{
        ...(seccao.corFundo ? { '--fundo-seccao': seccao.corFundo } : null),
        ...(seccao.corTexto ? { '--cor-seccao': seccao.corTexto } : null),
      }}
    >
      {conteudo}
    </div>
  ) : (
    conteudo
  )

  if (!aoMudar) return desenho

  const aoMudarBloco = (indice, dados) => {
    const lista = Array.isArray(seccao.blocos) ? [...seccao.blocos] : []
    lista[indice] = dados
    aoMudar({ ...seccao, blocos: lista })
  }

  const aoRemoverBloco = (indice) => {
    const lista = Array.isArray(seccao.blocos) ? [...seccao.blocos] : []
    lista.splice(indice, 1)
    aoMudar({ ...seccao, blocos: lista })
  }

  return (
    <ContextoBlocos.Provider value={{ aoMudarBloco, aoRemoverBloco }}>
      {desenho}
    </ContextoBlocos.Provider>
  )
}

/** Identificador estável, para o React e para a reordenação. */
function novoId(tipo) {
  return `${tipo}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Botão de acrescentar que vive entre duas secções.
 *
 * Há um em cada intervalo, e outro no fim da página. É por aqui que se
 * acrescenta uma secção — não há entrada nenhuma na barra de baixo.
 */
function AcrescentarAqui({ indice, aoAcrescentar }) {
  const [aberto, setAberto] = useState(false)

  if (!aberto) {
    return (
      <div className="acrescentar" contentEditable={false}>
        <button type="button" className="acrescentar__botao" onClick={() => setAberto(true)}>
          + Acrescentar secção aqui
        </button>
      </div>
    )
  }

  return (
    <div className="acrescentar is-aberto" contentEditable={false}>
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

/** A lista de secções com uma cor mudada numa delas. */
function comCor(seccoes, indice, campo, valor) {
  const nova = [...seccoes]
  nova[indice] = { ...nova[indice], [campo]: valor }
  return nova
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
      mensagem: def?.nativo
        ? 'Só sai do site quando gravares. Esta é uma das secções do desenho original — para a trazer de volta, usa «Repor o original desta página» na administração.'
        : 'Só sai do site quando gravares. Até lá podes descartar as alterações.',
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
      <EscolherCor
        etiqueta="Cor do texto da secção"
        icone="A"
        valor={s.corTexto || ''}
        aoMudar={(v) => aoMudar(pagina, comCor(seccoes, indice, 'corTexto', v))}
      />
      <EscolherCor
        etiqueta="Cor de fundo da secção"
        icone="■"
        valor={s.corFundo || ''}
        aoMudar={(v) => aoMudar(pagina, comCor(seccoes, indice, 'corFundo', v))}
      />
      <button type="button" onClick={() => setAEditar(aEditar === s.id ? null : s.id)}>
        {aEditar === s.id ? 'Fechar' : def?.nativo ? 'Acrescentar' : 'Editar'}
      </button>
      <button type="button" className="is-perigo" onClick={remover}>
        Remover
      </button>
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
              {aEditar === s.id && def && (
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
                <Seccao seccao={s} aoMudar={(d) => editar(i, d)} />
              )}
            </div>
          </div>
        )
      })}
      <AcrescentarAqui indice={seccoes.length} aoAcrescentar={acrescentar} />
    </>
  )
}

/** Atalho usado pelas páginas do site. */
export function PaginaDoConteudo({ id }) {
  const { paginas } = useConteudo()
  return <Pagina pagina={id} seccoes={paginas[id] || []} />
}
