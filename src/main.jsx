import React from 'react'
import ReactDOM from 'react-dom/client'
import { Router } from './lib/router.jsx'
import { ConteudoProvider } from './lib/conteudo.jsx'
import { ConfirmacaoProvider } from './components/Confirmacao.jsx'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConteudoProvider>
      <ConfirmacaoProvider>
        <Router>
          <App />
        </Router>
      </ConfirmacaoProvider>
    </ConteudoProvider>
  </React.StrictMode>
)
