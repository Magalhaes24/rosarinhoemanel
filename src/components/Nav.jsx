import { useEffect, useState } from 'react'
import { NavLink, useLocation } from '../lib/router.jsx'
import { useTexto } from '../lib/conteudo.jsx'
import './Nav.css'

const links = [
  { to: '/', chave: 'nav.inicio' },
  { to: '/noivos', chave: 'nav.noivos' },
  { to: '/presentes', chave: 'nav.presentes' },
  { to: '/onde-ficar', chave: 'nav.hoteis' },
]

/**
 * O menu do topo.
 *
 * Não há barra: os quatro rótulos são frases inteiras — «Quem são os noivos?»,
 * «Onde ficar?» — e uma faixa a atravessar o ecrã só para as arrumar tirava
 * altura à fotografia de abertura. Fica só o botão, a flutuar por cima da
 * página, e os links descem num painel quando se carrega nele. É o mesmo no
 * telemóvel e no computador, para não haver dois desenhos a manter.
 *
 * O botão tem fundo próprio de propósito: por baixo dele tanto pode estar o
 * verde da abertura como o creme das outras páginas, e sem esse fundo as
 * riscas desapareciam numa delas.
 */
export default function Nav() {
  const t = useTexto()
  const { pathname } = useLocation()
  const [aberto, setAberto] = useState(false)

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
    <header className={'nav' + (aberto ? ' is-aberta' : '')}>
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
