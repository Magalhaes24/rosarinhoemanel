import { useEffect, useState } from 'react'
import { Link } from '../lib/router.jsx'
import { entrar, sair, observarSessao, ehAdmin, mensagemDeErro } from '../lib/auth.js'
import Respostas from './admin/Respostas.jsx'
import Contribuicoes from './admin/Contribuicoes.jsx'
import Resumo, { useNumeros } from './admin/Resumo.jsx'
import { euros } from '../components/OferecerPresente.jsx'
import Loja from './admin/Loja.jsx'
import Aparencia from './admin/Aparencia.jsx'
import Layout from './admin/Layout.jsx'
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
      setErro(mensagemDeErro(err))
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
  { id: 'contribuicoes', nome: 'Contribuições', conta: 'contribuicoes' },
  { id: 'loja', nome: 'Presentes', conta: 'presentes' },
  { id: 'respostas', nome: 'Presenças', conta: 'rsvps' },
  { id: 'layout', nome: 'Secções' },
  { id: 'textos', nome: 'Textos' },
  { id: 'tema', nome: 'Aparência' },
]

/** A linha que acompanha os separadores, escrita para o que está à frente. */
function resumoDoSeparador(separador, numeros) {
  const { contagens } = numeros
  if (separador === 'contribuicoes') {
    return `${contagens.contribuicoes} ${
      contagens.contribuicoes === 1 ? 'contribuição' : 'contribuições'
    } · ${euros(numeros.total)} recebidos`
  }
  if (separador === 'loja') {
    return `${contagens.presentes} ${
      contagens.presentes === 1 ? 'presente na lista' : 'presentes na lista'
    }`
  }
  if (separador === 'respostas') {
    return `${contagens.rsvps} ${contagens.rsvps === 1 ? 'resposta' : 'respostas'} · ${
      numeros.vem
    } confirmam presença`
  }
  return ''
}

function Painel({ utilizador }) {
  const [separador, setSeparador] = useState('contribuicoes')
  const numeros = useNumeros()

  return (
    <div className="admin__painel">
      <header className="admin__topo">
        <div>
          <p className="admin__sobrescrito">Painel de administração</p>
          <h1 className="admin__titulo">Administração</h1>
          <p className="admin__lead">
            Acompanha as contribuições, gere a lista de presentes e edita o site sem sair
            desta página.
          </p>
        </div>
        <div className="admin__sessao">
          <span className="admin__email">{utilizador.email}</span>
          <Link to="/" className="admin__btn admin__btn--claro">
            Editar o site
          </Link>
          <button className="admin__btn admin__btn--claro" type="button" onClick={sair}>
            Sair
          </button>
        </div>
      </header>

      <Resumo numeros={numeros} />

      {/* A faixa dos separadores: as contas de cada um à esquerda e, à direita,
          uma linha que resume o que se está a ver. */}
      <div className="admin__faixa">
        <nav className="admin__separadores" aria-label="Secções da administração">
          {SEPARADORES.map((s) => {
            const n = s.conta ? numeros.contagens[s.conta] : null
            return (
              <button
                key={s.id}
                type="button"
                className={'admin__separador' + (separador === s.id ? ' is-ativo' : '')}
                onClick={() => setSeparador(s.id)}
                aria-current={separador === s.id ? 'page' : undefined}
              >
                {s.nome}
                {n !== null && n !== undefined && <span className="admin__conta">{n}</span>}
              </button>
            )
          })}
        </nav>

        <div className="admin__faixa-direita">
          <p className="admin__faixa-resumo">{resumoDoSeparador(separador, numeros)}</p>
          {/* Onde os separadores penduram os seus botões, através do
              `AccoesDaFaixa`. Fica sempre desenhado para o portal ter destino. */}
          <div className="admin__faixa-accoes" id="admin-faixa-accoes" />
        </div>
      </div>

      {separador === 'contribuicoes' && <Contribuicoes />}
      {separador === 'respostas' && <Respostas />}
      {separador === 'loja' && <Loja />}
      {separador === 'layout' && <Layout />}
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
