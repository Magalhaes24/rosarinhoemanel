import { useState } from 'react'
import { enviar } from '../lib/enviar.js'
import './Form.css'

const OPCOES = [
  { value: 'sim', label: 'Estarei presente' },
  { value: 'nao', label: 'Não poderei ir' },
]

export default function RsvpForm() {
  const [nome, setNome] = useState('')
  const [presenca, setPresenca] = useState('')
  const [estado, setEstado] = useState('idle') // idle | a-enviar | ok | erro
  const [armadilha, setArmadilha] = useState('') // honeypot: só um bot preenche

  async function onSubmit(e) {
    e.preventDefault()
    // Bot detetado — finge que correu bem e não escreve nada.
    if (armadilha) {
      setEstado('ok')
      return
    }
    if (!nome.trim() || !presenca) {
      setEstado('erro')
      return
    }
    setEstado('a-enviar')
    try {
      await enviar('rsvps', {
        nome: nome.trim().slice(0, 120),
        presenca,
      })
      setEstado('ok')
      setNome('')
      setPresenca('')
    } catch (err) {
      console.error(err)
      setEstado('erro')
    }
  }

  return (
    <form className="form-card" onSubmit={onSubmit} noValidate>
      <h3 className="form-card__title">Confirma aqui a tua presença</h3>

      <div className="form-field">
        <label className="form-field__label" htmlFor="rsvp-nome">
          Nome
        </label>
        <input
          id="rsvp-nome"
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
        <label htmlFor="rsvp-website">Website</label>
        <input
          id="rsvp-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={armadilha}
          onChange={(e) => setArmadilha(e.target.value)}
        />
      </div>

      <div className="form-field">
        <span className="form-field__label">Presença</span>
        <div className="form-options" role="radiogroup" aria-label="Presença">
          {OPCOES.map((o) => (
            <label
              key={o.value}
              className={'form-option' + (presenca === o.value ? ' is-checked' : '')}
            >
              <input
                type="radio"
                name="presenca"
                value={o.value}
                checked={presenca === o.value}
                onChange={() => setPresenca(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      <button className="form-submit" type="submit" disabled={estado === 'a-enviar'}>
        {estado === 'a-enviar' ? 'A enviar…' : 'Enviar'}
      </button>

      {estado === 'ok' && (
        <p className="form-feedback is-ok">Recebido, obrigado! Até 5 de dezembro.</p>
      )}
      {estado === 'erro' && (
        <p className="form-feedback is-error">
          Preenche o nome e escolhe uma opção — se o erro persistir, avisa-nos.
        </p>
      )}

      <p className="form-note">
        Os teus dados servem apenas para a organização do casamento e não são partilhados.
      </p>
    </form>
  )
}
