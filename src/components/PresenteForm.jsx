import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import './Form.css'

export default function PresenteForm() {
  const [nome, setNome] = useState('')
  const [presente, setPresente] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [estado, setEstado] = useState('idle')
  const [armadilha, setArmadilha] = useState('') // honeypot: só um bot preenche

  async function onSubmit(e) {
    e.preventDefault()
    // Bot detetado — finge que correu bem e não escreve nada.
    if (armadilha) {
      setEstado('ok')
      return
    }
    if (!nome.trim() || !presente.trim()) {
      setEstado('erro')
      return
    }
    setEstado('a-enviar')
    try {
      await addDoc(collection(db, 'presentes'), {
        nome: nome.trim().slice(0, 120),
        presente: presente.trim().slice(0, 200),
        mensagem: mensagem.trim().slice(0, 1000),
        criadoEm: serverTimestamp(),
      })
      setEstado('ok')
      setNome('')
      setPresente('')
      setMensagem('')
    } catch (err) {
      console.error(err)
      setEstado('erro')
    }
  }

  return (
    <form className="form-card" onSubmit={onSubmit} noValidate>
      <div className="form-field">
        <label className="form-field__label" htmlFor="pr-nome">
          Nome
        </label>
        <input
          id="pr-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          autoComplete="name"
          maxLength={120}
          required
        />
      </div>

      {/* Honeypot: invisível para pessoas, irresistível para bots. */}
      <div className="form-armadilha" aria-hidden="true">
        <label htmlFor="pr-website">Website</label>
        <input
          id="pr-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={armadilha}
          onChange={(e) => setArmadilha(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-field__label" htmlFor="pr-presente">
          Presente
        </label>
        <input
          id="pr-presente"
          type="text"
          value={presente}
          onChange={(e) => setPresente(e.target.value)}
          maxLength={200}
          required
        />
      </div>

      <div className="form-field">
        <label className="form-field__label" htmlFor="pr-mensagem">
          Mensagem
        </label>
        <textarea
          id="pr-mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          maxLength={1000}
        />
      </div>

      <button className="form-submit" type="submit" disabled={estado === 'a-enviar'}>
        {estado === 'a-enviar' ? 'A enviar…' : 'Enviar'}
      </button>

      {estado === 'ok' && (
        <p className="form-feedback is-ok">Obrigado! Vamos poder agradecer-vos como deve ser.</p>
      )}
      {estado === 'erro' && (
        <p className="form-feedback is-error">Preenche pelo menos o nome e o presente.</p>
      )}

      <p className="form-note">
        Os teus dados servem apenas para a organização do casamento e não são partilhados.
      </p>
    </form>
  )
}
