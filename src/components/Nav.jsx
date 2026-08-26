import { useEffect, useState } from 'react'
import { NavLink, useLocation } from '../lib/router.jsx'
import { caminho } from '../lib/caminho.js'
import { useTexto } from '../lib/conteudo.jsx'
import './Nav.css'

const links = [
  { to: '/', chave: 'nav.inicio' },
  { to: '/noivos', chave: 'nav.noivos' },
  { to: '/presentes', chave: 'nav.presentes' },
  { to: '/onde-ficar', chave: 'nav.hoteis' },
]

/**
 * A barra do topo.
 *
 * No telemóvel os quatro rótulos são frases inteiras — «Quem são os noivos?»,
 * «Onde ficar?» — e não cabem lado a lado sem ficarem ilegíveis. Aí a barra
 * fecha-se num botão de menu e os links passam a um painel por baixo dela.
 * No computador continua tudo à vista, como sempre esteve.
 */
export default function Nav() {
  const t = useTexto()
  const { pathname } = useLocation()
  const [deslocada, setDeslocada] = useState(false)
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    const aoDeslizar = () => setDeslocada(window.scrollY > 8)
    aoDeslizar()
    window.addEventListener('scroll', aoDeslizar, { passive: true })
    return () => window.removeEventListener('scroll', aoDeslizar)
  }, [])

  // Mudar de página fecha o menu: sem isto ficava aberto por cima da página
  // nova, que é o mesmo que não ter fechado.
  useEffect(() => setAberto(false), [pathname])

  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e) => e.key === 'Escape' && setAberto(false)
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aberto])

  return (
    <header className={'nav' + (deslocada ? ' is-deslocada' : '') + (aberto ? ' is-aberta' : '')}>
      <NavLink to="/" className="nav__logo" aria-label="Rosarinho e Manel — início">
        <img src={caminho('/images/logo.png')} alt="" />
      </NavLink>

      <button
        type="button"
        className="nav__hamburger"
        aria-label={aberto ? 'Fechar o menu' : 'Abrir o menu'}
        aria-expanded={aberto}
        aria-controls="nav-links"
        onClick={() => setAberto((v) => !v)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <nav id="nav-links" className="nav__links">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => 'nav__link' + (isActive ? ' is-active' : '')}
            onClick={() => setAberto(false)}
          >
            {t(l.chave)}
          </NavLink>
        ))}
      </nav>

      {/* Carregar fora fecha o menu. Fica por baixo do painel e por cima da
          página, e só existe enquanto o menu está aberto. */}
      {aberto && (
        <button
          type="button"
          className="nav__fundo"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => setAberto(false)}
        />
      )}
    </header>
  )
}
