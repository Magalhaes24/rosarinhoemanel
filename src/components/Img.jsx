import { useState } from 'react'
import { useConteudo } from '../lib/conteudo.jsx'
import { useEdicao } from '../lib/edicao.jsx'
import { imagensPadrao } from '../data/conteudoPadrao.js'
import EscolherImagem from './EscolherImagem.jsx'
import './Img.css'

/**
 * Uma fotografia do site.
 *
 * Fora do modo de edição é um `<img>` e nada mais. Em edição ganha um botão
 * para a trocar — mas o embrulho usa `display: contents`, por isso não cria
 * caixa nenhuma e o `<img>` mantém exatamente o lugar que tinha no layout.
 * Sem isso, uma fotografia de fundo (que é absoluta) passava a ocupar espaço
 * e empurrava o resto da secção para baixo.
 *
 * `ancora` diz onde fica o botão dentro do contentor: 'topo' (por omissão),
 * 'centro' ou 'fundo'.
 */
export default function Img({ k, alt = '', ancora = 'topo', ...resto }) {
  const { img, imagens } = useConteudo()
  const { emEdicao, alterarImagem } = useEdicao()
  const [aberto, setAberto] = useState(false)

  const src = img(k)
  const foiTrocada = imagens[k] !== imagensPadrao[k]

  // Uma referência que não resolve dava `src=""`, e o browser desenhava um
  // retângulo branco sem dizer nada. Mais vale um lugar vazio assumido.
  const imagem = src ? (
    <img src={src} alt={alt} {...resto} />
  ) : (
    <span className="img-em-falta" role="img" aria-label="Fotografia indisponível" {...resto}>
      <span>Fotografia indisponível</span>
    </span>
  )

  if (!emEdicao) return imagem

  return (
    <span className="img-edit">
      {imagem}
      <button
        type="button"
        className={`img-edit__botao img-edit__botao--${ancora}`}
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
