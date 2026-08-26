import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from './lib/router.jsx'
import { ConteudoProviderEdicao } from './lib/edicao.jsx'
import Nav from './components/Nav.jsx'
import BarraEdicao from './components/BarraEdicao.jsx'
import VoltarAoTopo from './components/VoltarAoTopo.jsx'
import Home from './pages/Home.jsx'
import Noivos from './pages/Noivos.jsx'
import Presentes from './pages/Presentes.jsx'
import OndeFicar from './pages/OndeFicar.jsx'
import useRevelar from './hooks/useRevelar.js'
import './styles/animacoes.css'

// A área de administração arrasta o SDK de autenticação do Firebase. Fica em
// separado para que os convidados — que são toda a gente — não o descarreguem.
const Admin = lazy(() => import('./pages/Admin.jsx'))

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
    <ConteudoProviderEdicao>
      <ScrollToTop />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/noivos" element={<Noivos />} />
        <Route path="/presentes" element={<Presentes />} />
        <Route path="/onde-ficar" element={<OndeFicar />} />
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
      <VoltarAoTopo />
      <BarraEdicao />
    </ConteudoProviderEdicao>
  )
}
