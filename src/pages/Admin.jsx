import { useEffect, useState } from 'react'
import { collection, getFirestore, onSnapshot, orderBy, query } from 'firebase/firestore'
import { app } from '../lib/firebase.js'
import { entrar, sair, observarSessao, ehAdmin } from '../lib/auth.js'
import './Admin.css'

function Login() {
  const [email, setEmail] = useState('')
  const [palavraPasse, setPalavraPasse] = useState('')
  const [estado, setEstado] = useState('idle')
  const [erro, setErro] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setEstado('a-entrar')
    setErro('')
    try {
      await entrar(email, palavraPasse)
    } catch (err) {
      // Mensagem sempre igual: não revela se o email existe.
      setErro('Credenciais inválidas.')
      setEstado('idle')
      console.error(err.code || err.message)
    }
  }

  return (
    <div className="admin__login">
      <form className="admin__caixa" onSubmit={onSubmit}>
        <h1 className="admin__titulo">Administração</h1>

        <label className="admin__campo">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="admin__campo">
          <span>Palavra-passe</span>
          <input
            type="password"
            value={palavraPasse}
            onChange={(e) => setPalavraPasse(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button className="admin__botao" type="submit" disabled={estado === 'a-entrar'}>
          {estado === 'a-entrar' ? 'A entrar…' : 'Entrar'}
        </button>

        {erro && <p className="admin__erro">{erro}</p>}
      </form>
    </div>
  )
}

const db = getFirestore(app)

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

function dataPt(ts) {
  if (!ts?.toDate) return '—'
  return ts.toDate().toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })
}

function Painel({ utilizador }) {
  const rsvps = useColecao('rsvps')
  const presentes = useColecao('presentes')

  const vem = rsvps.itens?.filter((r) => r.presenca === 'sim').length ?? 0
  const naoVem = rsvps.itens?.filter((r) => r.presenca === 'nao').length ?? 0

  return (
    <div className="admin__painel">
      <header className="admin__topo">
        <h1 className="admin__titulo">Administração</h1>
        <div className="admin__sessao">
          <span>{utilizador.email}</span>
          <button className="admin__sair" type="button" onClick={sair}>
            Sair
          </button>
        </div>
      </header>

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

      <section className="admin__seccao">
        <h2>Confirmações de presença</h2>
        {rsvps.erro && <p className="admin__erro">{rsvps.erro}</p>}
        {!rsvps.itens && !rsvps.erro && <p className="admin__vazio">A carregar…</p>}
        {rsvps.itens?.length === 0 && <p className="admin__vazio">Ainda sem respostas.</p>}
        {rsvps.itens?.length > 0 && (
          <div className="admin__tabela-scroll">
            <table className="admin__tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Presença</th>
                  <th>Quando</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.itens.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nome}</td>
                    <td>{r.presenca === 'sim' ? 'Vem' : 'Não pode'}</td>
                    <td>{dataPt(r.criadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin__seccao">
        <h2>Presentes</h2>
        {presentes.erro && <p className="admin__erro">{presentes.erro}</p>}
        {!presentes.itens && !presentes.erro && <p className="admin__vazio">A carregar…</p>}
        {presentes.itens?.length === 0 && <p className="admin__vazio">Ainda sem presentes.</p>}
        {presentes.itens?.length > 0 && (
          <div className="admin__tabela-scroll">
            <table className="admin__tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Presente</th>
                  <th>Mensagem</th>
                  <th>Quando</th>
                </tr>
              </thead>
              <tbody>
                {presentes.itens.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nome}</td>
                    <td>{p.presente}</td>
                    <td>{p.mensagem}</td>
                    <td>{dataPt(p.criadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default function Admin() {
  const [utilizador, setUtilizador] = useState(undefined) // undefined = ainda a verificar

  useEffect(() => observarSessao(setUtilizador), [])

  if (utilizador === undefined) {
    return (
      <main className="admin">
        <p className="admin__vazio">A verificar sessão…</p>
      </main>
    )
  }

  return (
    <main className="admin">{ehAdmin(utilizador) ? <Painel utilizador={utilizador} /> : <Login />}</main>
  )
}
