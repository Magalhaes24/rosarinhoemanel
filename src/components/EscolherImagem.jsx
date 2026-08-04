import { useEffect, useRef, useState } from 'react'
import { useConteudo } from '../lib/conteudo.jsx'
import './EscolherImagem.css'

/**
 * Painel para trocar uma fotografia, por ficheiro ou por endereço.
 *
 * O ficheiro é reduzido e recomprimido no browser e guardado em base64 no
 * Firestore — o Firebase Storage exigiria o plano Blaze. Ver
 * src/lib/fotografias.js para os limites que isso impõe.
 */
export default function EscolherImagem({ aoEscolher, aoRepor, aoFechar, temOriginal }) {
  const { registarFotografia } = useConteudo()
  const input = useRef(null)
  const painel = useRef(null)
  const [estado, setEstado] = useState('idle')
  const [erro, setErro] = useState('')
  const [endereco, setEndereco] = useState('')
  const [progresso, setProgresso] = useState(0)

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
    setProgresso(0)
    try {
      const { guardarFotografia } = await import('../lib/fotografias.js')
      // `registarFotografia` mete a imagem em memória mal o documento existe,
      // para aparecer já — não à espera da volta pelo `onSnapshot`.
      aoEscolher(await guardarFotografia(ficheiro, setProgresso, registarFotografia))
      aoFechar()
    } catch (err) {
      const { mensagemDeEnvio } = await import('../lib/fotografias.js')
      setErro(mensagemDeEnvio(err))
      setEstado('idle')
    } finally {
      setProgresso(0)
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
        {estado === 'a-enviar'
          ? `A enviar… ${Math.round(progresso * 100)}%`
          : 'Enviar ficheiro'}
      </button>

      {estado === 'a-enviar' && (
        <div className="escolher-img__barra">
          <div style={{ width: `${Math.max(3, progresso * 100)}%` }} />
        </div>
      )}

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
