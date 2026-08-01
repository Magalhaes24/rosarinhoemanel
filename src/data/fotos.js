// Fotografias dos carrosséis.
// Para acrescentar mais, basta copiar o ficheiro para /public/images
// e adicionar uma linha ao array correspondente.

export const fotosInfancia = [
  { src: '/images/infancia-11.png', alt: 'Rosarinho em criança' },
  { src: '/images/infancia-10.png', alt: 'Manel em criança' },
  { src: '/images/infancia-01.png', alt: 'Rosarinho e Manel em criança' },
  { src: '/images/infancia-07.png', alt: 'Rosarinho em criança' },
  { src: '/images/infancia-02.png', alt: 'Manel em criança' },
  { src: '/images/infancia-06.png', alt: 'Rosarinho em criança' },
  { src: '/images/infancia-03.png', alt: 'Manel em criança' },
  { src: '/images/infancia-05.png', alt: 'Rosarinho em criança' },
  { src: '/images/infancia-08.png', alt: 'Manel em criança' },
  { src: '/images/infancia-04.png', alt: 'Rosarinho e Manel' },
  { src: '/images/infancia-09.png', alt: 'Rosarinho e Manel' },
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
  { src: '/images/lua-peru-1.jpeg', alt: 'Machu Picchu, Peru' },
  { src: '/images/lua-peru-2.jpeg', alt: 'Ruas do Peru' },
  { src: '/images/lua-colombia-1.jpeg', alt: 'Bogotá, Colômbia' },
  { src: '/images/lua-colombia-2.jpeg', alt: 'Ilhas da Colômbia' },
  { src: '/images/lua-panama.jpeg', alt: 'Canal do Panamá' },
]
