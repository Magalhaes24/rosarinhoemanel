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
  inicio: ['hero', 'missa', 'copo', 'rsvp', 'historia', 'presentesCta', 'drivers', 'hoteis'].map(
    nativa
  ),
  noivos: ['noivosIntro', 'ano2018', 'ano2022', 'ano2026'].map(nativa),
  presentes: ['paraACasa', 'luaDeMel', 'contribuicao'].map(nativa),
}

export const paginas = [
  { id: 'inicio', nome: 'Início', rota: '/' },
  { id: 'noivos', nome: 'Quem são os noivos?', rota: '/noivos' },
  { id: 'presentes', nome: 'O que dar?', rota: '/presentes' },
]
