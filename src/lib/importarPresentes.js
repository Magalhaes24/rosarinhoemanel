/**
 * Ler uma folha de presentes — Excel ou CSV — para a lista «Para a casa».
 *
 * A folha vem de onde vier: exportada do Excel, do Numbers, do Google Sheets
 * ou escrita à mão no Bloco de Notas. Por isso aceita-se mais do que um nome
 * para cada coluna (em português e em inglês), o separador do CSV é adivinhado
 * — em Portugal o Excel grava com ponto e vírgula — e o preço lê-se tanto com
 * vírgula como com ponto decimal.
 *
 * Fica fora dos componentes, sem React nem Firestore, para se poder pôr à
 * prova e para o leitor de Excel só ser descarregado quando alguém importa
 * mesmo alguma coisa.
 */

/** Os nomes que cada coluna pode ter na folha. O primeiro é o preferido. */
const COLUNAS = {
  nome: ['nome', 'name', 'presente', 'artigo', 'item'],
  descricao: ['descricao', 'descrição', 'description', 'detalhe', 'notas'],
  preco: ['preco', 'preço', 'price', 'valor', 'custo'],
  imagem: ['imagem', 'image', 'image_url', 'imagem_url', 'foto', 'fotografia', 'url'],
}

/** Tira acentos e espaços de um cabeçalho, para o comparar à vontade. */
function normalizar(valor) {
  return String(valor ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Parte uma linha de CSV respeitando as aspas.
 *
 * Escrito à mão em vez de uma biblioteca: são vinte linhas, e o que se ganha
 * é não trazer mais uma dependência para o que o site já faz bem.
 */
function lerCsv(texto) {
  const limpo = texto.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')

  // O separador é o que mais aparece fora das aspas na primeira linha: o Excel
  // português grava com «;» e quase todo o resto do mundo com «,».
  const primeira = limpo.split('\n')[0] || ''
  const foraDeAspas = primeira.replace(/"[^"]*"/g, '')
  const separador = (foraDeAspas.match(/;/g) || []).length >
    (foraDeAspas.match(/,/g) || []).length
    ? ';'
    : ','

  const linhas = []
  let celula = ''
  let linha = []
  let entreAspas = false

  for (let i = 0; i < limpo.length; i += 1) {
    const c = limpo[i]

    if (c === '"') {
      if (entreAspas && limpo[i + 1] === '"') {
        celula += '"'
        i += 1
      } else {
        entreAspas = !entreAspas
      }
      continue
    }

    if (c === separador && !entreAspas) {
      linha.push(celula)
      celula = ''
      continue
    }

    if (c === '\n' && !entreAspas) {
      linha.push(celula)
      if (linha.some((v) => v.trim() !== '')) linhas.push(linha)
      linha = []
      celula = ''
      continue
    }

    celula += c
  }

  if (celula !== '' || linha.length > 0) {
    linha.push(celula)
    if (linha.some((v) => v.trim() !== '')) linhas.push(linha)
  }

  return linhas
}

/** Lê um .xlsx/.xls com o SheetJS, que só é descarregado aqui. */
async function lerExcel(ficheiro) {
  const XLSX = await import('xlsx')
  const livro = XLSX.read(await ficheiro.arrayBuffer(), { type: 'array' })
  const folha = livro.Sheets[livro.SheetNames[0]]
  if (!folha) return []
  // `header: 1` devolve linhas de células, como o CSV — daí para a frente o
  // caminho é o mesmo para os dois formatos.
  return XLSX.utils.sheet_to_json(folha, { header: 1, blankrows: false, defval: '' })
}

/** O preço tal como vem escrito — «1.200,50 €», «1200.5», «1 200» — em número. */
export function lerPreco(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null

  let texto = String(valor ?? '')
    .replace(/[^\d,.\-]/g, '')
    .trim()
  if (!texto) return null

  // Com os dois separadores, o último a aparecer é o decimal.
  const virgula = texto.lastIndexOf(',')
  const ponto = texto.lastIndexOf('.')
  if (virgula >= 0 && ponto >= 0) {
    const decimal = virgula > ponto ? ',' : '.'
    const milhares = decimal === ',' ? '.' : ','
    texto = texto.split(milhares).join('').replace(decimal, '.')
  } else if (virgula >= 0) {
    // Só vírgulas: decimal se sobrarem uma ou duas casas, milhares se forem três.
    texto = texto.split(',').length === 2 && texto.length - virgula <= 3
      ? texto.replace(',', '.')
      : texto.split(',').join('')
  }

  const numero = Number.parseFloat(texto)
  return Number.isFinite(numero) ? numero : null
}

/**
 * Transforma as linhas em presentes prontos a gravar.
 *
 * Devolve também os avisos: linhas saltadas por não terem nome ou por o preço
 * não se perceber. Saltar em vez de rebentar é de propósito — uma folha com
 * uma linha estragada no meio importa-se na mesma, e o admin fica a saber
 * exatamente quais ficaram de fora.
 */
export function presentesDasLinhas(linhas) {
  if (!linhas || linhas.length < 2) {
    throw new Error('A folha tem de ter uma linha de cabeçalho e pelo menos um presente.')
  }

  const cabecalho = linhas[0].map(normalizar)
  const indice = {}
  for (const [campo, nomes] of Object.entries(COLUNAS)) {
    indice[campo] = cabecalho.findIndex((c) => nomes.includes(c))
  }

  if (indice.nome < 0 || indice.preco < 0) {
    throw new Error(
      'Faltam colunas: a folha precisa de uma coluna «nome» e outra «preço». '
        + 'As colunas «descrição» e «imagem» são opcionais.'
    )
  }

  const celula = (linha, campo) =>
    indice[campo] >= 0 ? String(linha[indice[campo]] ?? '').trim() : ''

  const presentes = []
  const avisos = []

  linhas.slice(1).forEach((linha, i) => {
    const numero = i + 2
    const nome = celula(linha, 'nome')
    if (!nome) {
      if (linha.some((v) => String(v ?? '').trim() !== '')) {
        avisos.push(`Linha ${numero}: sem nome — ficou de fora.`)
      }
      return
    }

    const preco = lerPreco(indice.preco >= 0 ? linha[indice.preco] : '')
    if (preco === null || preco < 0) {
      avisos.push(`Linha ${numero} (${nome}): preço em falta ou por perceber — ficou de fora.`)
      return
    }

    presentes.push({
      nome: nome.slice(0, 120),
      descricao: celula(linha, 'descricao').slice(0, 500),
      preco: Math.round(preco),
      imagem: celula(linha, 'imagem'),
    })
  })

  return { presentes, avisos }
}

/** Lê o ficheiro escolhido, seja ele Excel ou CSV. */
export async function lerFicheiroDePresentes(ficheiro) {
  const nome = (ficheiro?.name || '').toLowerCase()
  const excel = nome.endsWith('.xlsx') || nome.endsWith('.xls') || nome.endsWith('.xlsm')

  const linhas = excel ? await lerExcel(ficheiro) : lerCsv(await ficheiro.text())
  return presentesDasLinhas(linhas)
}

/** O modelo que o admin descarrega para saber que colunas escrever. */
export const MODELO_CSV = [
  ['nome', 'descricao', 'preco', 'imagem'],
  ['Sofá', 'Para a sala', '1000', ''],
  ['Tapete', '', '200', 'https://exemplo.pt/tapete.jpg'],
]
  .map((linha) => linha.map((v) => `"${v.replace(/"/g, '""')}"`).join(';'))
  .join('\r\n')
