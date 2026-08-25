import { readFileSync } from 'node:fs'
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
import {
  presentesDoRascunho,
  porImportar,
  documentoDoPresente,
} from '../src/data/presentesDoRascunho.js'

/**
 * A importação da lista de presentes, corrida contra o emulador.
 *
 * Exercita o mesmo código que o botão «Importar a lista do rascunho» usa — as
 * funções vivem no ficheiro de dados exactamente para isto —, incluindo as
 * regras de segurança reais. É o mais perto que se chega de carregar no botão
 * sem ter a sessão do admin.
 */

const ADMIN_UID = 'admin-de-teste'
const COLECAO = 'presentes-casa'

const regras = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8').replace(
  /return \[[^\]]*\];/,
  `return ['${ADMIN_UID}'];`
)

let env

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'importar-teste',
    firestore: { rules: regras, host: '127.0.0.1', port: 8080 },
  })
})

after(async () => {
  await env?.cleanup()
})

/** Faz o que o botão faz: cria os que faltam, um a um e por ordem. */
async function importar(db, existentes) {
  const novos = porImportar(existentes)
  let ordem = (existentes.length ? Math.max(...existentes.map((i) => i.ordem ?? 0)) : 0) + 10
  for (const item of novos) {
    await addDoc(collection(db, COLECAO), {
      ...documentoDoPresente(item, ordem),
      criadoEm: serverTimestamp(),
    })
    ordem += 10
  }
  return novos.length
}

async function lista(db) {
  const snap = await getDocs(collection(db, COLECAO))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
}

describe('importar a lista de presentes do rascunho', () => {
  it('cria os 18 presentes, com fotografia e preço', async () => {
    await env.clearFirestore()
    const db = env.authenticatedContext(ADMIN_UID).firestore()

    const criados = await importar(db, [])
    assert.equal(criados, 18)

    const itens = await lista(db)
    assert.equal(itens.length, 18)
    assert.equal(itens[0].nome, 'Sofá')
    assert.equal(itens[0].preco, 1000)
    assert.equal(itens[0].imagem, '/images/presentes/sofa.jpg')
    assert.equal(itens.at(-1).nome, 'Conjunto de copos de água')

    // Nenhum fica sem o essencial.
    for (const item of itens) {
      assert.ok(item.nome, 'todos têm nome')
      assert.ok(item.imagem?.startsWith('/images/presentes/'), `${item.nome} tem fotografia`)
      assert.equal(typeof item.preco, 'number', `${item.nome} tem preço numérico`)
      assert.equal(item.reservado, false)
    }

    // A ordem gravada é a do rascunho.
    assert.deepEqual(
      itens.map((i) => i.nome),
      presentesDoRascunho.map((i) => i.nome)
    )
  })

  it('correr outra vez não duplica nada', async () => {
    await env.clearFirestore()
    const db = env.authenticatedContext(ADMIN_UID).firestore()

    await importar(db, [])
    const primeira = await lista(db)
    const criados = await importar(db, primeira)

    assert.equal(criados, 0)
    assert.equal((await lista(db)).length, 18)
  })

  it('as três almofadas contam como presentes diferentes', async () => {
    await env.clearFirestore()
    const db = env.authenticatedContext(ADMIN_UID).firestore()

    await importar(db, [])
    const almofadas = (await lista(db)).filter((i) => i.nome === 'Almofada')

    assert.equal(almofadas.length, 3)
    assert.deepEqual(
      almofadas.map((a) => a.preco).sort((a, b) => a - b),
      [13, 20, 40]
    )
  })

  it('respeita o que já lá estiver e continua a ordem', async () => {
    await env.clearFirestore()
    const db = env.authenticatedContext(ADMIN_UID).firestore()

    const meu = { nome: 'Sofá', preco: 1000, imagem: 'outra.jpg', ordem: 50 }
    await addDoc(collection(db, COLECAO), { ...meu, criadoEm: serverTimestamp() })

    const criados = await importar(db, await lista(db))
    assert.equal(criados, 17, 'o sofá que já lá estava não volta a entrar')

    const itens = await lista(db)
    assert.equal(itens.length, 18)
    assert.equal(itens[0].imagem, 'outra.jpg', 'o que já lá estava fica intacto')
    assert.ok(itens[1].ordem > itens[0].ordem, 'os novos entram a seguir')
  })

  it('quem não é admin não consegue importar', async () => {
    await env.clearFirestore()
    const db = env.unauthenticatedContext().firestore()

    await assert.rejects(() => importar(db, []))
    const admin = env.authenticatedContext(ADMIN_UID).firestore()
    assert.equal((await lista(admin)).length, 0)
  })
})
