import { useState } from 'react'
import Carousel from './Carousel.jsx'
import EscolherImagem from './EscolherImagem.jsx'
import { useConteudo } from '../lib/conteudo.jsx'
import { useEdicao } from '../lib/edicao.jsx'
import { galeriasPadrao } from '../data/galeriasPadrao.js'
import './Galeria.css'

/**
 * Um carrossel cujas fotografias o admin pode gerir.
 *
 * Fora do modo de edição é só o carrossel. Em edição ganha um painel por baixo
 * para acrescentar, reordenar e remover — as miniaturas é que se arrastam, não
 * o carrossel, para não haver dois comportamentos a competir pelo mesmo gesto.
 *
 * `molduras` são os exemplos a mostrar enquanto a galeria estiver vazia.
 */
export default function Galeria({ nome, molduras = [], ...propsDoCarrossel }) {
  const { galeria, galerias } = useConteudo()
  const { emEdicao, alterarGaleria } = useEdicao()
  const [aAcrescentar, setAAcrescentar] = useState(false)

  const lista = galerias[nome] || []
  const resolvidas = galeria(nome)
  const slides = resolvidas.length
    ? resolvidas.map((src) => ({ src, alt: '' }))
    : molduras

  const guardar = (nova) => alterarGaleria(nome, nova)

  const mover = (i, dir) => {
    const nova = [...lista]
    const destino = i + dir
    if (destino < 0 || destino >= nova.length) return
    ;[nova[i], nova[destino]] = [nova[destino], nova[i]]
    guardar(nova)
  }

  return (
    <div className="galeria">
      <Carousel
        slides={slides}
        {...propsDoCarrossel}
        // Sem fotografias reais não há nada para andar sozinho.
        auto={propsDoCarrossel.auto && resolvidas.length > 0}
      />

      {emEdicao && (
        <div className="galeria__editor" contentEditable={false}>
          <div className="galeria__topo">
            <strong>
              {resolvidas.length} {resolvidas.length === 1 ? 'fotografia' : 'fotografias'}
            </strong>
            <div className="galeria__acoes">
              <button
                type="button"
                className="galeria__btn"
                onClick={() => setAAcrescentar((v) => !v)}
              >
                Acrescentar
              </button>
              {JSON.stringify(lista) !== JSON.stringify(galeriasPadrao[nome] || []) && (
                <button
                  type="button"
                  className="galeria__btn galeria__btn--claro"
                  onClick={() => guardar(galeriasPadrao[nome] || [])}
                >
                  Repor as originais
                </button>
              )}
            </div>
          </div>

          {aAcrescentar && (
            <div className="galeria__escolher">
              <EscolherImagem
                temOriginal={false}
                aoEscolher={(url) => guardar([...lista, url])}
                aoRepor={() => {}}
                aoFechar={() => setAAcrescentar(false)}
              />
            </div>
          )}

          <ul className="galeria__miniaturas">
            {resolvidas.map((src, i) => (
              <li key={`${src}-${i}`}>
                <img src={src} alt="" />
                <div className="galeria__mini-acoes">
                  <button type="button" onClick={() => mover(i, -1)} disabled={i === 0}>
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(i, 1)}
                    disabled={i === resolvidas.length - 1}
                  >
                    →
                  </button>
                  <button
                    type="button"
                    className="is-perigo"
                    onClick={() => guardar(lista.filter((_, k) => k !== i))}
                    aria-label="Remover"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {resolvidas.length === 0 && (
            <p className="galeria__vazia">
              Ainda sem fotografias. As molduras que se veem em cima são só um exemplo.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
