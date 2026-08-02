import { useEffect, useState } from 'react'
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

const db = getFirestore(app)

function dataPt(ts) {
  if (!ts?.toDate) return '—'
  return ts.toDate().toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })
}

function useColecao(nome) {
  const [itens, setItens] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const q = query(collection(db, nome), orderBy('criadoEm', 'desc'))
    return onSnapshot(
      q,
      (snap) => setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => setErro(e.message)
    )
  }, [nome])

  return { itens, erro }
}

/** Uma linha que alterna entre leitura e edição. */
function Linha({ colecao, item, campos }) {
  const [aEditar, setAEditar] = useState(false)
  const [rascunho, setRascunho] = useState(item)
  const [aGravar, setAGravar] = useState(false)

  async function gravar() {
    setAGravar(true)
    try {
      const alteracoes = {}
      for (const c of campos) alteracoes[c.chave] = rascunho[c.chave] ?? ''
      await updateDoc(doc(db, colecao, item.id), alteracoes)
      setAEditar(false)
    } catch (e) {
      alert('Não foi possível gravar: ' + e.message)
    } finally {
      setAGravar(false)
    }
  }

  async function apagar() {
    if (!confirm(`Apagar a resposta de "${item.nome}"? Não há forma de a recuperar.`)) return
    try {
      await deleteDoc(doc(db, colecao, item.id))
    } catch (e) {
      alert('Não foi possível apagar: ' + e.message)
    }
  }

  if (!aEditar) {
    return (
      <tr>
        {campos.map((c) => (
          <td key={c.chave}>{c.mostrar ? c.mostrar(item[c.chave]) : item[c.chave]}</td>
        ))}
        <td>{dataPt(item.criadoEm)}</td>
        <td className="admin__acoes">
          <button
            type="button"
            className="admin__btn admin__btn--claro"
            onClick={() => {
              setRascunho(item)
              setAEditar(true)
            }}
          >
            Editar
          </button>
          <button type="button" className="admin__btn admin__btn--perigo" onClick={apagar}>
            Apagar
          </button>
        </td>
      </tr>
    )
  }

  return (
    <tr className="is-a-editar">
      {campos.map((c) => (
        <td key={c.chave}>
          {c.opcoes ? (
            <select
              value={rascunho[c.chave] ?? ''}
              onChange={(e) => setRascunho({ ...rascunho, [c.chave]: e.target.value })}
            >
              {c.opcoes.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={rascunho[c.chave] ?? ''}
              maxLength={c.max}
              onChange={(e) => setRascunho({ ...rascunho, [c.chave]: e.target.value })}
            />
          )}
        </td>
      ))}
      <td>{dataPt(item.criadoEm)}</td>
      <td className="admin__acoes">
        <button type="button" className="admin__btn" onClick={gravar} disabled={aGravar}>
          {aGravar ? 'A gravar…' : 'Gravar'}
        </button>
        <button
          type="button"
          className="admin__btn admin__btn--claro"
          onClick={() => setAEditar(false)}
        >
          Cancelar
        </button>
      </td>
    </tr>
  )
}

function Tabela({ titulo, colecao, campos, dados }) {
  return (
    <section className="admin__seccao">
      <h2>{titulo}</h2>
      {dados.erro && <p className="admin__erro">{dados.erro}</p>}
      {!dados.itens && !dados.erro && <p className="admin__vazio">A carregar…</p>}
      {dados.itens?.length === 0 && <p className="admin__vazio">Ainda sem respostas.</p>}
      {dados.itens?.length > 0 && (
        <div className="admin__tabela-scroll">
          <table className="admin__tabela">
            <thead>
              <tr>
                {campos.map((c) => (
                  <th key={c.chave}>{c.etiqueta}</th>
                ))}
                <th>Quando</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {dados.itens.map((item) => (
                <Linha key={item.id} colecao={colecao} item={item} campos={campos} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default function Respostas() {
  const rsvps = useColecao('rsvps')
  const presentes = useColecao('presentes')

  const vem = rsvps.itens?.filter((r) => r.presenca === 'sim').length ?? 0
  const naoVem = rsvps.itens?.filter((r) => r.presenca === 'nao').length ?? 0

  function exportarCsv() {
    const linhas = [['Nome', 'Presenca', 'Quando']]
    for (const r of rsvps.itens || []) {
      linhas.push([r.nome, r.presenca === 'sim' ? 'Vem' : 'Não pode', dataPt(r.criadoEm)])
    }
    // Aspas duplicadas: é assim que se escapa aspas em CSV.
    const csv = linhas
      .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'confirmacoes.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <section className="admin__resumo">
        <div className="admin__cartao">
          <strong>{rsvps.itens?.length ?? '—'}</strong>
          <span>respostas</span>
        </div>
        <div className="admin__cartao">
          <strong>{vem}</strong>
          <span>vêm</span>
        </div>
        <div className="admin__cartao">
          <strong>{naoVem}</strong>
          <span>não podem</span>
        </div>
        <div className="admin__cartao">
          <strong>{presentes.itens?.length ?? '—'}</strong>
          <span>presentes</span>
        </div>
      </section>

      {rsvps.itens?.length > 0 && (
        <p className="admin__barra-acoes">
          <button type="button" className="admin__btn admin__btn--claro" onClick={exportarCsv}>
            Exportar confirmações (CSV)
          </button>
        </p>
      )}

      <Tabela
        titulo="Confirmações de presença"
        colecao="rsvps"
        dados={rsvps}
        campos={[
          { chave: 'nome', etiqueta: 'Nome', max: 120 },
          {
            chave: 'presenca',
            etiqueta: 'Presença',
            mostrar: (v) => (v === 'sim' ? 'Vem' : 'Não pode'),
            opcoes: [
              { valor: 'sim', etiqueta: 'Vem' },
              { valor: 'nao', etiqueta: 'Não pode' },
            ],
          },
        ]}
      />

      <Tabela
        titulo="Presentes"
        colecao="presentes"
        dados={presentes}
        campos={[
          { chave: 'nome', etiqueta: 'Nome', max: 120 },
          { chave: 'presente', etiqueta: 'Presente', max: 200 },
          { chave: 'mensagem', etiqueta: 'Mensagem', max: 1000 },
        ]}
      />
    </>
  )
}
