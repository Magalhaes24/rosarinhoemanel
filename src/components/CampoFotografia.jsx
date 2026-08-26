import { useEffect, useRef, useState } from 'react'
import { guardarFotografia, mensagemDeEnvio } from '../lib/fotografias.js'
import { useConteudo, resolverImagem } from '../lib/conteudo.jsx'

/**
 * Campo de imagem, por duas vias que se escolhem num par de pastilhas:
 *
 *  - «Endereço»: colar o endereço de uma imagem que já esteja algures;
 *  - «Carregar»: enviar um ficheiro para o Firebase Storage.
 *
 * A primeira existe porque o Storage exige o plano Blaze do Firebase. Sem ele,
 * o envio falha e só resta o endereço — que funciona bem, com a ressalva de
 * que a imagem deixa de aparecer se quem a aloja a mudar de sítio.
 *
 * A pré-visualização fica por baixo das duas, com o «Remover imagem» no canto:
 * assim vê-se sempre o que está lá, seja qual for a via escolhida.
 */

/** Um endereço que serve como imagem: da internet ou colado como dados. */
function enderecoValido(texto) {
  return /^(https?:\/\/|data:image\/)/i.test(texto)
}

export default function CampoFotografia({ valor, aoMudar, etiqueta = 'Imagem' }) {
  const { fotografias } = useConteudo()
  const input = useRef(null)
  const [estado, setEstado] = useState('idle')
  const [erro, setErro] = useState('')
  const [via, setVia] = useState('endereco')
  const [endereco, setEndereco] = useState('')

  // Uma fotografia enviada fica gravada como `firestore:<id>`, que não é
  // endereço nenhum e não faz sentido mostrar na caixa de texto.
  const valorEditavel = enderecoValido(valor || '') ? valor : ''

  useEffect(() => setEndereco(valorEditavel), [valorEditavel])

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

  /** Aplica o que está escrito na caixa — ao sair dela ou com Enter. */
  function aplicarEndereco() {
    const limpo = endereco.trim()
    if (limpo === (valorEditavel || '')) return
    if (!limpo) {
      setErro('')
      aoMudar('')
      return
    }
    if (!enderecoValido(limpo)) {
      setErro('O endereço tem de começar por https:// (ou ser uma imagem colada como dados).')
      return
    }
    setErro('')
    aoMudar(limpo)
  }

  return (
    <div className="admin__fotografia">
      <span className="admin__campo-etiqueta">{etiqueta}</span>

      <div className="foto__vias">
        {[
          ['endereco', 'Endereço'],
          ['ficheiro', 'Carregar'],
        ].map(([chave, nome]) => (
          <button
            key={chave}
            type="button"
            aria-pressed={via === chave}
            className={'foto__via' + (via === chave ? ' is-ativa' : '')}
            onClick={() => setVia(chave)}
          >
            {nome}
          </button>
        ))}
      </div>

      {via === 'endereco' ? (
        <input
          type="text"
          className="foto__endereco"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          onBlur={aplicarEndereco}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              aplicarEndereco()
            }
          }}
          placeholder={valor && !valorEditavel ? 'Fotografia guardada no site' : 'https://…'}
          disabled={!!valor && !valorEditavel}
        />
      ) : (
        <button
          type="button"
          className="admin__btn admin__btn--claro foto__carregar"
          onClick={() => input.current?.click()}
          disabled={estado === 'a-enviar'}
        >
          {estado === 'a-enviar'
            ? 'A enviar…'
            : valor
              ? 'Escolher outro ficheiro'
              : 'Escolher ficheiro'}
        </button>
      )}

      {valor && (
        <figure className="foto__previa">
          {/* O que fica gravado pode ser `firestore:<id>`, que não serve como
              `src`: a pré-visualização tem de passar pelo mesmo tradutor que o
              site usa, senão o admin envia a fotografia e vê um quadrado vazio. */}
          <img
            src={resolverImagem(valor, fotografias)}
            alt=""
            onError={() => setErro('Esse endereço não devolveu uma imagem.')}
          />
          <figcaption>
            <button type="button" className="admin__ligacao" onClick={() => aoMudar('')}>
              Remover imagem
            </button>
          </figcaption>
        </figure>
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
