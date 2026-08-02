import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { app } from '../../lib/firebase.js'
import { apagarFotografia } from '../../lib/armazenamento.js'
import CampoFoto from './CampoFoto.jsx'

const db = getFirestore(app)
const COLECAO = 'presentes-casa'

const VAZIO = { nome: '', descricao: '', preco: '', link: '', imagem: '', reservado: false }

function Formulario({ inicial, aoGravar, aoCancelar }) {
  const [item, setItem] = useState(inicial)
  const [aGravar, setAGravar] = useState(false)
  const [erro, setErro] = useState('')

  const campo = (k) => (e) => setItem({ ...item, [k]: e.target.value })

  async function submeter(e) {
    e.preventDefault()
    if (!item.nome.trim()) {
      setErro('O nome é obrigatório.')
      return
    }
    if (item.link && !/^https?:\/\//i.test(item.link)) {
      setErro('A ligação tem de começar por http:// ou https://')
      return
    }
    setAGravar(true)
    setErro('')
    try {
      await aoGravar(item)
    } catch (err) {
      setErro(err.message)
    } finally {
      setAGravar(false)
    }
  }

  return (
    <form className="admin__form" onSubmit={submeter}>
      <label className="admin__campo">
        <span>Nome</span>
        <input type="text" value={item.nome} onChange={campo('nome')} maxLength={160} required />
      </label>

      <label className="admin__campo">
        <span>Descrição</span>
        <textarea value={item.descricao} onChange={campo('descricao')} maxLength={1000} rows={3} />
      </label>

      <div className="admin__form-linha">
        <label className="admin__campo">
          <span>Preço (€)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={item.preco}
            onChange={campo('preco')}
          />
        </label>

        <label className="admin__campo">
          <span>Ligação para a loja</span>
          <input
            type="url"
            value={item.link}
            onChange={campo('link')}
            maxLength={600}
            placeholder="https://…"
          />
        </label>
      </div>

      <CampoFoto valor={item.imagem} aoMudar={(url) => setItem({ ...item, imagem: url })} />

      <label className="admin__caixa-check">
        <input
          type="checkbox"
          checked={!!item.reservado}
          onChange={(e) => setItem({ ...item, reservado: e.target.checked })}
        />
        <span>Já foi oferecido</span>
      </label>

      {erro && <p className="admin__erro">{erro}</p>}

      <div className="admin__form-acoes">
        <button type="submit" className="admin__btn" disabled={aGravar}>
          {aGravar ? 'A gravar…' : 'Gravar'}
        </button>
        <button type="button" className="admin__btn admin__btn--claro" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function Loja() {
  const [itens, setItens] = useState(null)
  const [erro, setErro] = useState('')
  const [aEditar, setAEditar] = useState(null) // null | 'novo' | id

  useEffect(() => {
    const q = query(collection(db, COLECAO), orderBy('ordem', 'asc'))
    return onSnapshot(
      q,
      (snap) => setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => setErro(e.message)
    )
  }, [])

  async function criar(item) {
    const ordem = (itens?.length ? Math.max(...itens.map((i) => i.ordem ?? 0)) : 0) + 10
    await addDoc(collection(db, COLECAO), { ...item, ordem, criadoEm: serverTimestamp() })
    setAEditar(null)
  }

  async function guardar(id, item) {
    const { id: _ignorar, criadoEm, ...dados } = item
    await updateDoc(doc(db, COLECAO, id), dados)
    setAEditar(null)
  }

  async function apagar(item) {
    if (!confirm(`Apagar "${item.nome}" da lista?`)) return
    if (item.imagem) await apagarFotografia(item.imagem)
    await deleteDoc(doc(db, COLECAO, item.id))
  }

  /** Troca a ordem com o vizinho, para o admin poder reordenar a lista. */
  async function mover(indice, direcao) {
    const outro = itens[indice + direcao]
    const atual = itens[indice]
    if (!outro) return
    await Promise.all([
      updateDoc(doc(db, COLECAO, atual.id), { ordem: outro.ordem ?? 0 }),
      updateDoc(doc(db, COLECAO, outro.id), { ordem: atual.ordem ?? 0 }),
    ])
  }

  return (
    <section className="admin__seccao">
      <div className="admin__seccao-topo">
        <h2>Lista de presentes «Para a casa»</h2>
        {aEditar !== 'novo' && (
          <button type="button" className="admin__btn" onClick={() => setAEditar('novo')}>
            Acrescentar presente
          </button>
        )}
      </div>

      <p className="admin__ajuda">
        Estes itens aparecem em grelha na página «O que dar?», na secção «Para a casa». A ordem
        aqui é a ordem no site.
      </p>

      {erro && <p className="admin__erro">{erro}</p>}

      {aEditar === 'novo' && (
        <Formulario inicial={VAZIO} aoGravar={criar} aoCancelar={() => setAEditar(null)} />
      )}

      {!itens && <p className="admin__vazio">A carregar…</p>}
      {itens?.length === 0 && aEditar !== 'novo' && (
        <p className="admin__vazio">Ainda não há presentes na lista.</p>
      )}

      <ul className="admin__lista">
        {itens?.map((item, i) =>
          aEditar === item.id ? (
            <li key={item.id} className="admin__lista-item">
              <Formulario
                inicial={item}
                aoGravar={(dados) => guardar(item.id, dados)}
                aoCancelar={() => setAEditar(null)}
              />
            </li>
          ) : (
            <li key={item.id} className="admin__lista-item">
              <div className="admin__mini-foto">
                {item.imagem ? <img src={item.imagem} alt="" /> : <span>sem foto</span>}
              </div>

              <div className="admin__lista-texto">
                <strong>{item.nome}</strong>
                {item.reservado && <em className="admin__etiqueta">já oferecido</em>}
                {item.descricao && <p>{item.descricao}</p>}
                {item.preco !== '' && item.preco != null && <p>{item.preco} €</p>}
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
                  disabled={i === itens.length - 1}
                  aria-label="Descer"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="admin__btn admin__btn--claro"
                  onClick={() => setAEditar(item.id)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="admin__btn admin__btn--perigo"
                  onClick={() => apagar(item)}
                >
                  Apagar
                </button>
              </div>
            </li>
          )
        )}
      </ul>
    </section>
  )
}
