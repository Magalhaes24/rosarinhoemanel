/**
 * Carrosséis do site, com as fotografias que vieram do rascunho.
 *
 * Cada galeria é uma lista de endereços. O admin pode acrescentar, remover e
 * reordenar; enquanto não mexer, é isto que se vê.
 */

export const galeriasPadrao = {
  infancia: [
    '/images/infancia-11.png',
    '/images/infancia-10.png',
    '/images/infancia-01.png',
    '/images/infancia-07.png',
    '/images/infancia-02.png',
    '/images/infancia-06.png',
    '/images/infancia-03.png',
    '/images/infancia-05.png',
    '/images/infancia-08.png',
    '/images/infancia-04.png',
    '/images/infancia-09.png',
  ],

  // Os anos de namoro ainda não têm fotografias — as molduras de exemplo estão
  // em src/data/molduras.js.
  namoro: [],

  luaDeMel: [
    '/images/lua-peru-1.jpeg',
    '/images/lua-peru-2.jpeg',
    '/images/lua-colombia-1.jpeg',
    '/images/lua-colombia-2.jpeg',
    '/images/lua-panama.jpeg',
  ],
}

export const galeriasEditaveis = [
  ['infancia', 'Noivos — infância'],
  ['namoro', 'Noivos — anos de namoro'],
  ['luaDeMel', 'Presentes — destinos da lua de mel'],
]
