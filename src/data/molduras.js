/**
 * Molduras de exemplo para uma galeria ainda sem fotografias.
 *
 * Servem só para se perceber o aspeto que a secção vai ter. Assim que a
 * galeria receber a primeira fotografia, desaparecem sozinhas.
 */
export const molduras2022 = ['3 / 4', '4 / 3', '3 / 4', '1 / 1', '4 / 3', '3 / 4'].map(
  (proporcao, i) => ({ id: `moldura-${i + 1}`, placeholder: true, proporcao })
)
