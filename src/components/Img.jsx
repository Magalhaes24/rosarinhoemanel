import { useState } from 'react'
import { useConteudo } from '../lib/conteudo.jsx'
import { useEdicao } from '../lib/edicao.jsx'
import { imagensPadrao } from '../data/conteudoPadrao.js'
import EscolherImagem from './EscolherImagem.jsx'
import './Img.css'

/**
 * Uma fotografia do site.
 *
 * Fora do modo de edição é um `<img>` e nada mais — a marcação fica igual à
 * que se mediu contra o rascunho. Em edição ganha um botão por cima para a
 * trocar, por ficheiro ou por endereço.
 *
 * As props extra (className, alt, loading…) passam para o `<img>`.
 */
export default function Img({ k, alt = '', ...resto }) {
  const { img, imagens } = useConteudo()
  const { emEdicao, alterarImagem } = useEdicao()
  const [aberto, setAberto] = useState(false)

  const src = img(k)
  const foiTrocada = imagens[k] !== imagensPadrao[k]

  const imagem = <img src={src} alt={alt} {...resto} />

  if (!emEdicao) return imagem

  return (
    <span className="img-edit">
      {imagem}
      <button
        type="button"
        className="img-edit__botao"
        onClick={() => setAberto((v) => !v)}
        title={k}
      >
        Trocar fotografia
      </button>
      {aberto && (
        <EscolherImagem
          temOriginal={foiTrocada}
          aoEscolher={(url) => alterarImagem(k, url)}
          aoRepor={() => alterarImagem(k, imagensPadrao[k])}
          aoFechar={() => setAberto(false)}
        />
      )}
    </span>
  )
}
