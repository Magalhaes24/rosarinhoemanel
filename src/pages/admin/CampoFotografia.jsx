import { useRef, useState } from 'react'
import { guardarFotografia, mensagemDeEnvio } from '../../lib/fotografias.js'

/**
 * Campo de imagem, por duas vias:
 *
 *  - enviar um ficheiro para o Firebase Storage;
 *  - colar o endereço de uma imagem que já esteja algures na internet.
 *
 * A segunda existe porque o Storage exige o plano Blaze do Firebase. Sem ele,
 * o envio falha e só resta o endereço — que funciona bem, com a ressalva de
 * que a imagem deixa de aparecer se quem a aloja a mudar de sítio.
 */
export default function CampoFotografia({ valor, aoMudar, etiqueta = 'Fotografia' }) {
  const input = useRef(null)
  const [estado, setEstado] = useState('idle')
  const [erro, setErro] = useState('')
  const [aColar, setAColar] = useState(false)
  const [endereco, setEndereco] = useState('')

  async function aoEscolher(e) {
    const ficheiro = e.target.files?.[0]
    if (!ficheiro) return
    setEstado('a-enviar')
    setErro('')
    try {
      aoMudar(await guardarFotografia(ficheiro))
      setEstado('idle')
    } catch (err) {
      setErro(mensagemDeEnvio(err))
      setEstado('idle')
    } finally {
      if (input.current) input.current.value = ''
    }
  }

  function confirmarEndereco() {
    const limpo = endereco.trim()
    if (!limpo) return
    if (!/^https:\/\//i.test(limpo)) {
      setErro('O endereço tem de começar por https://')
      return
    }
    setErro('')
    aoMudar(limpo)
    setEndereco('')
    setAColar(false)
  }

  return (
    <div className="admin__fotografia">
      <span className="admin__campo-etiqueta">{etiqueta}</span>

      {valor && (
        <div className="admin__fotografia-previa">
          <img src={valor} alt="" onError={() => setErro('Esse endereço não devolveu uma imagem.')} />
        </div>
      )}

      <div className="admin__fotografia-acoes">
        <button
          type="button"
          className="admin__btn admin__btn--claro"
          onClick={() => input.current?.click()}
          disabled={estado === 'a-enviar'}
        >
          {estado === 'a-enviar' ? 'A enviar…' : valor ? 'Substituir ficheiro' : 'Enviar ficheiro'}
        </button>

        <button
          type="button"
          className="admin__btn admin__btn--claro"
          onClick={() => setAColar((v) => !v)}
        >
          Colar endereço
        </button>

        {valor && (
          <button
            type="button"
            className="admin__btn admin__btn--claro"
            onClick={() => aoMudar('')}
          >
            Remover
          </button>
        )}
      </div>

      {aColar && (
        <div className="admin__fotografia-endereco">
          <input
            type="url"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="https://…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                confirmarEndereco()
              }
            }}
          />
          <button type="button" className="admin__btn" onClick={confirmarEndereco}>
            Usar
          </button>
        </div>
      )}

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        onChange={aoEscolher}
        hidden
      />

      {erro && <p className="admin__erro">{erro}</p>}
    </div>
  )
}
