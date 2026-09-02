import { useState } from 'react'
import { enviar } from '../lib/enviar.js'
import { useTexto } from '../lib/conteudo.jsx'
import './Form.css'

export default function PresenteForm() {
  const t = useTexto()
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
      await enviar('presentes', {
        nome: nome.trim().slice(0, 120),
        presente: presente.trim().slice(0, 200),
        mensagem: mensagem.trim().slice(0, 1000),
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
          {t('form.campoNome')}
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
          {t('presente.campoPresente')}
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
          {t('presente.campoMensagem')}
        </label>
        <textarea
          id="pr-mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          maxLength={1000}
        />
      </div>

      <button className="form-submit" type="submit" disabled={estado === 'a-enviar'}>
        {estado === 'a-enviar' ? t('form.aEnviar') : t('form.enviar')}
      </button>

      {estado === 'ok' && <p className="form-feedback is-ok">{t('presente.ok')}</p>}
      {estado === 'erro' && <p className="form-feedback is-error">{t('presente.erro')}</p>}

    </form>
  )
}
