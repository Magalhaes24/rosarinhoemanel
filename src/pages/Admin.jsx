import { useEffect, useState } from 'react'
import { entrar, sair, observarSessao, ehAdmin } from '../lib/auth.js'
import Respostas from './admin/Respostas.jsx'
import Loja from './admin/Loja.jsx'
import Aparencia from './admin/Aparencia.jsx'
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

const SEPARADORES = [
  { id: 'respostas', nome: 'Respostas' },
  { id: 'loja', nome: 'Lista de presentes' },
  { id: 'textos', nome: 'Textos' },
  { id: 'tema', nome: 'Aparência' },
]

function Painel({ utilizador }) {
  const [separador, setSeparador] = useState('respostas')

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

      <nav className="admin__separadores" aria-label="Secções da administração">
        {SEPARADORES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={'admin__separador' + (separador === s.id ? ' is-ativo' : '')}
            onClick={() => setSeparador(s.id)}
            aria-current={separador === s.id ? 'page' : undefined}
          >
            {s.nome}
          </button>
        ))}
      </nav>

      {separador === 'respostas' && <Respostas />}
      {separador === 'loja' && <Loja />}
      {separador === 'textos' && <Aparencia separador="textos" />}
      {separador === 'tema' && <Aparencia separador="tema" />}
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
    <main className="admin">
      {ehAdmin(utilizador) ? <Painel utilizador={utilizador} /> : <Login />}
    </main>
  )
}
