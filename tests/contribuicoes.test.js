import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  ID_LUA,
  agruparOfertas,
  estadoDoPresente,
  nomeDoPresente,
  resumo,
  somarPorPresente,
  valorDaOferta,
} from '../src/lib/contribuicoes.js'

/**
 * As contas do painel das contribuições.
 *
 * São elas que dizem ao admin quanto já foi angariado, o que está completo e
 * quem ofereceu o quê — e é tudo derivado de dois registos que não se
 * conhecem um ao outro, por isso vale a pena prendê-las com testes.
 */

const PRESENTES = [
  { id: 'sofa', nome: 'Sofá', preco: 1000 },
  { id: 'tapete', nome: 'Tapete', preco: 200 },
  { id: 'copos', nome: 'Conjunto de copos de água', preco: 36 },
]

describe('ler o registo de quem ofereceu', () => {
  it('separa o nome do presente do valor', () => {
    assert.equal(nomeDoPresente('Sofá — 50 €'), 'Sofá')
    assert.equal(valorDaOferta('Sofá — 50 €'), '50 €')
  })

  it('aguenta um registo sem valor ou vazio', () => {
    assert.equal(nomeDoPresente('Sofá'), 'Sofá')
    assert.equal(valorDaOferta('Sofá'), '')
    assert.equal(nomeDoPresente(''), '')
    assert.equal(nomeDoPresente(undefined), '')
  })

  it('agrupa as pessoas pelo presente que escolheram', () => {
    const grupos = agruparOfertas([
      { id: 'a', nome: 'Ana', presente: 'Sofá — 50 €' },
      { id: 'b', nome: 'Bruno', presente: 'Sofá — 100 €' },
      { id: 'c', nome: 'Carla', presente: 'Lua de mel — 200 €' },
    ])

    assert.deepEqual(Object.keys(grupos).sort(), ['Lua de mel', 'Sofá'])
    assert.deepEqual(
      grupos['Sofá'].map((o) => o.nome),
      ['Ana', 'Bruno']
    )
  })
})

describe('somar as contribuições', () => {
  it('junta as de cada presente', () => {
    const soma = somarPorPresente([
      { presenteId: 'sofa', valor: 50 },
      { presenteId: 'sofa', valor: 100 },
      { presenteId: ID_LUA, valor: 200 },
    ])
    assert.deepEqual(soma, { sofa: 150, [ID_LUA]: 200 })
  })

  it('ignora registos estragados em vez de dar NaN', () => {
    const soma = somarPorPresente([
      { presenteId: 'sofa', valor: 50 },
      { presenteId: 'sofa', valor: 'muito' },
      { valor: 30 },
      {},
    ])
    assert.deepEqual(soma, { sofa: 50 })
  })
})

describe('os números de abertura', () => {
  it('conta o total, os completos e a média', () => {
    const r = resumo(
      [
        { presenteId: 'sofa', valor: 400 },
        { presenteId: 'tapete', valor: 200 },
        { presenteId: 'copos', valor: 40 },
        { presenteId: ID_LUA, valor: 160 },
      ],
      PRESENTES
    )

    assert.equal(r.total, 800)
    assert.equal(r.quantas, 4)
    assert.equal(r.media, 200)
    // Tapete bateu certo, copos passou a meta; o sofá ainda não.
    assert.equal(r.completos, 2)
    assert.equal(r.porCompletar, 1)
  })

  it('a lua de mel não conta como presente por completar', () => {
    const r = resumo([{ presenteId: ID_LUA, valor: 500 }], [
      ...PRESENTES,
      { id: ID_LUA, nome: 'Lua de mel', preco: 0 },
    ])
    assert.equal(r.completos, 0)
    assert.equal(r.porCompletar, 3, 'só os três com meta é que contam')
  })

  it('sem contribuições não divide por zero', () => {
    const r = resumo([], PRESENTES)
    assert.equal(r.total, 0)
    assert.equal(r.media, 0)
    assert.equal(r.completos, 0)
  })

  it('aguenta ser chamado sem nada', () => {
    const r = resumo()
    assert.equal(r.total, 0)
    assert.equal(r.media, 0)
    assert.equal(r.porCompletar, 0)
  })
})

describe('o estado de cada presente', () => {
  it('vai de «a começar» a «completo»', () => {
    assert.equal(estadoDoPresente(0, 100), 'inicio')
    assert.equal(estadoDoPresente(40, 100), 'meio')
    assert.equal(estadoDoPresente(100, 100), 'completo')
    assert.equal(estadoDoPresente(150, 100), 'completo', 'passar da meta continua completo')
  })

  it('sem meta fica «em aberto» — é o caso da lua de mel', () => {
    assert.equal(estadoDoPresente(0, 0), 'aberto')
    assert.equal(estadoDoPresente(500, 0), 'aberto')
    assert.equal(estadoDoPresente(500, undefined), 'aberto')
  })
})
