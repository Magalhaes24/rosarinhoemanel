import { useEffect, useState } from 'react'
import { NavLink } from '../lib/router.jsx'
import { caminho } from '../lib/caminho.js'
import { useTexto } from '../lib/conteudo.jsx'
import './Nav.css'

const links = [
  { to: '/', chave: 'nav.inicio' },
  { to: '/noivos', chave: 'nav.noivos' },
  { to: '/presentes', chave: 'nav.presentes' },
]

export default function Nav() {
  const t = useTexto()
  const [deslocada, setDeslocada] = useState(false)

  useEffect(() => {
    const aoDeslizar = () => setDeslocada(window.scrollY > 8)
    aoDeslizar()
    window.addEventListener('scroll', aoDeslizar, { passive: true })
    return () => window.removeEventListener('scroll', aoDeslizar)
  }, [])

  return (
    <header className={'nav' + (deslocada ? ' is-deslocada' : '')}>
      <NavLink to="/" className="nav__logo" aria-label="Rosarinho e Manel — início">
        <img src={caminho('/images/logo.png')} alt="" />
      </NavLink>
      <nav className="nav__links">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => 'nav__link' + (isActive ? ' is-active' : '')}
          >
            {t(l.chave)}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
