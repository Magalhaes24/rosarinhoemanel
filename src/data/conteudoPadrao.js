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
  'nav.hoteis': 'Onde ficar?',

  'hero.nome1': 'Rosarinho',
  'hero.nome2': 'e Manel',
  'hero.data': '5 | 12 | 2026',

  'missa.titulo': 'Missa',
  'missa.local': 'Igreja de Santa Isabel, Lisboa',
  'missa.hora': '12:30',
  'missa.morada': 'Igreja de Santa Isabel, Lisboa',

  'copo.titulo': 'Copo d’água',
  'copo.local': 'Quinta de D. Carlos, Alenquer',
  'copo.hora': '14:30',
  'copo.morada': 'Quinta de D. Carlos, Alenquer',

  'mapas.legenda': 'Como chegar',

  'rsvp.destaque': 'Gostávamos muito que fizessem parte deste dia!',
  'rsvp.texto': 'Se ainda não o fizeram, pedimos que confirmem aqui a vossa presença.',
  'rsvp.tituloFormulario': 'Confirma aqui a tua presença',
  'rsvp.opcaoSim': 'Estarei presente',
  'rsvp.opcaoNao': 'Não poderei ir',

  'historia.texto': 'Deixamos aqui uma parte da nossa história,',
  'historia.destaque': 'para que nos possam conhecer melhor.',
  'historia.botao': 'Aqui!',

  'presentes.chamada': 'Lista de presentes',
  'presentes.titulo': 'Lista de presentes',
  'presentes.etiquetaJanela': 'Contribuição',
  'presentes.registar': 'Registar contribuição',
  'presentes.botaoCasa': 'Para a casa',
  'presentes.botaoLua': 'Lua de mel',

  'drivers.texto':
    'Para que todos se possam divertir sem preocupações, deixamos aqui um serviço de drivers.',
  'drivers.contactoTexto': 'Para organizarem tudo atempadamente falem com o',
  'drivers.contactoNome': 'Manel Sousa Guedes',
  'drivers.telefone': '967 590 817',

  // Sem título de origem: a página já se chama «Onde ficar?» no menu e o
  // título por cima da lista dizia duas vezes a mesma coisa. Escrever aqui
  // alguma coisa na administração fá-lo voltar.
  'hoteis.titulo': '',

  'hoteis.intro':
    'Aqui ficam algumas sugestões para quem estiver a pensar dormir perto da quinta.',
  'hoteis.verEspaco': 'Ver o hotel',
  'hoteis.chamadaTexto':
    'Para quem estiver a pensar dormir perto da quinta, deixamos aqui algumas sugestões de sítios onde ficar.',
  'hoteis.chamadaBotao': 'Aqui!',
  // Junta-se ao nome na procura do Google Maps, para o botão não cair numa
  // casa com o mesmo nome do outro lado do país.
  'hoteis.regiao': 'Alenquer',

  'hoteis.h1.nome': 'Dolce Campo Real',
  'hoteis.h1.tipo': 'Hotel',
  'hoteis.h1.telefone': '261 960 900',
  'hoteis.h1.email': 'camporeal.reservations@dolce.com',
  'hoteis.h1.site': 'https://www.dolcecamporeal.com',

  'hoteis.h2.nome': 'Stay Hotels',
  'hoteis.h2.tipo': 'Hotel',
  'hoteis.h2.telefone': '261 314 232',
  'hoteis.h2.email': '',
  'hoteis.h2.site': 'https://www.stayhotels.pt/torres-vedras-centro/',

  'hoteis.h3.nome': 'Arcos Hotel',
  'hoteis.h3.tipo': 'Hotel',
  'hoteis.h3.telefone': '261 312 489',
  'hoteis.h3.email': 'reservas@arcoshotel.pt / geral@arcoshotel.pt',
  'hoteis.h3.site': 'https://www.arcoshotel.pt',

  'hoteis.h4.nome': 'Quinta da Carlota',
  'hoteis.h4.tipo': 'Casa',
  'hoteis.h4.telefone': '926 384 443',
  'hoteis.h4.email': 'reservas@quintadacarlota.com',
  'hoteis.h4.site': '',





  'casa.titulo': 'Para a casa',
  'casa.intro':
    'Estamos muito felizes por poder contar convosco para celebrar este dia e dar início a esta nova fase da nossa vida.\n\nTivemos a sorte de encontrar um T2 na Ajuda. A casa já vem mobilada, mas ainda há algumas coisas que gostaríamos de acrescentar para a tornar mais nossa e prepará-la para esta nova fase. Para quem nos quiser ajudar neste projeto, deixamos aqui algumas sugestões.\n\nComo funciona:\n\n1.º Escolher um presente e clicar em “Oferecer”\n2.º Preencher o formulário com o vosso nome e o presente escolhido (podem contribuir apenas com uma parte do valor)\n3.º Fazer a transferência para os dados indicados no formulário',
  'casa.vazio': 'A lista de presentes está a ser preparada.',
  'casa.verMais': 'Ver mais presentes',
  'casa.verMenos': 'Ver menos',
  'lua.titulo': 'Lua de mel',
  'lua.intro':
    'Também nos podem ajudar com uma contribuição para a nossa viagem de Lua de Mel.',
  'lua.botao': 'Contribuir',
  'lua.destinos': 'Peru, Colombia, Panamá',

  'contribuicao.texto1': 'A melhor forma de nos ajudarem é com uma contribuição para o IBAN abaixo.',
  'contribuicao.texto2':
    'Para conseguirmos agradecer a todos, deixem por favor uma nota com o presente que escolheram!',
  // Dados para pagar. Cada cartão só aparece se tiver valores: enquanto o
  // Revolut não tiver tag, por exemplo, fica de fora em vez de vazio. O MB Way
  // aceita dois números, um de cada um, como no dos noivos que serviu de
  // referência — há quem tenha a conta num banco e o telemóvel noutro.
  'pagamento.titulo': 'Métodos de pagamento',
  'pagamento.mbway1.nome': '',
  'pagamento.mbway1.numero': '',
  'pagamento.mbway2.nome': '',
  'pagamento.mbway2.numero': '',
  'pagamento.revolut.tag': '',
  'pagamento.iban': '',
  'pagamento.titular': '',
  'pagamento.nota':
    'Deixem por favor o vosso nome na descrição, para conseguirmos agradecer a todos.',

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
  'form.campoNome': 'Nome',
  'form.enviar': 'Enviar',
  'form.aEnviar': 'A enviar…',

  'rsvp.campoPresenca': 'Presença',
  'rsvp.ok': 'Recebido, obrigado! Até 5 de dezembro.',
  'rsvp.erro': 'Preenche o nome e escolhe uma opção — se o erro persistir, avisa-nos.',

  'presente.campoPresente': 'Presente',
  'presente.campoMensagem': 'Mensagem',
  'presente.ok': 'Obrigado! Vamos poder agradecer-vos como deve ser.',
  'presente.erro': 'Preenche pelo menos o nome e o presente.',

  'loja.reservado': 'Já oferecido',
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
  'ano2018.fotografia': '/images/mapa-2018.jpeg',
  'ano2026.fotografia': '/images/noivado-2026.jpeg',
}

export const imagensEditaveis = [
  ['hero.casal', 'Início — fotografia do casal'],
  ['missa.fundo', 'Missa — fundo'],
  ['copo.fundo', 'Copo d’água — fundo'],
  ['historia.arco', 'História — fotografia em arco'],
  ['drivers.carros', 'Drivers — carros'],
  ['ano2018.fotografia', '2018 — fotografia'],
  ['ano2026.fotografia', '2026 — fotografia'],
]

/**
 * Os hotéis, pela ordem em que aparecem no site.
 *
 * A secção e o editor de textos leem esta mesma lista, para não ficarem a
 * divergir quando se acrescentar ou tirar um.
 */
/**
 * Os hotéis que saem na página. Eram oito e ficaram quatro — a lista completa
 * assustava mais do que ajudava. Acrescentar aqui um `h5` e escrever-lhe os
 * textos na administração chega para o trazer de volta.
 */
export const hoteisIds = ['h1', 'h2', 'h3', 'h4']

/** Etiquetas legíveis para o editor de textos da administração. */
export const gruposDeTexto = [
  { titulo: 'Menu', chaves: ['nav.inicio', 'nav.noivos', 'nav.presentes', 'nav.hoteis'] },
  { titulo: 'Início', chaves: ['hero.nome1', 'hero.nome2', 'hero.data'] },
  { titulo: 'Missa', chaves: ['missa.titulo', 'missa.local', 'missa.hora', 'missa.morada'] },
  { titulo: 'Copo d’água', chaves: ['copo.titulo', 'copo.local', 'copo.hora', 'copo.morada'] },
  {
    titulo: 'Botões de indicações',
    chaves: ['mapas.legenda'],
  },
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
    chaves: [
      'presentes.chamada',
      'presentes.titulo',
      'presentes.botaoCasa',
      'presentes.botaoLua',
      'presentes.etiquetaJanela',
      'presentes.registar',
    ],
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
  {
    titulo: 'Onde ficar',
    chaves: [
      'hoteis.titulo',
      'hoteis.intro',
      'hoteis.chamadaTexto',
      'hoteis.chamadaBotao',
      'hoteis.verEspaco',
      'hoteis.regiao',
      ...hoteisIds.flatMap((n) => [
        `hoteis.${n}.nome`,
        `hoteis.${n}.tipo`,
        `hoteis.${n}.telefone`,
        `hoteis.${n}.email`,
        `hoteis.${n}.site`,
      ]),
    ],
  },
  {
    titulo: 'Página dos presentes',
    chaves: [
      'casa.titulo',
      'casa.intro',
      'casa.vazio',
      'casa.verMais',
      'casa.verMenos',
      'lua.titulo',
      'lua.intro',
      'lua.botao',
      'lua.destinos',
      'contribuicao.texto1',
      'contribuicao.texto2',
      'pagamento.titulo',
      'pagamento.mbway1.nome',
      'pagamento.mbway1.numero',
      'pagamento.mbway2.nome',
      'pagamento.mbway2.numero',
      'pagamento.revolut.tag',
      'pagamento.iban',
      'pagamento.titular',
      'pagamento.nota',
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
  {
    titulo: 'Formulários — comuns',
    chaves: ['form.campoNome', 'form.enviar', 'form.aEnviar', 'form.nota'],
  },
  {
    titulo: 'Formulário da presença',
    chaves: ['rsvp.campoPresenca', 'rsvp.ok', 'rsvp.erro'],
  },
  {
    titulo: 'Formulário do presente',
    chaves: [
      'presente.campoPresente',
      'presente.campoMensagem',
      'presente.ok',
      'presente.erro',
    ],
  },
  { titulo: 'Lista de presentes (loja)', chaves: ['loja.reservado'] },
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
