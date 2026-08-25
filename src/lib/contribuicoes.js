/**
 * As contas das contribuições, sem React nem Firestore pelo meio.
 *
 * A janela do presente grava o mesmo acontecimento em dois sítios: o valor vai
 * para `contribuicoes`, que é pública e alimenta as barras de progresso, e o
 * nome de quem ofereceu vai para `presentes`, que só a administração lê. Estas
 * funções são o que volta a juntar os dois lados — e vivem aqui, fora dos
 * componentes, para se poderem pôr à prova.
 */

/** O identificador que a lua de mel usa nas contribuições. */
export const ID_LUA = 'luaDeMel'

/**
 * O nome do presente escrito no registo de quem ofereceu.
 *
 * O campo vem como «Sofá — 50 €». O travessão é o separador; um nome que o
 * tenha dentro parte-se no primeiro, e é por isso que se compara sempre pelo
 * nome inteiro do presente e nunca ao contrário.
 */
export function nomeDoPresente(texto) {
  return String(texto || '')
    .split('—')[0]
    .trim()
}

/** O valor escrito no mesmo registo, como texto — «50 €». */
export function valorDaOferta(texto) {
  return String(texto || '')
    .split('—')
    .slice(1)
    .join('—')
    .trim()
}

/** As ofertas agrupadas pelo nome do presente que trazem escrito. */
export function agruparOfertas(ofertas) {
  const mapa = {}
  for (const o of ofertas || []) {
    const chave = nomeDoPresente(o.presente)
    if (!mapa[chave]) mapa[chave] = []
    mapa[chave].push(o)
  }
  return mapa
}

/** Quanto já foi contribuído para cada presente. */
export function somarPorPresente(contribuicoes) {
  const soma = {}
  for (const c of contribuicoes || []) {
    const valor = Number(c.valor)
    if (!c.presenteId || !Number.isFinite(valor)) continue
    soma[c.presenteId] = (soma[c.presenteId] || 0) + valor
  }
  return soma
}

/**
 * Os números de abertura da administração.
 *
 * Só os presentes com meta contam para «completos»: a lua de mel não tem
 * preço, por isso nunca estaria completa nem por completar — apareceria como
 * uma dívida eterna na conta.
 */
export function resumo(contribuicoes = [], presentes = []) {
  const porPresente = somarPorPresente(contribuicoes)
  const total = (contribuicoes || []).reduce((s, c) => s + (Number(c.valor) || 0), 0)

  const comMeta = (presentes || []).filter((p) => Number(p.preco) > 0)
  const completos = comMeta.filter((p) => (porPresente[p.id] || 0) >= Number(p.preco)).length

  const quantas = (contribuicoes || []).length

  return {
    total,
    porPresente,
    completos,
    porCompletar: comMeta.length - completos,
    quantas,
    media: quantas ? Math.round(total / quantas) : 0,
  }
}

/** O estado de um presente, para a etiqueta do cartão. */
export function estadoDoPresente(contribuido, meta) {
  if (!(Number(meta) > 0)) return 'aberto'
  if (contribuido >= Number(meta)) return 'completo'
  return contribuido > 0 ? 'meio' : 'inicio'
}
