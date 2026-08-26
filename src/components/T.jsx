import { useEffect, useRef, useState } from 'react'
import { useConteudo, useTexto } from '../lib/conteudo.jsx'
import { useEdicao } from '../lib/edicao.jsx'
import AjustesTexto, { LIMITES, estiloDoTexto, numero } from './AjustesTexto.jsx'

/**
 * Ajustes que o admin pode dar a um texto, um a um, sem mexer no resto do
 * site: o tamanho, o lado para onde encosta e a largura da caixa.
 *
 * Ficam gravados no tema, com o nome do texto no fim da chave — por exemplo
 * `tamanho.casa.intro`. O tema é um mapa achatado que já se grava e se descarta
 * com tudo o resto, e o `aplicarTema` ignora as chaves que não conhece, por
 * isso não foi preciso inventar um sítio novo para guardar isto.
 */
export const chaveAjuste = (tipo, k) => `${tipo}.${k}`

/**
 * Um texto do site.
 *
 * Fora do modo de edição é só a string — nem sequer acrescenta um elemento à
 * página, a não ser que tenha ajustes próprios gravados. Em modo de edição
 * vira um campo editável no próprio sítio, com o aspeto que terá quando
 * gravado, e com os botões de tamanho e posição enquanto está a ser escrito.
 *
 * O Enter faz parágrafo — insere uma quebra em vez de fechar o campo, que é o
 * que se espera de quem está a escrever no próprio site. Para sair sem rato há
 * o Escape. `multilinha={false}` reserva-se aos campos que só podem ter uma
 * linha (uma hora, um número), onde o Enter grava e sai.
 */
export default function T({ k, multilinha = true }) {
  const t = useTexto()
  const { tema } = useConteudo()
  const { emEdicao, alterarTema, alterarTexto } = useEdicao()
  const ref = useRef(null)
  const [focado, setFocado] = useState(false)
  const valor = t(k)

  const tamanho = numero(tema[chaveAjuste('tamanho', k)], LIMITES.tamanho)
  const largura = numero(tema[chaveAjuste('largura', k)], LIMITES.largura)
  const alinhar = tema[chaveAjuste('alinhar', k)] || ''
  const cor = tema[chaveAjuste('cor', k)] || ''
  const fundo = tema[chaveAjuste('fundo', k)] || ''
  const espaco = tema[chaveAjuste('espaco', k)] ?? ''
  const peso = tema[chaveAjuste('peso', k)] || ''
  const fonte = tema[chaveAjuste('fonte', k)] || ''
  // Eliminar um texto do site é escondê-lo: o original continua no sítio, para
  // se poder repor, mas deixa de sair na página. O elemento à volta cai
  // sozinho — a folha de estilo esconde títulos e parágrafos que ficam vazios.
  const oculto = !!tema[chaveAjuste('oculto', k)]

  // Aqui o texto vive dentro de uma `span` no meio de um parágrafo, e por isso
  // precisa de caixa de linhas própria quando muda de tamanho.
  const estilo = estiloDoTexto({ tamanho, largura, alinhar, cor, fundo, espaco, peso, fonte }, true)
  const temEstilo = Object.keys(estilo).length > 0

  const repor = () => {
    alterarTema(chaveAjuste('tamanho', k), 1)
    alterarTema(chaveAjuste('largura', k), 100)
    alterarTema(chaveAjuste('alinhar', k), '')
    alterarTema(chaveAjuste('cor', k), '')
    alterarTema(chaveAjuste('fundo', k), '')
    alterarTema(chaveAjuste('espaco', k), '')
    alterarTema(chaveAjuste('peso', k), '')
    alterarTema(chaveAjuste('fonte', k), '')
  }

  const eliminar = () => alterarTema(chaveAjuste('oculto', k), oculto ? '' : 1)

  // Só escreve no DOM quando o valor muda de fora. Escrever a cada tecla
  // partiria a posição do cursor.
  useEffect(() => {
    if (!emEdicao) return
    const el = ref.current
    if (el && el.textContent !== valor) el.textContent = valor
  }, [emEdicao, valor])

  // Eliminado é eliminado — também em edição. Se ficasse à vista, a caixa
  // continuava a ocupar o lugar e ninguém percebia que o botão tinha feito
  // alguma coisa. Repõe-se no painel «Aparência», que lista os eliminados.
  if (oculto) return null

  if (!emEdicao) {
    if (!temEstilo) return valor
    return <span style={estilo}>{valor}</span>
  }

  return (
    <>
      <span
        ref={ref}
        className="editavel"
        style={temEstilo ? estilo : undefined}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        role="textbox"
        aria-label={k}
        title={k}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
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
      {focado && (
        <AjustesTexto
          alvo={ref}
          tamanho={tamanho}
          largura={largura}
          alinhar={alinhar}
          cor={cor}
          fundo={fundo}
          espaco={espaco}
          peso={peso}
          fonte={fonte}
          oculto={oculto}
          aoEliminar={eliminar}
          aoMudar={(tipo, v) => alterarTema(chaveAjuste(tipo, k), v)}
          aoRepor={repor}
        />
      )}
    </>
  )
}
