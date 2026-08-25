import { useEffect, useRef, useState } from 'react'
import { useConteudo } from '../lib/conteudo.jsx'
import { coresEditaveis } from '../data/conteudoPadrao.js'
import './EscolherCor.css'

/**
 * Um botão que abre a paleta do site para escolher uma cor.
 *
 * A paleta é a do tema — as mesmas cores que já estão no site, com o nome que
 * têm no painel «Aparência» — mais o branco, o preto e um seletor livre para
 * quando nenhuma serve. O «sem cor» devolve o elemento ao que herdava, e é
 * isso que faz a diferença entre «não mexi» e «pus explicitamente esta cor».
 *
 * Guarda sempre o valor em hexadecimal e não o nome da cor do tema: se um dia
 * mudarem o verde no painel «Aparência», um texto pintado à mão fica como
 * estava, em vez de mudar sem ninguém lhe tocar.
 */

const EXTRAS = [
  ['#ffffff', 'Branco'],
  ['#000000', 'Preto'],
]

export default function EscolherCor({ valor, aoMudar, etiqueta, icone }) {
  const { tema } = useConteudo()
  const [aberto, setAberto] = useState(false)
  const caixa = useRef(null)

  // Fecha ao carregar fora ou com Escape, como qualquer menu.
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

  const doTema = coresEditaveis
    .map(([chave, nome]) => [tema[chave], nome])
    .filter(([cor]) => cor)

  return (
    <span className="cor" ref={caixa}>
      <button
        type="button"
        className="cor__botao"
        title={etiqueta}
        aria-label={etiqueta}
        aria-expanded={aberto}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setAberto((v) => !v)}
      >
        <span className="cor__icone">{icone}</span>
        {/* A tira por baixo do ícone mostra a cor escolhida; aos quadradinhos
            quando não há nenhuma, como nos programas de desenho. */}
        <span
          className={'cor__tira' + (valor ? '' : ' is-vazia')}
          style={valor ? { background: valor } : undefined}
        />
      </button>

      {aberto && (
        <div className="cor__paleta" contentEditable={false}>
          <div className="cor__grelha">
            {[...doTema, ...EXTRAS].map(([cor, nome]) => (
              <button
                key={cor + nome}
                type="button"
                className={'cor__amostra' + (valor === cor ? ' is-ativa' : '')}
                style={{ background: cor }}
                title={nome}
                aria-label={nome}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  aoMudar(cor)
                  setAberto(false)
                }}
              />
            ))}
          </div>

          <label className="cor__livre">
            <span>Outra</span>
            <input
              type="color"
              value={valor || '#000000'}
              onChange={(e) => aoMudar(e.target.value)}
            />
          </label>

          <button
            type="button"
            className="cor__limpar"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              aoMudar('')
              setAberto(false)
            }}
          >
            Sem cor
          </button>
        </div>
      )}
    </span>
  )
}
