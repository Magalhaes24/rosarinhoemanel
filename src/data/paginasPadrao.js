/**
 * Ordem original das secções, tal como no rascunho.
 *
 * É o que se vê enquanto o admin não mexer no layout. Se ele reordenar, o
 * documento `conteudo/site` passa a ter a sua própria lista e esta fica só
 * como rede de segurança — o botão «Repor o original» na administração volta
 * exatamente a isto.
 */

const nativa = (tipo) => ({ id: tipo, tipo })

export const paginasPadrao = {
  inicio: [
    'hero',
    'missa',
    'copo',
    'rsvp',
    'historia',
    'presentesCta',
    'drivers',
    'hoteisCta',
  ].map(nativa),
  noivos: ['noivosIntro', 'ano2018', 'ano2022', 'ano2026'].map(nativa),
  presentes: ['paraACasa', 'luaDeMel', 'contribuicao'].map(nativa),
  hoteis: ['hoteis'].map(nativa),
}

/**
 * Passagem dos layouts já gravados para o desenho novo.
 *
 * A lista de hotéis vivia no fim da página inicial. Quem já tem layout gravado
 * continuaria a tê-la lá, e a chamada nova nunca apareceria — por isso troca-se
 * uma pela outra à leitura. É uma troca de uma vez: assim que o admin gravar,
 * fica gravado o desenho novo.
 */
export function migrarPaginas(paginas) {
  const inicio = paginas.inicio
  if (!Array.isArray(inicio) || !inicio.some((s) => s.tipo === 'hoteis')) return paginas
  return {
    ...paginas,
    inicio: inicio.map((s) => (s.tipo === 'hoteis' ? { id: 'hoteisCta', tipo: 'hoteisCta' } : s)),
  }
}

export const paginas = [
  { id: 'inicio', nome: 'Início', rota: '/' },
  { id: 'noivos', nome: 'Quem são os noivos?', rota: '/noivos' },
  { id: 'presentes', nome: 'O que dar?', rota: '/presentes' },
  { id: 'hoteis', nome: 'Onde ficar?', rota: '/onde-ficar' },
]
