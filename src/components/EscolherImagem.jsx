import { useEffect, useRef, useState } from 'react'
import './EscolherImagem.css'

/**
 * Painel para trocar uma fotografia, por ficheiro ou por endereço.
 *
 * O envio de ficheiro precisa do Firebase Storage, que exige o plano Blaze.
 * Enquanto não estiver ativo, o erro diz o que fazer e o endereço continua a
 * funcionar — por isso as duas vias existem lado a lado e nenhuma é «a
 * alternativa».
 */
export default function EscolherImagem({ aoEscolher, aoRepor, aoFechar, temOriginal }) {
  const input = useRef(null)
  const painel = useRef(null)
  const [estado, setEstado] = useState('idle')
  const [erro, setErro] = useState('')
  const [endereco, setEndereco] = useState('')

  // Fecha ao clicar fora ou com Esc.
  useEffect(() => {
    const foraDoPainel = (e) => {
      if (painel.current && !painel.current.contains(e.target)) aoFechar()
    }
    const aoTeclar = (e) => e.key === 'Escape' && aoFechar()
    document.addEventListener('pointerdown', foraDoPainel)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('pointerdown', foraDoPainel)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aoFechar])

  async function aoEnviarFicheiro(e) {
    const ficheiro = e.target.files?.[0]
    if (!ficheiro) return
    setEstado('a-enviar')
    setErro('')
    try {
      const { enviarFotografia } = await import('../lib/armazenamento.js')
      aoEscolher(await enviarFotografia(ficheiro))
      aoFechar()
    } catch (err) {
      const codigo = err?.code || ''
      setErro(
        codigo.includes('unauthorized') || codigo.includes('unknown')
          ? 'O Firebase Storage não está ativo neste projeto. Usa antes um endereço.'
          : err.message || 'Não foi possível enviar a imagem.'
      )
      setEstado('idle')
    } finally {
      if (input.current) input.current.value = ''
    }
  }

  function usarEndereco() {
    const limpo = endereco.trim()
    if (!limpo) return
    if (!/^https:\/\//i.test(limpo)) {
      setErro('O endereço tem de começar por https://')
      return
    }
    aoEscolher(limpo)
    aoFechar()
  }

  return (
    <div className="escolher-img" ref={painel} contentEditable={false}>
      <button
        type="button"
        className="escolher-img__btn"
        onClick={() => input.current?.click()}
        disabled={estado === 'a-enviar'}
      >
        {estado === 'a-enviar' ? 'A enviar…' : 'Enviar ficheiro'}
      </button>

      <div className="escolher-img__linha">
        <input
          type="url"
          value={endereco}
          placeholder="https://…"
          onChange={(e) => setEndereco(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              usarEndereco()
            }
          }}
        />
        <button type="button" className="escolher-img__btn" onClick={usarEndereco}>
          Usar
        </button>
      </div>

      <div className="escolher-img__rodape">
        {temOriginal && (
          <button
            type="button"
            className="escolher-img__btn escolher-img__btn--claro"
            onClick={() => {
              aoRepor()
              aoFechar()
            }}
          >
            Repor a original
          </button>
        )}
        <button
          type="button"
          className="escolher-img__btn escolher-img__btn--claro"
          onClick={aoFechar}
        >
          Fechar
        </button>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        onChange={aoEnviarFicheiro}
        hidden
      />

      {erro && <p className="escolher-img__erro">{erro}</p>}
    </div>
  )
}
