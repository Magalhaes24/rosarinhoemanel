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
 * O Enter faz parágrafo — insere uma quebra em vez de fechar o campo, que é o
 * que se espera de quem está a escrever no próprio site. Para sair sem rato há
 * o Escape. `multilinha={false}` reserva-se aos campos que só podem ter uma
 * linha (uma hora, um número), onde o Enter grava e sai.
 */
export default function T({ k, multilinha = true }) {
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
        if (e.key === 'Enter') {
          // Nunca a quebra do próprio contentEditable: essa mete <div>/<br> e
          // o `textContent` — que é o que se grava — perdia a quebra.
          e.preventDefault()
          if (multilinha) {
            document.execCommand('insertText', false, '\n')
          } else {
            e.currentTarget.blur()
          }
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
