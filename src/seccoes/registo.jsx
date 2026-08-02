import { tiposNativos } from './nativas.jsx'
import { tiposPersonalizados } from './personalizadas.jsx'

/**
 * Registo único de tipos de secção.
 *
 * `nativo: true` marca os blocos desenhados a partir do rascunho: podem ser
 * reordenados e escondidos, mas não têm campos de forma — o texto edita-se no
 * separador «Textos». Os restantes são os que o admin pode acrescentar.
 */
export const registo = {
  ...Object.fromEntries(
    Object.entries(tiposNativos).map(([id, def]) => [id, { ...def, nativo: true, campos: [] }])
  ),
  ...tiposPersonalizados,
}

/** Só os que fazem sentido no menu «acrescentar secção». */
export const tiposAcrescentaveis = Object.entries(tiposPersonalizados).map(([id, def]) => ({
  id,
  ...def,
}))

/** Desenha uma secção da lista. Um tipo desconhecido é ignorado, não rebenta. */
export function Seccao({ seccao }) {
  const def = registo[seccao.tipo]
  if (!def || seccao.escondida) return null
  const { Componente } = def
  return <Componente dados={seccao} />
}

/** Desenha uma página inteira a partir da sua lista de secções. */
export function Pagina({ seccoes }) {
  return seccoes.map((s) => <Seccao key={s.id} seccao={s} />)
}
