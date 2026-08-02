import { useRef, useState } from 'react'
import { enviarFotografia } from '../../lib/armazenamento.js'

/** Campo de imagem: envia para o Storage e devolve o endereço. */
export default function CampoFoto({ valor, aoMudar, etiqueta = 'Fotografia' }) {
  const input = useRef(null)
  const [estado, setEstado] = useState('idle')
  const [erro, setErro] = useState('')

  async function aoEscolher(e) {
    const ficheiro = e.target.files?.[0]
    if (!ficheiro) return
    setEstado('a-enviar')
    setErro('')
    try {
      aoMudar(await enviarFotografia(ficheiro))
      setEstado('idle')
    } catch (err) {
      setErro(err.message || 'Não foi possível enviar a imagem.')
      setEstado('idle')
    } finally {
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="admin__foto">
      <span className="admin__campo-etiqueta">{etiqueta}</span>

      {valor && (
        <div className="admin__foto-previa">
          <img src={valor} alt="" />
        </div>
      )}

      <div className="admin__foto-acoes">
        <button
          type="button"
          className="admin__btn admin__btn--claro"
          onClick={() => input.current?.click()}
          disabled={estado === 'a-enviar'}
        >
          {estado === 'a-enviar' ? 'A enviar…' : valor ? 'Substituir' : 'Escolher imagem'}
        </button>
        {valor && (
          <button type="button" className="admin__btn admin__btn--claro" onClick={() => aoMudar('')}>
            Remover
          </button>
        )}
      </div>

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
