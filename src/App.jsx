import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Noivos from './pages/Noivos.jsx'
import Presentes from './pages/Presentes.jsx'

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
  return (
    <>
      <ScrollToTop />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/noivos" element={<Noivos />} />
        <Route path="/presentes" element={<Presentes />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  )
}
