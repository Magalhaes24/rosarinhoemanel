import { useEffect, useRef, useState } from 'react'
import { FONTES } from '../data/fontes.js'
import './EscolherFonte.css'

/**
 * Um botão que abre a lista de tipos de letra, para mudar a letra de um texto
 * só — sem mexer na do resto do site, que se escolhe no painel «Aparência».
 *
 * Cada linha aparece escrita na sua própria letra, que é a única forma de
 * escolher uma sem a experimentar. O «Como está» devolve o texto à letra que
 * herdava, e é o que separa «não lhe toquei» de «pus esta».
 */
export default function EscolherFonte({ valor, aoMudar }) {
  const [aberto, setAberto] = useState(false)
  const caixa = useRef(null)

  useEffect(() => {
    if (!aberto) return
    const fora = (e) => {
      if (!caixa.current?.contains(e.target)) setAberto(false)
    }
    const tecla = (e) => e.key === 'Escape' && setAberto(false)
    document.addEventListener('pointerdown', fora)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('pointerdown', fora)
      document.removeEventListener('keydown', tecla)
    }
  }, [aberto])

  const escolhida = FONTES.find(([v]) => v === valor)

  return (
    <span className="fonte" ref={caixa}>
      <button
        type="button"
        className="fonte__botao"
        title="Tipo de letra"
        aria-label="Tipo de letra"
        aria-expanded={aberto}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setAberto((v) => !v)}
      >
        <span style={escolhida ? { fontFamily: escolhida[0] } : undefined}>Aa</span>
      </button>

      {aberto && (
        <div className="fonte__lista" contentEditable={false}>
          <button
            type="button"
            className={'fonte__opcao' + (valor ? '' : ' is-ativa')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              aoMudar('')
              setAberto(false)
            }}
          >
            Como está
          </button>
          {FONTES.map(([v, nome]) => (
            <button
              key={v}
              type="button"
              className={'fonte__opcao' + (valor === v ? ' is-ativa' : '')}
              style={{ fontFamily: v }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                aoMudar(v)
                setAberto(false)
              }}
            >
              {nome}
            </button>
          ))}
        </div>
      )}
    </span>
  )
}
