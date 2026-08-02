import { useEffect, useRef } from 'react'
import { useTexto } from '../lib/conteudo.jsx'
import { useEdicao } from '../lib/edicao.jsx'

/**
 * Um texto do site.
 *
 * Fora do modo de edição é só a string — nem sequer acrescenta um elemento à
 * página. Em modo de edição vira um campo editável no próprio sítio, com o
 * aspeto que terá quando gravado.
 *
 * `multilinha` permite Enter; nos títulos e rótulos curtos o Enter grava e
 * sai, que é o que se espera de um campo de uma linha.
 */
export default function T({ k, multilinha = false }) {
  const t = useTexto()
  const { emEdicao, alterarTexto } = useEdicao()
  const ref = useRef(null)
  const valor = t(k)

  // Só escreve no DOM quando o valor muda de fora. Escrever a cada tecla
  // partiria a posição do cursor.
  useEffect(() => {
    if (!emEdicao) return
    const el = ref.current
    if (el && el.textContent !== valor) el.textContent = valor
  }, [emEdicao, valor])

  if (!emEdicao) return valor

  return (
    <span
      ref={ref}
      className="editavel"
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label={k}
      title={k}
      onInput={(e) => alterarTexto(k, e.currentTarget.textContent)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !multilinha) {
          e.preventDefault()
          e.currentTarget.blur()
        }
        if (e.key === 'Escape') e.currentTarget.blur()
      }}
      // Colar como texto simples: sem isto vinha o HTML da origem.
      onPaste={(e) => {
        e.preventDefault()
        const texto = e.clipboardData.getData('text/plain')
        document.execCommand('insertText', false, multilinha ? texto : texto.replace(/\s+/g, ' '))
      }}
    />
  )
}
