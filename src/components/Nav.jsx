import { NavLink } from 'react-router-dom'
import './Nav.css'

const links = [
  { to: '/', label: 'Por onde começar?' },
  { to: '/noivos', label: 'Quem são os noivos?' },
  { to: '/presentes', label: 'O que dar?' },
]

export default function Nav() {
  return (
    <header className="nav">
      <NavLink to="/" className="nav__logo" aria-label="Rosarinho e Manel — início">
        <img src="/images/logo.png" alt="" />
      </NavLink>
      <nav className="nav__links">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => 'nav__link' + (isActive ? ' is-active' : '')}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
