/**
 * O pouco de formatação que um texto do site pode trazer por dentro.
 *
 * Até aqui um texto era uma linha de texto simples: o negrito só se podia dar
 * ao elemento inteiro. Para se poder pôr a negrito duas palavras no meio de
 * uma frase, o que se grava passa a poder ter `<b>` — e só `<b>`.
 *
 * Tudo o resto que venha do `contentEditable` (as `<div>` e os `<br>` que os
 * browsers inventam, o que sobra de uma colagem, um `<script>` que alguém
 * escrevesse à mão na base de dados) é deitado fora aqui, à entrada e à saída.
 * É por isso que a limpeza vive num sítio só: o texto passa por ela quando se
 * grava e outra vez quando se desenha, e não há caminho que a contorne.
 */

/** As etiquetas que sobrevivem. Tudo o resto vale pelo texto que tem dentro. */
const PERMITIDAS = new Set(['B', 'STRONG'])

/** As que, sendo blocos, valem uma quebra de linha quando desaparecem. */
const BLOCOS = new Set(['DIV', 'P', 'LI', 'TR'])

function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function serializar(no) {
  let saida = ''

  for (const filho of no.childNodes) {
    if (filho.nodeType === 3) {
      saida += escapar(filho.nodeValue)
      continue
    }
    if (filho.nodeType !== 1) continue

    const nome = filho.tagName
    if (nome === 'BR') {
      saida += '\n'
      continue
    }

    // Uma quebra antes do bloco, para o texto não ficar todo colado quando o
    // browser resolve embrulhar uma linha nova numa `<div>`.
    if (BLOCOS.has(nome) && saida && !saida.endsWith('\n')) saida += '\n'

    const dentro = serializar(filho)
    saida += PERMITIDAS.has(nome) && dentro.trim() ? `<b>${dentro}</b>` : dentro
  }

  return saida
}

/**
 * Limpa uma marcação vinda do editor, deixando texto e `<b>`.
 *
 * Serve também para texto simples: uma frase com «<» ou «&» sai daqui
 * escapada, e é isso que a torna segura de desenhar como HTML.
 */
export function limparMarcacao(html) {
  if (!html) return ''
  const modelo = document.createElement('template')
  modelo.innerHTML = String(html)
  return serializar(modelo.content)
}

/** Se o texto traz negrito por dentro — e portanto tem de ir como HTML. */
export function temMarcacao(texto) {
  return /<\/?(b|strong)\b/i.test(String(texto || ''))
}

/**
 * O texto em letras, sem marcação nenhuma.
 *
 * É o caminho inverso da limpeza: o que está gravado traz `&amp;` e `&lt;`
 * onde o texto tinha «&» e «<», e são estas as letras que se desenham quando
 * o texto vai como texto — num `alt`, num título de janela, ou simplesmente
 * porque não tem negrito nenhum lá dentro.
 */
export function semMarcacao(texto) {
  if (!texto) return ''
  const modelo = document.createElement('template')
  modelo.innerHTML = String(texto)
  return modelo.content.textContent || ''
}
