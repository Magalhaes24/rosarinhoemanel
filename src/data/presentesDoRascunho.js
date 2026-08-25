/**
 * A lista de presentes «Para a casa» tal como veio do rascunho em PDF.
 *
 * Serve o botão «Importar a lista do rascunho» na administração: cria de uma
 * vez os presentes que ainda não existirem, comparando pelo nome. Não é a
 * fonte de verdade da loja — assim que forem importados, quem manda é o
 * Firestore, e mexer aqui não muda nada do que já lá está.
 *
 * As fotografias foram extraídas do próprio PDF para `public/images/presentes`
 * e entram como caminho, não como base64: são as mesmas para toda a gente e
 * não têm de ocupar espaço na base de dados.
 *
 * Duas notas do que veio do rascunho:
 * — a poltrona de 190 € aparece lá sem nome nenhum, só com o preço;
 * — as almofadas dizem «x2», que ficou na descrição por não se saber se o
 *   preço é de cada uma ou do par.
 */
export const presentesDoRascunho = [
  { nome: 'Sofá', preco: 1000, imagem: '/images/presentes/sofa.jpg' },
  { nome: 'Tapete', preco: 200, imagem: '/images/presentes/tapete.jpg' },
  { nome: 'Mesa de café', preco: 500, imagem: '/images/presentes/mesa-de-cafe.jpg' },
  { nome: 'Poltrona', preco: 190, imagem: '/images/presentes/poltrona.jpg' },
  { nome: 'Aparador', preco: 400, imagem: '/images/presentes/aparador.jpg' },
  { nome: 'Cabide', preco: 150, imagem: '/images/presentes/cabide.jpg' },
  { nome: 'Roupeiro', preco: 480, imagem: '/images/presentes/roupeiro.jpg' },
  { nome: 'Conjunto de varanda', preco: 200, imagem: '/images/presentes/conjunto-varanda.jpg' },
  { nome: 'Candeeiro de pé', preco: 230, imagem: '/images/presentes/candeeiro-de-pe.jpg' },
  { nome: 'Almofada', preco: 40, descricao: 'x2', imagem: '/images/presentes/almofada-40.jpg' },
  { nome: 'Almofada', preco: 20, descricao: 'x2', imagem: '/images/presentes/almofada-20.jpg' },
  { nome: 'Almofada', preco: 13, descricao: 'x2', imagem: '/images/presentes/almofada-13.jpg' },
  { nome: 'Candeeiro de mesa', preco: 20, imagem: '/images/presentes/candeeiro-de-mesa.jpg' },
  {
    nome: 'Trem de cozinha 5 peças',
    preco: 300,
    imagem: '/images/presentes/trem-de-cozinha.jpg',
  },
  { nome: 'Conjunto de frigideiras', preco: 90, imagem: '/images/presentes/frigideiras.jpg' },
  { nome: 'Facas de cozinha', preco: 180, imagem: '/images/presentes/facas-de-cozinha.jpg' },
  {
    nome: 'Conjunto de copos de vinho',
    preco: 48,
    imagem: '/images/presentes/copos-de-vinho.jpg',
  },
  { nome: 'Conjunto de copos de água', preco: 36, imagem: '/images/presentes/copos-de-agua.jpg' },
]

/**
 * Compara nomes ignorando maiúsculas, acentos e espaços a mais.
 *
 * É por aqui que a importação sabe o que já existe. Sem isto, importar duas
 * vezes duplicava a lista toda — e as três almofadas, que têm o mesmo nome,
 * contam-se pelo preço além do nome.
 */
export function chaveDoPresente(item) {
  const nome = (item.nome || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
  return `${nome}|${Number(item.preco) || 0}`
}

/**
 * Os presentes do rascunho que ainda não estão na lista.
 *
 * Vive aqui, e não dentro do botão da administração, para se poder pôr à
 * prova sem browser nem sessão: é o mesmo código que os testes correm contra
 * o emulador.
 */
export function porImportar(existentes = []) {
  const jaLa = new Set(existentes.map(chaveDoPresente))
  return presentesDoRascunho.filter((i) => !jaLa.has(chaveDoPresente(i)))
}

/** O documento a gravar, com todos os campos que a loja espera. */
export function documentoDoPresente(item, ordem) {
  return {
    nome: item.nome,
    descricao: item.descricao || '',
    preco: item.preco,
    imagem: item.imagem,
    reservado: false,
    ordem,
  }
}
