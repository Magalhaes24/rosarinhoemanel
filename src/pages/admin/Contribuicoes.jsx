import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { app } from '../../lib/firebase.js'
import { useConfirmar } from '../../components/Confirmacao.jsx'
import { useConteudo, resolverImagem } from '../../lib/conteudo.jsx'
import { euros } from '../../components/OferecerPresente.jsx'
import {
  ID_LUA,
  agruparOfertas,
  estadoDoPresente,
  valorDaOferta,
} from '../../lib/contribuicoes.js'

const db = getFirestore(app)

function dataPt(ts) {
  if (!ts?.toDate) return '—'
  return ts.toDate().toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })
}

/** Escuta uma coleção pela ordem de chegada, a mais recente primeiro. */
function useColecao(nome) {
  const [itens, setItens] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    return onSnapshot(
      query(collection(db, nome), orderBy('criadoEm', 'desc')),
      (snap) => {
        setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setErro('')
      },
      (e) =>
        setErro(
          e.code === 'permission-denied'
            ? 'Sem permissão para ler. Falta publicar as regras: npm run regras'
            : e.message
        )
    )
  }, [nome])

  return { itens, erro }
}

/** Uma pessoa que ofereceu, com o nome e a mensagem editáveis no sítio. */
function Oferta({ oferta }) {
  const confirmar = useConfirmar()
  const [aEditar, setAEditar] = useState(false)
  const [rascunho, setRascunho] = useState(oferta)
  const [aGravar, setAGravar] = useState(false)
  const [erro, setErro] = useState('')

  async function gravar() {
    setAGravar(true)
    setErro('')
    try {
      await updateDoc(doc(db, 'presentes', oferta.id), {
        nome: (rascunho.nome || '').trim().slice(0, 120),
        mensagem: (rascunho.mensagem || '').trim().slice(0, 1000),
      })
      setAEditar(false)
    } catch (e) {
      setErro(e.message)
    } finally {
      setAGravar(false)
    }
  }

  async function apagar() {
    const ok = await confirmar({
      titulo: 'Apagar este registo?',
      mensagem:
        'Some o nome e a mensagem de quem ofereceu. O valor continua contado na barra de '
        + 'progresso do presente — esse apaga-se na lista de contribuições, mais abaixo.',
      detalhe: `${oferta.nome} — ${oferta.presente}`,
      textoConfirmar: 'Apagar registo',
    })
    if (!ok) return
    try {
      await deleteDoc(doc(db, 'presentes', oferta.id))
    } catch (e) {
      setErro(e.message)
    }
  }

  if (aEditar) {
    return (
      <li className="oferta oferta--a-editar">
        <label className="admin__campo">
          <span>Nome</span>
          <input
            type="text"
            value={rascunho.nome || ''}
            onChange={(e) => setRascunho({ ...rascunho, nome: e.target.value })}
            maxLength={120}
          />
        </label>
        <label className="admin__campo">
          <span>Mensagem</span>
          <textarea
            value={rascunho.mensagem || ''}
            onChange={(e) => setRascunho({ ...rascunho, mensagem: e.target.value })}
            maxLength={1000}
            rows={2}
          />
        </label>
        <div className="admin__acoes">
          <button type="button" className="admin__btn" onClick={gravar} disabled={aGravar}>
            {aGravar ? 'A gravar…' : 'Gravar'}
          </button>
          <button
            type="button"
            className="admin__btn admin__btn--claro"
            onClick={() => {
              setRascunho(oferta)
              setAEditar(false)
            }}
          >
            Cancelar
          </button>
        </div>
        {erro && <p className="admin__erro">{erro}</p>}
      </li>
    )
  }

  return (
    <li className="oferta">
      <div className="oferta__quem">
        <strong>{oferta.nome}</strong>
        <span className="oferta__quando">{dataPt(oferta.criadoEm)}</span>
        {oferta.mensagem && <p className="oferta__mensagem">«{oferta.mensagem}»</p>}
      </div>
      <div className="oferta__acoes">
        <span className="oferta__valor">{valorDaOferta(oferta.presente)}</span>
        <button
          type="button"
          className="admin__btn admin__btn--claro"
          onClick={() => setAEditar(true)}
        >
          Editar
        </button>
        <button type="button" className="admin__btn admin__btn--perigo" onClick={apagar}>
          Apagar
        </button>
      </div>
      {erro && <p className="admin__erro">{erro}</p>}
    </li>
  )
}

/** Um presente com o seu progresso e a lista de quem ofereceu. */
function CartaoContribuicao({ item, contribuido, ofertas, fotografias }) {
  const [aberto, setAberto] = useState(false)

  const meta = Number(item.preco) || 0
  const falta = Math.max(0, meta - contribuido)
  const pct = meta > 0 ? Math.min(100, Math.round((contribuido / meta) * 100)) : 0

  // Sem meta — a lua de mel — não há percentagem que faça sentido: o estado é
  // simplesmente quanto já lá está.
  const estado = estadoDoPresente(contribuido, meta)
  const ESTADOS = {
    aberto: ['Em aberto', 'Sem meta definida — recebe o que quiserem dar.'],
    completo: ['Completo', 'Este presente já atingiu ou ultrapassou a meta.'],
    meio: ['A meio', `Faltam ${euros(falta)} para completar este presente.`],
    inicio: ['A começar', `Faltam ${euros(falta)} para completar este presente.`],
  }
  const [etiqueta, explicacao] = ESTADOS[estado]

  const imagem = resolverImagem(item.imagem, fotografias)

  return (
    <article className={`contrib contrib--${estado}`}>
      <header className="contrib__topo">
        <div className="contrib__fotografia">
          {imagem ? <img src={imagem} alt="" /> : <span aria-hidden="true" />}
        </div>
        <div>
          <h3>{item.nome}</h3>
          {item.descricao && <p className="contrib__descricao">{item.descricao}</p>}
        </div>
      </header>

      <div className="contrib__numeros">
        <div>
          <span className="contrib__etiqueta">Progresso</span>
          <strong>{meta > 0 ? `${pct}%` : '—'}</strong>
        </div>
        <div>
          <span className="contrib__etiqueta">Contribuído</span>
          <strong>{euros(contribuido)}</strong>
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
        {meta > 0 && <span>Meta: {euros(meta)}</span>}
        {meta > 0 && <span>Falta: {euros(falta)}</span>}
        <span>
          {ofertas.length} {ofertas.length === 1 ? 'pessoa' : 'pessoas'}
        </span>
      </div>

      {ofertas.length > 0 && (
        <>
          <button
            type="button"
            className="contrib__abrir"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
          >
            {aberto ? 'Esconder quem ofereceu' : 'Ver quem ofereceu'}
          </button>
          {aberto && (
            <ul className="contrib__ofertas">
              {ofertas.map((o) => (
                <Oferta key={o.id} oferta={o} />
              ))}
            </ul>
          )}
        </>
      )}
    </article>
  )
}

/**
 * O painel das contribuições.
 *
 * Junta os três lados da mesma coisa: a lista de presentes, quanto já foi
 * contribuído para cada um e quem ofereceu. A lua de mel entra como mais um
 * cartão, sem meta, porque é assim que funciona no site.
 */
export default function Contribuicoes() {
  const { presentesCasa, contribuido, fotografias, textos } = useConteudo()
  const ofertas = useColecao('presentes')
  const contribuicoes = useColecao('contribuicoes')
  const confirmar = useConfirmar()
  const [erro, setErro] = useState('')

  const nomeLua = textos?.['lua.titulo'] || 'Lua de mel'

  const porPresente = useMemo(() => agruparOfertas(ofertas.itens), [ofertas.itens])

  const itens = [
    ...(presentesCasa || []),
    { id: ID_LUA, nome: nomeLua, preco: 0, imagem: '', descricao: 'Contribuições livres.' },
  ]

  async function apagarContribuicao(c) {
    const ok = await confirmar({
      titulo: 'Apagar esta contribuição?',
      mensagem:
        'O valor sai da barra de progresso que os convidados veem. Usa-se quando alguém '
        + 'registou por engano e não chegou a transferir.',
      detalhe: `${c.presenteId} — ${euros(c.valor)}`,
      textoConfirmar: 'Apagar contribuição',
    })
    if (!ok) return
    try {
      await deleteDoc(doc(db, 'contribuicoes', c.id))
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <section className="admin__seccao">
      <div className="admin__seccao-topo">
        <h2>Contribuições</h2>
      </div>

      <p className="admin__ajuda">
        Cada cartão mostra quanto já foi oferecido e por quem. O nome e a mensagem editam-se
        aqui; o valor não se altera — se alguém registou por engano, apaga-se a contribuição na
        lista do fim, e a barra de progresso acerta sozinha.
      </p>

      {ofertas.erro && <p className="admin__erro">{ofertas.erro}</p>}
      {contribuicoes.erro && <p className="admin__erro">{contribuicoes.erro}</p>}
      {erro && <p className="admin__erro">{erro}</p>}

      {presentesCasa === null ? (
        <p className="admin__vazio">A carregar…</p>
      ) : (
        <div className="contrib__grelha">
          {itens.map((item) => (
            <CartaoContribuicao
              key={item.id}
              item={item}
              contribuido={contribuido[item.id] || 0}
              ofertas={porPresente[item.nome] || []}
              fotografias={fotografias}
            />
          ))}
        </div>
      )}

      <h3 className="admin__sub">Todas as contribuições</h3>
      <p className="admin__ajuda">
        A lista em bruto, pela ordem de chegada. Não guarda nomes — é o que alimenta as barras
        de progresso do site.
      </p>

      {contribuicoes.itens === null ? (
        <p className="admin__vazio">A carregar…</p>
      ) : contribuicoes.itens.length === 0 ? (
        <p className="admin__vazio">Ainda não há contribuições registadas.</p>
      ) : (
        <table className="admin__tabela">
          <thead>
            <tr>
              <th>Presente</th>
              <th>Valor</th>
              <th>Quando</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {contribuicoes.itens.map((c) => (
              <tr key={c.id}>
                <td>{c.presenteId === ID_LUA ? nomeLua : nomeDoId(c.presenteId, presentesCasa)}</td>
                <td>{euros(c.valor)}</td>
                <td>{dataPt(c.criadoEm)}</td>
                <td>
                  <button
                    type="button"
                    className="admin__btn admin__btn--perigo"
                    onClick={() => apagarContribuicao(c)}
                  >
                    Apagar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

/** O nome do presente a partir do id gravado na contribuição. */
function nomeDoId(id, presentes) {
  return (presentes || []).find((p) => p.id === id)?.nome || id
}
