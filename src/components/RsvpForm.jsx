import { useState } from 'react'
import { enviar } from '../lib/enviar.js'
import { useTexto } from '../lib/conteudo.jsx'
import './Form.css'

export default function RsvpForm() {
  const t = useTexto()
  // Os rótulos vêm do conteúdo; os valores gravados («sim»/«nao») não, senão
  // mudar o texto do botão mudava o que fica na base de dados.
  const OPCOES = [
    { value: 'sim', label: t('rsvp.opcaoSim') },
    { value: 'nao', label: t('rsvp.opcaoNao') },
  ]
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
      <h3 className="form-card__title">{t('rsvp.tituloFormulario')}</h3>

      <div className="form-field">
        <label className="form-field__label" htmlFor="rsvp-nome">
          {t('form.campoNome')}
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
        <span className="form-field__label">{t('rsvp.campoPresenca')}</span>
        <div className="form-options" role="radiogroup" aria-label={t('rsvp.campoPresenca')}>
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
        {estado === 'a-enviar' ? t('form.aEnviar') : t('form.enviar')}
      </button>

      {estado === 'ok' && <p className="form-feedback is-ok">{t('rsvp.ok')}</p>}
      {estado === 'erro' && <p className="form-feedback is-error">{t('rsvp.erro')}</p>}

    </form>
  )
}
