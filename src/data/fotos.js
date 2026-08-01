import { caminho } from '../lib/caminho.js'

// Fotografias dos carrosséis.
// Para acrescentar mais, basta copiar o ficheiro para /public/images
// e adicionar uma linha ao array correspondente.
//
// `caminho()` põe o prefixo de instalação à frente — necessário quando o site
// não vive na raiz do domínio (ver src/lib/caminho.js).

export const fotosInfancia = [
  { src: caminho('/images/infancia-11.png'), alt: 'Rosarinho em criança' },
  { src: caminho('/images/infancia-10.png'), alt: 'Manel em criança' },
  { src: caminho('/images/infancia-01.png'), alt: 'Rosarinho e Manel em criança' },
  { src: caminho('/images/infancia-07.png'), alt: 'Rosarinho em criança' },
  { src: caminho('/images/infancia-02.png'), alt: 'Manel em criança' },
  { src: caminho('/images/infancia-06.png'), alt: 'Rosarinho em criança' },
  { src: caminho('/images/infancia-03.png'), alt: 'Manel em criança' },
  { src: caminho('/images/infancia-05.png'), alt: 'Rosarinho em criança' },
  { src: caminho('/images/infancia-08.png'), alt: 'Manel em criança' },
  { src: caminho('/images/infancia-04.png'), alt: 'Rosarinho e Manel' },
  { src: caminho('/images/infancia-09.png'), alt: 'Rosarinho e Manel' },
]

// Fotografias dos anos de namoro (2022 →). Ainda por acrescentar.
export const fotosNamoro = []

// Enquanto `fotosNamoro` estiver vazio mostram-se estas molduras, só para se
// perceber o aspeto que a secção vai ter. Assim que acrescentares a primeira
// fotografia acima, desaparecem sozinhas — não é preciso mexer aqui.
export const molduras2022 = ['3 / 4', '4 / 3', '3 / 4', '1 / 1', '4 / 3', '3 / 4'].map(
  (proporcao, i) => ({ id: `moldura-${i + 1}`, placeholder: true, proporcao })
)

export const fotosLuaDeMel = [
  { src: caminho('/images/lua-peru-1.jpeg'), alt: 'Machu Picchu, Peru' },
  { src: caminho('/images/lua-peru-2.jpeg'), alt: 'Ruas do Peru' },
  { src: caminho('/images/lua-colombia-1.jpeg'), alt: 'Bogotá, Colômbia' },
  { src: caminho('/images/lua-colombia-2.jpeg'), alt: 'Ilhas da Colômbia' },
  { src: caminho('/images/lua-panama.jpeg'), alt: 'Canal do Panamá' },
]
