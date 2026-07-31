import { Routes, Route, useLocation } from './lib/router.jsx'
import { lazy, Suspense, useEffect } from 'react'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Noivos from './pages/Noivos.jsx'
import Presentes from './pages/Presentes.jsx'
import useRevelar from './hooks/useRevelar.js'

// A área de administração arrasta o SDK de autenticação do Firebase. Fica em
// separado para que os convidados — que são toda a gente — não o descarreguem.
const Admin = lazy(() => import('./pages/Admin.jsx'))
import './styles/animacoes.css'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const alvo = document.querySelector(hash)
      if (alvo) {
        alvo.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  useRevelar()

  return (
    <>
      <ScrollToTop />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/noivos" element={<Noivos />} />
        <Route path="/presentes" element={<Presentes />} />
        {/* Não aparece no menu de propósito: os convidados nunca lhe chegam. */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <Admin />
            </Suspense>
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  )
}
