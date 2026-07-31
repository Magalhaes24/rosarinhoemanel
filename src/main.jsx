import React from 'react'
import ReactDOM from 'react-dom/client'
import { Router } from './lib/router.jsx'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
)
