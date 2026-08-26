import { useEffect, useRef, useState } from 'react'
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
import AccoesDaFaixa from './AccoesDaFaixa.jsx'
import { lerFicheiroDePresentes, MODELO_CSV } from '../../lib/importarPresentes.js'
import { estadoDoPresente } from '../../lib/contribuicoes.js'

const db = getFirestore(app)
const COLECAO = 'presentes-casa'

const VAZIO = { nome: '', descricao: '', preco: '', imagem: '', reservado: false }

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

/**
 * Um presente da lista, com o mesmo aspecto dos cartões de contribuição.
 *
 * Mostra as duas coisas ao mesmo tempo: o que o presente é — fotografia,
 * nome, descrição — e como vai a angariação. Antes eram linhas de lista, e
 * para saber quanto já lá estava era preciso saltar para outro separador.
 */
function CartaoPresente({
  item,
  contribuido,
  fotografias,
  primeiro,
  ultimo,
  aoMover,
  aoEditar,
  aoApagar,
}) {
  const meta = Number(item.preco) || 0
  const falta = Math.max(0, meta - contribuido)
  const pct = meta > 0 ? Math.min(100, Math.round((contribuido / meta) * 100)) : 0
  const estado = estadoDoPresente(contribuido, meta)

  const ESTADOS = {
    aberto: ['Sem meta', 'Este presente não tem preço — recebe o que quiserem dar.'],
    completo: ['Completo', 'Este presente já atingiu ou ultrapassou a meta.'],
    meio: ['A meio', `Faltam ${falta} € para completar este presente.`],
    inicio: ['A começar', `Faltam ${falta} € para completar este presente.`],
  }
  const [etiqueta, explicacao] = ESTADOS[estado]

  return (
    <article className={`contrib loja__cartao contrib--${estado}`}>
      <header className="contrib__topo">
        <div className="contrib__fotografia">
          {item.imagem ? (
            <img src={resolverImagem(item.imagem, fotografias)} alt="" />
          ) : (
            <span aria-hidden="true" />
          )}
        </div>
        <div>
          <h3>{item.nome}</h3>
          {item.descricao && <p className="contrib__descricao">{item.descricao}</p>}
          {item.reservado && <em className="admin__etiqueta">já oferecido</em>}
        </div>
      </header>

      <div className="loja__acoes">
        <button
          type="button"
          className="admin__btn admin__btn--claro"
          onClick={() => aoMover(-1)}
          disabled={primeiro}
          aria-label="Subir na lista"
        >
          ↑
        </button>
        <button
          type="button"
          className="admin__btn admin__btn--claro"
          onClick={() => aoMover(1)}
          disabled={ultimo}
          aria-label="Descer na lista"
        >
          ↓
        </button>
        <button type="button" className="admin__btn admin__btn--claro" onClick={aoEditar}>
          Editar
        </button>
        <button type="button" className="admin__btn admin__btn--perigo" onClick={aoApagar}>
          Apagar
        </button>
      </div>

      <div className="contrib__numeros">
        <div>
          <span className="contrib__etiqueta">Progresso</span>
          <strong>{meta > 0 ? `${pct}%` : '—'}</strong>
        </div>
        <div>
          <span className="contrib__etiqueta">Contribuído</span>
          <strong>{contribuido} €</strong>
        </div>
        <div className="contrib__estado">
          <span className="contrib__etiqueta">Estado</span>
          <strong>{etiqueta}</strong>
          <p>{explicacao}</p>
        </div>
      </div>

      {meta > 0 && (
        <div className="contrib__barra">
          <div style={{ width: `${pct}%` }} />
        </div>
      )}

      <div className="contrib__marcas">
        {meta > 0 && <span>Meta: {meta} €</span>}
        {meta > 0 && <span>Falta: {falta} €</span>}
      </div>
    </article>
  )
}

/**
 * A janela onde o formulário do presente se abre.
 *
 * Editar deixou de ser um cartão que incha no meio da grelha e empurra os
 * vizinhos: agora é uma janela por cima de tudo, com o resto da página a
 * escurecer. Fecha-se com Escape ou carregando fora, como qualquer diálogo.
 */
function JanelaDoPresente({ titulo, nome, aoFechar, children }) {
  useEffect(() => {
    const aoTeclar = (e) => e.key === 'Escape' && aoFechar()
    document.addEventListener('keydown', aoTeclar)
    // Com a janela aberta, a página por trás não deve deslizar.
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = antes
    }
  }, [aoFechar])

  return (
    <div
      className="janela"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onPointerDown={(e) => e.target === e.currentTarget && aoFechar()}
    >
      <div className="janela__caixa">
        <header className="janela__topo">
          <div>
            <p className="janela__sobrescrito">{titulo}</p>
            {nome && <h3 className="janela__nome">{nome}</h3>}
          </div>
          <button
            type="button"
            className="janela__fechar"
            onClick={aoFechar}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        {children}
      </div>
    </div>
  )
}

export default function Loja() {
  const confirmar = useConfirmar()
  const { fotografias, contribuido } = useConteudo()
  const [itens, setItens] = useState(null)
  const [erro, setErro] = useState('')
  const [aEditar, setAEditar] = useState(null) // null | 'novo' | id
  const [aImportar, setAImportar] = useState(false)
  const ficheiro = useRef(null)

  // O presente que está aberto na janela de edição, tal como está na lista.
  const emEdicao = itens?.find((i) => i.id === aEditar) || null

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
   * Acrescenta de uma vez os presentes de uma folha de Excel ou de um CSV.
   *
   * A folha precisa de uma coluna «nome» e de uma «preço»; «descrição» e
   * «imagem» são opcionais. As linhas sem nome ou com um preço que não se
   * perceba ficam de fora e são contadas no aviso — mais vale importar as
   * boas e dizer quais faltaram do que recusar a folha inteira.
   *
   * Não compara com o que já cá está: uma folha carregada duas vezes cria os
   * presentes duas vezes, e é por isso que a confirmação mostra os nomes todos
   * antes de gravar seja o que for.
   */
  async function importarFolha(evento) {
    const escolhido = evento.target.files?.[0]
    // Limpa já a escolha: sem isto, escolher o mesmo ficheiro outra vez a
    // seguir não dispararia o evento.
    evento.target.value = ''
    if (!escolhido) return

    setErro('')
    let lido
    try {
      lido = await lerFicheiroDePresentes(escolhido)
    } catch (e) {
      setErro(e.message)
      return
    }

    const { presentes, avisos } = lido
    if (presentes.length === 0) {
      setErro(
        'Não veio nenhum presente aproveitável desse ficheiro.'
          + (avisos.length ? ` ${avisos.join(' ')}` : '')
      )
      return
    }

    const ok = await confirmar({
      titulo: `Acrescentar ${presentes.length} presentes?`,
      mensagem:
        `Vêm de «${escolhido.name}» e entram no fim da lista. Os que já cá estão ficam como `
        + 'estão — se a folha repetir algum, ele fica lá duas vezes.'
        + (avisos.length ? ` ${avisos.length} linha(s) ficaram de fora.` : ''),
      detalhe: [...presentes.map((i) => i.nome), ...avisos].join(', '),
      textoConfirmar: 'Acrescentar',
      destrutivo: false,
    })
    if (!ok) return

    setAImportar(true)
    try {
      let ordem = (itens?.length ? Math.max(...itens.map((i) => i.ordem ?? 0)) : 0) + 10
      // Um a um e por ordem: em paralelo, as `ordem` saíam trocadas.
      for (const item of presentes) {
        await addDoc(collection(db, COLECAO), {
          ...item,
          reservado: false,
          ordem,
          criadoEm: serverTimestamp(),
        })
        ordem += 10
      }
      if (avisos.length) setErro(`Importado. Linhas de fora: ${avisos.join(' ')}`)
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

  /** O modelo da folha, para quem não sabe que colunas escrever. */
  function descarregarModelo() {
    const url = URL.createObjectURL(
      new Blob(['﻿' + MODELO_CSV], { type: 'text/csv;charset=utf-8' })
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'modelo-presentes.csv'
    a.click()
    URL.revokeObjectURL(url)
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
      </div>

      <input
        ref={ficheiro}
        type="file"
        accept=".xlsx,.xls,.xlsm,.csv,text/csv"
        hidden
        onChange={importarFolha}
      />

      {aEditar !== 'novo' && (
        <AccoesDaFaixa>
          <button
            type="button"
            className="admin__btn admin__btn--claro"
            onClick={() => ficheiro.current?.click()}
            disabled={!itens || aImportar}
          >
            {aImportar ? 'A importar…' : 'Importar Excel/CSV'}
          </button>
          <button type="button" className="admin__btn" onClick={() => setAEditar('novo')}>
            + Acrescentar presente
          </button>
        </AccoesDaFaixa>
      )}

      <p className="admin__ajuda">
        Estes itens aparecem em grelha na página «O que dar?», na secção «Para a casa». A ordem
        aqui é a ordem no site. O «Importar Excel/CSV» acrescenta de uma vez os presentes de uma
        folha — precisa de uma coluna «nome» e de uma «preço»; «descrição» e «imagem» (um
        endereço da fotografia) são opcionais.{' '}
        <button type="button" className="admin__ligacao" onClick={descarregarModelo}>
          Descarregar um modelo
        </button>
        .
      </p>

      {erro && <p className="admin__erro">{erro}</p>}

      {!itens && <p className="admin__vazio">A carregar…</p>}
      {itens?.length === 0 && aEditar !== 'novo' && (
        <p className="admin__vazio">Ainda não há presentes na lista.</p>
      )}

      <div className="loja__grelha">
        {itens?.map((item, i) => (
          <CartaoPresente
            key={item.id}
            item={item}
            contribuido={contribuido[item.id] || 0}
            fotografias={fotografias}
            primeiro={i === 0}
            ultimo={i === itens.length - 1}
            aoMover={(direcao) => mover(i, direcao)}
            aoEditar={() => setAEditar(item.id)}
            aoApagar={() => apagar(item)}
          />
        ))}
      </div>

      {aEditar === 'novo' && (
        <JanelaDoPresente titulo="Novo presente" aoFechar={() => setAEditar(null)}>
          <Formulario inicial={VAZIO} aoGravar={criar} aoCancelar={() => setAEditar(null)} />
        </JanelaDoPresente>
      )}

      {aEditar && aEditar !== 'novo' && emEdicao && (
        <JanelaDoPresente
          titulo="Editar presente"
          nome={emEdicao.nome}
          aoFechar={() => setAEditar(null)}
        >
          <Formulario
            inicial={emEdicao}
            aoGravar={(dados) => guardar(emEdicao.id, dados)}
            aoCancelar={() => setAEditar(null)}
          />
        </JanelaDoPresente>
      )}
    </section>
  )
}
