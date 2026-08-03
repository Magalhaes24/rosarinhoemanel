/**
 * Conteúdo por omissão do site — exatamente o que foi medido do rascunho.
 *
 * É isto que se vê antes de o admin editar seja o que for, e é o que continua
 * a ver-se se o Firestore estiver indisponível. O documento `conteudo/site`
 * sobrepõe-se a estes valores campo a campo: o que o admin não tocar continua
 * a vir daqui.
 */

export const temaPadrao = {
  // Cores
  verde: '#94b17a',
  verdeFundo: '#94b079',
  azul: '#95b9d4',
  creme: '#efe8e3',
  creme2: '#efe7dd',
  cremeNav: '#e0d4cb',
  cremeTexto: '#efe9e4',
  dourado: '#926f1b',
  douradoBotao: '#bea880',
  castanho: '#8d7050',
  castanhoEscuro: '#4a3a2c',
  navy: '#272d41',
  oliva: '#434431',
  quasePreto: '#292621',
  botaoCreme: '#e7d9bc',

  // Tipografia
  fonteTitulos: "'Lovelace Text', 'Playfair Display', Georgia, serif",
  fonteCorpo: "'Garet', 'Poppins', 'Segoe UI', sans-serif",
  fonteFormularios: "'The Seasons', 'Cormorant Garamond', Georgia, serif",

  // Escalas — multiplicam os tamanhos do rascunho
  escalaTitulos: 1,
  escalaCorpo: 1,
  respiro: 1.25,
}

export const textosPadrao = {
  'nav.inicio': 'Por onde começar?',
  'nav.noivos': 'Quem são os noivos?',
  'nav.presentes': 'O que dar?',

  'hero.nome1': 'Rosarinho',
  'hero.nome2': 'e Manel',
  'hero.data': '5 | 12 | 2026',

  'missa.titulo': 'Missa',
  'missa.local': 'Igreja de Santa Isabel, Lisboa',
  'missa.hora': '12:30',

  'copo.titulo': 'Copo d’água',
  'copo.local': 'Quinta de D. Carlos, Alenquer',
  'copo.hora': '14:30',

  'rsvp.destaque': 'Gostávamos muito que fizessem parte deste dia!',
  'rsvp.texto': 'Se ainda não o fizeram, pedimos que confirmem aqui a vossa presença.',
  'rsvp.tituloFormulario': 'Confirma aqui a tua presença',
  'rsvp.opcaoSim': 'Estarei presente',
  'rsvp.opcaoNao': 'Não poderei ir',

  'historia.texto': 'Deixamos aqui uma parte da nossa história,',
  'historia.destaque': 'para que nos possam conhecer melhor.',
  'historia.botao': 'Aqui!',

  'presentes.titulo': 'Lista de presentes',
  'presentes.botaoCasa': 'Para a casa',
  'presentes.botaoLua': 'Lua de mel',

  'drivers.texto':
    'Para que todos se possam divertir sem preocupações, deixamos aqui um serviço de drivers.',
  'drivers.contactoTexto': 'Para organizarem tudo atempadamente falem com o',
  'drivers.contactoNome': 'Manel Sousa Guedes',
  'drivers.telefone': '967 590 817',

  'hoteis.titulo': 'Onde\nficar?\nHoteis',

  'casa.titulo': 'Para a casa',
  'casa.vazio': 'A lista de presentes está a ser preparada.',
  'lua.titulo': 'Lua de mel',
  'lua.destinos': 'Peru, Colombia, Panamá',

  'contribuicao.texto1': 'A melhor forma de nos ajudarem é com uma contribuição para o IBAN abaixo.',
  'contribuicao.texto2':
    'Para conseguirmos agradecer a todos, deixem por favor uma nota com o presente que escolheram!',
  'contribuicao.iban': 'IBAN:',

  'ano2018.numero': '2018',
  'ano2018.texto': 'Conhecemos-nos em agosto de 2018, no campo do MAPA.',
  'ano2022.numero': '2022',
  'ano2022.texto':
    'Depois de 4 anos de amizade, começámos a namorar no dia 13 de agosto de 2022. Aqui estão algumas fotografias dos anos que se seguiram.',
  'ano2026.numero': '2026',
  'ano2026.texto':
    'Ficámos noivos no dia 10 de Janeiro deste ano! No santuário da Peninha, em Sintra',

  'noivos.titulo': 'Rosarinho e Manel',

  'form.nota': 'Os teus dados servem apenas para a organização do casamento e não são partilhados.',
}

/**
 * Fotografias fixas do site. As chaves são estáveis: mudar o ficheiro por
 * baixo não obriga a mexer em nada, e o admin pode substituir cada uma por
 * outra sem tocar no código.
 *
 * Os caminhos levam o prefixo de instalação em tempo de execução (ver
 * `resolverImagem` em src/lib/conteudo.jsx), para continuarem a funcionar
 * quando o site vive num subdiretório.
 */
export const imagensPadrao = {
  'hero.casal': '/images/hero-casal.png',
  'missa.fundo': '/images/igreja.png',
  'copo.fundo': '/images/quinta.png',
  'historia.arco': '/images/casal-arco.jpeg',
  'drivers.carros': '/images/carros.png',
  'ano2018.foto': '/images/mapa-2018.jpeg',
  'ano2026.foto': '/images/noivado-2026.jpeg',
}

export const imagensEditaveis = [
  ['hero.casal', 'Início — fotografia do casal'],
  ['missa.fundo', 'Missa — fundo'],
  ['copo.fundo', 'Copo d’água — fundo'],
  ['historia.arco', 'História — fotografia em arco'],
  ['drivers.carros', 'Drivers — carros'],
  ['ano2018.foto', '2018 — fotografia'],
  ['ano2026.foto', '2026 — fotografia'],
]

/** Etiquetas legíveis para o editor de textos da administração. */
export const gruposDeTexto = [
  { titulo: 'Menu', chaves: ['nav.inicio', 'nav.noivos', 'nav.presentes'] },
  { titulo: 'Início', chaves: ['hero.nome1', 'hero.nome2', 'hero.data'] },
  { titulo: 'Missa', chaves: ['missa.titulo', 'missa.local', 'missa.hora'] },
  { titulo: 'Copo d’água', chaves: ['copo.titulo', 'copo.local', 'copo.hora'] },
  {
    titulo: 'Confirmação de presença',
    chaves: [
      'rsvp.destaque',
      'rsvp.texto',
      'rsvp.tituloFormulario',
      'rsvp.opcaoSim',
      'rsvp.opcaoNao',
    ],
  },
  { titulo: 'História', chaves: ['historia.texto', 'historia.destaque', 'historia.botao'] },
  {
    titulo: 'Lista de presentes',
    chaves: ['presentes.titulo', 'presentes.botaoCasa', 'presentes.botaoLua'],
  },
  {
    titulo: 'Drivers',
    chaves: [
      'drivers.texto',
      'drivers.contactoTexto',
      'drivers.contactoNome',
      'drivers.telefone',
    ],
  },
  { titulo: 'Onde ficar', chaves: ['hoteis.titulo'] },
  {
    titulo: 'Página dos presentes',
    chaves: [
      'casa.titulo',
      'casa.vazio',
      'lua.titulo',
      'lua.destinos',
      'contribuicao.texto1',
      'contribuicao.texto2',
      'contribuicao.iban',
    ],
  },
  {
    titulo: 'Página dos noivos',
    chaves: [
      'noivos.titulo',
      'ano2018.numero',
      'ano2018.texto',
      'ano2022.numero',
      'ano2022.texto',
      'ano2026.numero',
      'ano2026.texto',
    ],
  },
  { titulo: 'Formulários', chaves: ['form.nota'] },
]

/** Nome legível de cada cor, para o editor de tema. */
export const coresEditaveis = [
  ['verde', 'Verde'],
  ['verdeFundo', 'Verde de fundo'],
  ['azul', 'Azul'],
  ['creme', 'Creme'],
  ['creme2', 'Creme alternativo'],
  ['cremeNav', 'Creme do menu'],
  ['cremeTexto', 'Texto sobre cor'],
  ['dourado', 'Dourado'],
  ['douradoBotao', 'Dourado dos botões'],
  ['castanho', 'Castanho'],
  ['castanhoEscuro', 'Castanho escuro'],
  ['navy', 'Azul-escuro'],
  ['oliva', 'Verde-oliva'],
  ['quasePreto', 'Quase preto'],
  ['botaoCreme', 'Creme dos botões'],
]

/** Ligação entre as chaves do tema e as variáveis CSS que o site usa. */
export const variavelCss = {
  verde: '--verde',
  verdeFundo: '--verde-fundo',
  azul: '--azul',
  creme: '--creme',
  creme2: '--creme-2',
  cremeNav: '--creme-nav',
  cremeTexto: '--creme-texto',
  dourado: '--dourado',
  douradoBotao: '--dourado-botao',
  castanho: '--castanho',
  castanhoEscuro: '--castanho-escuro',
  navy: '--navy',
  oliva: '--oliva',
  quasePreto: '--quase-preto',
  botaoCreme: '--botao-creme',
  fonteTitulos: '--serif',
  fonteCorpo: '--sans',
  fonteFormularios: '--form-serif',
  escalaTitulos: '--escala-titulos',
  escalaCorpo: '--escala-corpo',
  respiro: '--respiro',
}
