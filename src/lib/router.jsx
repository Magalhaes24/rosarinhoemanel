import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { BASE } from './caminho.js'

/**
 * Encaminhador mínimo, feito à medida das quatro rotas deste site.
 *
 * Substitui o react-router, que trazia avisos de segurança sem correção
 * disponível em nenhum dos seus ramos (open redirect via `<Link>` no ramo 6,
 * CSRF em modo RSC no ramo 7). Nenhum deles era explorável aqui, mas uma
 * dependência a menos é uma superfície de ataque a menos — e este site usava
 * três funções da biblioteca.
 *
 * A defesa contra open redirect está em `navegar()`: qualquer destino é
 * resolvido com `new URL` e recusado se sair da origem do site. Isto apanha
 * também os truques com barras invertidas (`\\evil.com`), porque o browser
 * normaliza-as antes de nós vermos o resultado.
 */

const Contexto = createContext(null)

/**
 * As rotas do site (`/noivos`) são escritas sem o prefixo de instalação. Estas
 * duas funções traduzem entre isso e o endereço real do browser, que em
 * GitHub Pages leva `/rosarinhoemanel` à frente.
 */
function semBase(pathname) {
  if (BASE && pathname.startsWith(BASE)) return pathname.slice(BASE.length) || '/'
  return pathname
}

function comBase(destino) {
  return BASE + destino
}

function lerLocalizacao() {
  return {
    pathname: semBase(window.location.pathname),
    hash: window.location.hash,
    search: window.location.search,
  }
}

export function Router({ children }) {
  const [local, setLocal] = useState(lerLocalizacao)

  useEffect(() => {
    const aoVoltar = () => setLocal(lerLocalizacao())
    window.addEventListener('popstate', aoVoltar)
    return () => window.removeEventListener('popstate', aoVoltar)
  }, [])

  const navegar = useCallback((destino, { substituir = false } = {}) => {
    const url = new URL(comBase(destino), window.location.origin)

    // Nunca navega para fora do site através desta função.
    if (url.origin !== window.location.origin) return

    const caminho = url.pathname + url.search + url.hash
    window.history[substituir ? 'replaceState' : 'pushState']({}, '', caminho)
    setLocal(lerLocalizacao())
  }, [])

  const valor = useMemo(() => ({ ...local, navegar }), [local, navegar])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

function useRouter() {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('Falta o <Router> à volta da aplicação.')
  return ctx
}

export function useLocation() {
  const { pathname, hash, search } = useRouter()
  return { pathname, hash, search }
}

export function useNavigate() {
  return useRouter().navegar
}

/** Marcador declarativo — quem lê as props é o <Routes>. */
export function Route() {
  return null
}

export function Routes({ children }) {
  const { pathname } = useRouter()
  const rotas = []

  // `children` pode trazer expressões e fragmentos pelo meio.
  const juntar = (nos) => {
    for (const no of Array.isArray(nos) ? nos : [nos]) {
      if (!no) continue
      if (Array.isArray(no)) juntar(no)
      else if (no.props?.path) rotas.push(no.props)
    }
  }
  juntar(children)

  const exata = rotas.find((r) => r.path === pathname)
  if (exata) return exata.element

  const fallback = rotas.find((r) => r.path === '*')
  return fallback ? fallback.element : null
}

/** Deixa o browser tratar do clique quando o utilizador o pediu. */
function cliqueNormal(e) {
  return (
    e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.defaultPrevented
  )
}

export function Link({ to, className, children, onClick, ...resto }) {
  const navegar = useNavigate()

  function aoClicar(e) {
    onClick?.(e)
    if (!cliqueNormal(e)) return
    e.preventDefault()
    navegar(to)
  }

  // O href leva o prefixo para o clique do meio e o "abrir em novo separador"
  // continuarem a funcionar.
  return (
    <a href={comBase(to)} className={className} onClick={aoClicar} {...resto}>
      {children}
    </a>
  )
}

export function NavLink({ to, end = false, className, children, onClick, ...resto }) {
  const { pathname } = useLocation()
  const navegar = useNavigate()

  const alvo = to.split('#')[0].split('?')[0]
  const ativo = end
    ? pathname === alvo
    : pathname === alvo || pathname.startsWith(alvo.endsWith('/') ? alvo : alvo + '/')

  function aoClicar(e) {
    onClick?.(e)
    if (!cliqueNormal(e)) return
    e.preventDefault()
    navegar(to)
  }

  return (
    <a
      href={comBase(to)}
      className={typeof className === 'function' ? className({ isActive: ativo }) : className}
      aria-current={ativo ? 'page' : undefined}
      onClick={aoClicar}
      {...resto}
    >
      {children}
    </a>
  )
}
