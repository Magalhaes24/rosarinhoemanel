import { readFileSync } from 'node:fs'
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing'
import { addDoc, collection, doc, getDoc, getDocs, deleteDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

const ADMIN_UID = 'admin-de-teste'
const OUTRO_UID = 'intruso'

// As regras reais têm o UID do admin embutido. Para os testes, troca-se o
// marcador pelo UID de teste — o resto do ficheiro é exercitado tal e qual.
const regras = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8').replace(
  /'SUBSTITUIR_PELO_UID_DO_ADMIN'|'[0-9A-Za-z]{20,}'/,
  `'${ADMIN_UID}'`
)

let env

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'regras-teste',
    firestore: { rules: regras, host: '127.0.0.1', port: 8080 },
  })
})

after(async () => {
  await env?.cleanup()
})

const convidado = () => env.unauthenticatedContext().firestore()
const admin = () => env.authenticatedContext(ADMIN_UID).firestore()
const intruso = () => env.authenticatedContext(OUTRO_UID).firestore()

const rsvpValido = { nome: 'Maria Silva', presenca: 'sim', criadoEm: serverTimestamp() }
const presenteValido = {
  nome: 'João',
  presente: 'Torradeira',
  mensagem: 'Parabéns!',
  criadoEm: serverTimestamp(),
}

describe('rsvps — quem pode escrever', () => {
  it('convidado cria uma resposta válida', async () => {
    await assertSucceeds(addDoc(collection(convidado(), 'rsvps'), rsvpValido))
  })

  it('rejeita presenca fora de sim/nao', async () => {
    await assertFails(
      addDoc(collection(convidado(), 'rsvps'), { ...rsvpValido, presenca: 'talvez' })
    )
  })

  it('rejeita nome vazio', async () => {
    await assertFails(addDoc(collection(convidado(), 'rsvps'), { ...rsvpValido, nome: '' }))
  })

  it('rejeita nome só com espaços', async () => {
    await assertFails(addDoc(collection(convidado(), 'rsvps'), { ...rsvpValido, nome: '     ' }))
  })

  it('rejeita nome acima de 120 caracteres', async () => {
    await assertFails(
      addDoc(collection(convidado(), 'rsvps'), { ...rsvpValido, nome: 'a'.repeat(121) })
    )
  })

  it('rejeita campos a mais (tentativa de injetar dados)', async () => {
    await assertFails(
      addDoc(collection(convidado(), 'rsvps'), { ...rsvpValido, admin: true })
    )
  })

  it('rejeita campos em falta', async () => {
    await assertFails(addDoc(collection(convidado(), 'rsvps'), { nome: 'Ana' }))
  })

  it('rejeita data forjada pelo cliente', async () => {
    await assertFails(
      addDoc(collection(convidado(), 'rsvps'), { ...rsvpValido, criadoEm: new Date(2000, 0, 1) })
    )
  })

  it('rejeita nome que não é texto', async () => {
    await assertFails(addDoc(collection(convidado(), 'rsvps'), { ...rsvpValido, nome: 12345 }))
  })
})

describe('rsvps — quem pode ler', () => {
  before(async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await setDoc(doc(c.firestore(), 'rsvps/exemplo'), {
        nome: 'Ana',
        presenca: 'sim',
        criadoEm: new Date(),
      })
    })
  })

  it('convidado NÃO lê um documento', async () => {
    await assertFails(getDoc(doc(convidado(), 'rsvps/exemplo')))
  })

  it('convidado NÃO lista a coleção', async () => {
    await assertFails(getDocs(collection(convidado(), 'rsvps')))
  })

  it('utilizador autenticado que não é o admin NÃO lê', async () => {
    await assertFails(getDoc(doc(intruso(), 'rsvps/exemplo')))
  })

  it('utilizador autenticado que não é o admin NÃO lista', async () => {
    await assertFails(getDocs(collection(intruso(), 'rsvps')))
  })

  it('o admin lê', async () => {
    await assertSucceeds(getDoc(doc(admin(), 'rsvps/exemplo')))
  })

  it('o admin lista', async () => {
    await assertSucceeds(getDocs(collection(admin(), 'rsvps')))
  })
})

describe('rsvps — ninguém altera nem apaga', () => {
  before(async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await setDoc(doc(c.firestore(), 'rsvps/fixo'), {
        nome: 'Ana',
        presenca: 'sim',
        criadoEm: new Date(),
      })
    })
  })

  it('convidado não altera', async () => {
    await assertFails(updateDoc(doc(convidado(), 'rsvps/fixo'), { presenca: 'nao' }))
  })

  it('convidado não apaga', async () => {
    await assertFails(deleteDoc(doc(convidado(), 'rsvps/fixo')))
  })

  it('nem o admin altera pelo site', async () => {
    await assertFails(updateDoc(doc(admin(), 'rsvps/fixo'), { presenca: 'nao' }))
  })

  it('nem o admin apaga pelo site', async () => {
    await assertFails(deleteDoc(doc(admin(), 'rsvps/fixo')))
  })
})

describe('presentes', () => {
  it('convidado cria um presente válido', async () => {
    await assertSucceeds(addDoc(collection(convidado(), 'presentes'), presenteValido))
  })

  it('aceita mensagem vazia (é opcional)', async () => {
    await assertSucceeds(
      addDoc(collection(convidado(), 'presentes'), { ...presenteValido, mensagem: '' })
    )
  })

  it('rejeita mensagem acima de 1000 caracteres', async () => {
    await assertFails(
      addDoc(collection(convidado(), 'presentes'), {
        ...presenteValido,
        mensagem: 'x'.repeat(1001),
      })
    )
  })

  it('rejeita presente acima de 200 caracteres', async () => {
    await assertFails(
      addDoc(collection(convidado(), 'presentes'), {
        ...presenteValido,
        presente: 'x'.repeat(201),
      })
    )
  })

  it('rejeita presente vazio', async () => {
    await assertFails(
      addDoc(collection(convidado(), 'presentes'), { ...presenteValido, presente: '' })
    )
  })

  it('convidado NÃO lê', async () => {
    await assertFails(getDocs(collection(convidado(), 'presentes')))
  })

  it('o admin lê', async () => {
    await assertSucceeds(getDocs(collection(admin(), 'presentes')))
  })
})

describe('resto da base de dados fechado', () => {
  it('não se escreve numa coleção arbitrária', async () => {
    await assertFails(addDoc(collection(convidado(), 'qualquer'), { a: 1 }))
  })

  it('não se lê uma coleção arbitrária', async () => {
    await assertFails(getDocs(collection(convidado(), 'qualquer')))
  })

  it('nem o admin escreve numa coleção arbitrária', async () => {
    await assertFails(addDoc(collection(admin(), 'qualquer'), { a: 1 }))
  })

  it('nem o admin lê uma coleção arbitrária', async () => {
    await assertFails(getDocs(collection(admin(), 'qualquer')))
  })

  it('não se cria uma coleção "config" para escalar privilégios', async () => {
    await assertFails(setDoc(doc(intruso(), 'config/admin'), { uid: OUTRO_UID }))
  })
})

describe('sanidade', () => {
  it('o ficheiro de regras usado nos testes é o do repositório', () => {
    assert.ok(regras.includes('service cloud.firestore'))
    assert.ok(regras.includes(ADMIN_UID), 'o marcador do UID do admin foi substituído')
  })
})
