import { useState } from 'react'
import { doc, getFirestore, setDoc } from 'firebase/firestore'
import { app } from '../../lib/firebase.js'
import { useConteudo } from '../../lib/conteudo.jsx'
import { paginas as listaDePaginas, paginasPadrao } from '../../data/paginasPadrao.js'
import { registo, tiposAcrescentaveis } from '../../seccoes/registo.jsx'
import CampoFotografia from './CampoFotografia.jsx'
import { useConfirmar } from '../../components/Confirmacao.jsx'

const db = getFirestore(app)

/** Identificador estável, para o React e para a reordenação. */
function novoId(tipo) {
  return `${tipo}-${Math.random().toString(36).slice(2, 8)}`
}

/** Formulário gerado a partir dos `campos` declarados pelo tipo. */
function Campos({ definicao, dados, aoMudar }) {
  return definicao.campos.map((campo) => {
    const valor = dados[campo.chave] ?? ''
    const muda = (v) => aoMudar({ ...dados, [campo.chave]: v })

    if (campo.tipo === 'fotografia') {
      return (
        <CampoFotografia
          key={campo.chave}
          etiqueta={campo.etiqueta}
          valor={valor}
          aoMudar={muda}
        />
      )
    }

    return (
      <label key={campo.chave} className="admin__campo">
        <span>
          {campo.etiqueta}
          {campo.ajuda && <em className="admin__campo-ajuda"> — {campo.ajuda}</em>}
        </span>

        {campo.tipo === 'textoLongo' || campo.tipo === 'listaDeFotografias' ? (
          <textarea
            rows={campo.tipo === 'listaDeFotografias' ? 5 : 3}
            value={valor}
            onChange={(e) => muda(e.target.value)}
            placeholder={campo.tipo === 'listaDeFotografias' ? 'https://…\nhttps://…' : undefined}
          />
        ) : campo.tipo === 'escolha' ? (
          <select value={valor} onChange={(e) => muda(e.target.value)}>
            {campo.opcoes.map(([v, etiqueta]) => (
              <option key={v} value={v}>
                {etiqueta}
              </option>
            ))}
          </select>
        ) : campo.tipo === 'numero' ? (
          <input
            type="number"
            min={campo.min}
            max={campo.max}
            step={campo.passo}
            value={valor}
            onChange={(e) => muda(Number(e.target.value))}
          />
        ) : campo.tipo === 'booleano' ? (
          <input
            type="checkbox"
            checked={valor !== false}
            onChange={(e) => muda(e.target.checked)}
          />
        ) : (
          <input type="text" value={valor} onChange={(e) => muda(e.target.value)} />
        )}
      </label>
    )
  })
}

function EscolherTipo({ aoEscolher, aoCancelar }) {
  return (
    <div className="admin__tipos">
      {tiposAcrescentaveis.map((t) => (
        <button key={t.id} type="button" className="admin__tipo" onClick={() => aoEscolher(t.id)}>
          <strong>{t.nome}</strong>
          <span>{t.descricao}</span>
        </button>
      ))}
      <button type="button" className="admin__btn admin__btn--claro" onClick={aoCancelar}>
        Cancelar
      </button>
    </div>
  )
}

export default function Layout() {
  const confirmar = useConfirmar()
  const { paginas } = useConteudo()
  const [pagina, setPagina] = useState('inicio')
  const [rascunho, setRascunho] = useState(null) // null = a mostrar o que está gravado
  const [aEditar, setAEditar] = useState(null)
  const [aEscolher, setAEscolher] = useState(false)
  const [estado, setEstado] = useState('idle')

  const seccoes = rascunho?.[pagina] ?? paginas[pagina] ?? []
  const porGravar = rascunho !== null

  /** Mexe na lista da página atual, mantendo as outras como estão. */
  function actualizar(nova) {
    setRascunho({ ...(rascunho ?? paginas), [pagina]: nova })
  }

  function mover(i, direcao) {
    const nova = [...seccoes]
    const destino = i + direcao
    if (destino < 0 || destino >= nova.length) return
    ;[nova[i], nova[destino]] = [nova[destino], nova[i]]
    actualizar(nova)
  }

  function alternarVisibilidade(i) {
    const nova = [...seccoes]
    nova[i] = { ...nova[i], escondida: !nova[i].escondida }
    actualizar(nova)
  }

  function acrescentar(tipo) {
    const def = registo[tipo]
    actualizar([...seccoes, { id: novoId(tipo), tipo, ...def.omissao }])
    setAEscolher(false)
  }

  async function remover(i) {
    const def = registo[seccoes[i]?.tipo]
    const ok = await confirmar({
      titulo: 'Remover esta secção?',
      mensagem: 'Só sai do site quando gravares. Até lá podes descartar as alterações.',
      detalhe: def?.nome || seccoes[i]?.tipo,
      textoConfirmar: 'Remover secção',
    })
    if (!ok) return
    actualizar(seccoes.filter((_, k) => k !== i))
  }

  function editar(i, dados) {
    const nova = [...seccoes]
    nova[i] = dados
    actualizar(nova)
  }

  async function gravar() {
    setEstado('a-gravar')
    try {
      await setDoc(doc(db, 'conteudo', 'site'), { paginas: rascunho }, { merge: true })
      setRascunho(null)
      setEstado('ok')
    } catch (e) {
      setEstado('erro')
      console.error(e)
    }
  }

  return (
    <section className="admin__seccao">
      <div className="admin__seccao-topo">
        <h2>Secções e ordem das páginas</h2>
        {!aEscolher && (
          <button type="button" className="admin__btn" onClick={() => setAEscolher(true)}>
            Acrescentar secção
          </button>
        )}
      </div>

      <p className="admin__ajuda">
        As secções desenhadas a partir do rascunho podem ser reordenadas e escondidas, mas não têm
        campos de forma — o texto delas edita-se no separador «Textos». As que acrescentares aqui
        são configuráveis por inteiro.
      </p>

      <nav className="admin__separadores" aria-label="Página a editar">
        {listaDePaginas.map((p) => (
          <button
            key={p.id}
            type="button"
            className={'admin__separador' + (pagina === p.id ? ' is-ativo' : '')}
            onClick={() => setPagina(p.id)}
          >
            {p.nome}
          </button>
        ))}
      </nav>

      {aEscolher && <EscolherTipo aoEscolher={acrescentar} aoCancelar={() => setAEscolher(false)} />}

      <ul className="admin__lista">
        {seccoes.map((s, i) => {
          const def = registo[s.tipo]
          if (!def) {
            return (
              <li key={s.id} className="admin__lista-item">
                <div className="admin__lista-texto">
                  <strong>Tipo desconhecido: {s.tipo}</strong>
                  <p>Esta secção não é mostrada no site.</p>
                </div>
                <div className="admin__acoes">
                  <button
                    type="button"
                    className="admin__btn admin__btn--perigo"
                    onClick={() => remover(i)}
                  >
                    Remover
                  </button>
                </div>
              </li>
            )
          }

          return (
            <li
              key={s.id}
              className={'admin__lista-item' + (s.escondida ? ' is-escondida' : '')}
            >
              <div className="admin__lista-texto">
                <strong>{def.nome}</strong>
                {def.nativo && <em className="admin__etiqueta">do rascunho</em>}
                {s.escondida && <em className="admin__etiqueta">escondida</em>}
                {s.titulo && <p>{s.titulo}</p>}

                {aEditar === s.id && !def.nativo && (
                  <div className="admin__form">
                    <Campos definicao={def} dados={s} aoMudar={(d) => editar(i, d)} />
                    <div className="admin__form-acoes">
                      <button
                        type="button"
                        className="admin__btn admin__btn--claro"
                        onClick={() => setAEditar(null)}
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="admin__acoes">
                <button
                  type="button"
                  className="admin__btn admin__btn--claro"
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  aria-label="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="admin__btn admin__btn--claro"
                  onClick={() => mover(i, 1)}
                  disabled={i === seccoes.length - 1}
                  aria-label="Descer"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="admin__btn admin__btn--claro"
                  onClick={() => alternarVisibilidade(i)}
                >
                  {s.escondida ? 'Mostrar' : 'Esconder'}
                </button>
                {!def.nativo && (
                  <>
                    <button
                      type="button"
                      className="admin__btn admin__btn--claro"
                      onClick={() => setAEditar(aEditar === s.id ? null : s.id)}
                    >
                      {aEditar === s.id ? 'Fechar' : 'Editar'}
                    </button>
                    <button
                      type="button"
                      className="admin__btn admin__btn--perigo"
                      onClick={() => remover(i)}
                    >
                      Remover
                    </button>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="admin__barra-acoes">
        <button type="button" className="admin__btn" onClick={gravar} disabled={!porGravar || estado === 'a-gravar'}>
          {estado === 'a-gravar' ? 'A gravar…' : 'Gravar alterações'}
        </button>
        <button
          type="button"
          className="admin__btn admin__btn--claro"
          onClick={() => setRascunho({ ...(rascunho ?? paginas), [pagina]: paginasPadrao[pagina] })}
        >
          Repor o original desta página
        </button>
        {porGravar && <span className="admin__aviso">Há alterações por gravar.</span>}
        {estado === 'ok' && !porGravar && <span className="admin__ok">Gravado.</span>}
        {estado === 'erro' && <span className="admin__erro">Não foi possível gravar.</span>}
      </div>
    </section>
  )
}
