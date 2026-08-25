import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { app } from '../../lib/firebase.js'
import { apagarFotografia } from '../../lib/fotografias.js'
import CampoFotografia from '../../components/CampoFotografia.jsx'
import { useConfirmar } from '../../components/Confirmacao.jsx'
import { useConteudo, resolverImagem } from '../../lib/conteudo.jsx'
import {
  presentesDoRascunho,
  porImportar,
  documentoDoPresente,
} from '../../data/presentesDoRascunho.js'

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

      <CampoFotografia valor={item.imagem} aoMudar={(url) => setItem({ ...item, imagem: url })} />

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
  const confirmar = useConfirmar()
  const { fotografias, contribuido } = useConteudo()
  const [itens, setItens] = useState(null)
  const [erro, setErro] = useState('')
  const [aEditar, setAEditar] = useState(null) // null | 'novo' | id
  const [aImportar, setAImportar] = useState(false)

  useEffect(() => {
    // Sem `orderBy`: o Firestore excluiria documentos sem o campo `ordem`,
    // e um presente criado à mão na consola desapareceria daqui sem aviso.
    return onSnapshot(
      collection(db, COLECAO),
      (snap) => {
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        lista.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        setItens(lista)
        setErro('')
      },
      (e) => {
        setItens([])
        setErro(
          e.code === 'permission-denied'
            ? 'Sem permissão para ler a lista. Falta publicar as regras: npm run regras'
            : e.message
        )
      }
    )
  }, [])

  async function criar(item) {
    const ordem = (itens?.length ? Math.max(...itens.map((i) => i.ordem ?? 0)) : 0) + 10
    try {
      await addDoc(collection(db, COLECAO), { ...item, ordem, criadoEm: serverTimestamp() })
    } catch (e) {
      throw new Error(
        e.code === 'permission-denied'
          ? 'Sem permissão para gravar. As regras ainda não foram publicadas — corre «npm run regras».'
          : e.message
      )
    }
    setAEditar(null)
  }

  async function guardar(id, item) {
    const { id: _ignorar, criadoEm, ...dados } = item
    await updateDoc(doc(db, COLECAO, id), dados)
    setAEditar(null)
  }

  async function apagar(item) {
    const ok = await confirmar({
      titulo: 'Apagar este presente?',
      mensagem: 'Deixa de aparecer na lista que os convidados veem.',
      detalhe: item.nome,
      textoConfirmar: 'Apagar presente',
    })
    if (!ok) return
    if (item.imagem) await apagarFotografia(item.imagem)
    await deleteDoc(doc(db, COLECAO, item.id))
  }

  /**
   * Cria de uma vez os presentes do rascunho que ainda não existirem.
   *
   * Compara pelo nome e preço, para se poder carregar duas vezes sem duplicar
   * nada — e para as três almofadas, que têm o mesmo nome, não se atropelarem.
   * Entram no fim da lista, pela ordem do rascunho.
   */
  async function importar() {
    const novos = porImportar(itens || [])

    if (novos.length === 0) {
      setErro('A lista do rascunho já está toda cá dentro — não há nada a acrescentar.')
      return
    }

    const ok = await confirmar({
      titulo: `Acrescentar ${novos.length} presentes?`,
      mensagem:
        'São os do rascunho em PDF, com as fotografias que vieram de lá. Os que já estão na '
        + 'lista ficam como estão, e podes editar ou apagar qualquer um a seguir.',
      detalhe: novos.map((i) => i.nome).join(', '),
      textoConfirmar: 'Acrescentar',
      destrutivo: false,
    })
    if (!ok) return

    setAImportar(true)
    setErro('')
    try {
      let ordem = (itens?.length ? Math.max(...itens.map((i) => i.ordem ?? 0)) : 0) + 10
      // Um a um e por ordem: em paralelo, as `ordem` saíam trocadas.
      for (const item of novos) {
        await addDoc(collection(db, COLECAO), {
          ...documentoDoPresente(item, ordem),
          criadoEm: serverTimestamp(),
        })
        ordem += 10
      }
    } catch (e) {
      setErro(
        e.code === 'permission-denied'
          ? 'Sem permissão para gravar. As regras ainda não foram publicadas — corre «npm run regras».'
          : e.message
      )
    } finally {
      setAImportar(false)
    }
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
          <>
            <button
              type="button"
              className="admin__btn admin__btn--claro"
              onClick={importar}
              disabled={!itens || aImportar}
            >
              {aImportar ? 'A importar…' : 'Importar a lista do rascunho'}
            </button>
            <button type="button" className="admin__btn" onClick={() => setAEditar('novo')}>
              Acrescentar presente
            </button>
          </>
        )}
      </div>

      <p className="admin__ajuda">
        Estes itens aparecem em grelha na página «O que dar?», na secção «Para a casa». A ordem
        aqui é a ordem no site. O «Importar a lista do rascunho» acrescenta os{' '}
        {presentesDoRascunho.length} presentes do PDF que ainda não estiverem cá — pode carregar-se
        mais do que uma vez sem duplicar nada.
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
              <div className="admin__mini-fotografia">
                {item.imagem ? (
                  <img src={resolverImagem(item.imagem, fotografias)} alt="" />
                ) : (
                  <span>sem fotografia</span>
                )}
              </div>

              <div className="admin__lista-texto">
                <strong>{item.nome}</strong>
                {item.reservado && <em className="admin__etiqueta">já oferecido</em>}
                {item.descricao && <p>{item.descricao}</p>}
                {item.preco !== '' && item.preco != null && <p>{item.preco} €</p>}
                {contribuido[item.id] > 0 && (
                  <p className="admin__contribuido">
                    Já ofereceram {contribuido[item.id]} €
                    {Number(item.preco) > 0 && ` de ${item.preco} €`}. Quem ofereceu está em
                    «Presentes».
                  </p>
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
