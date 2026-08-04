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
const SEGUNDO_ADMIN_UID = 'segundo-admin-de-teste'
const OUTRO_UID = 'intruso'

// As regras reais têm os UIDs dos administradores embutidos. Para os testes
// troca-se a lista inteira pelas de teste — o resto do ficheiro é exercitado
// tal e qual, incluindo a verificação de pertença à lista.
const regras = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8').replace(
  /return \[[^\]]*\];/,
  `return ['${ADMIN_UID}', '${SEGUNDO_ADMIN_UID}'];`
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
const segundoAdmin = () => env.authenticatedContext(SEGUNDO_ADMIN_UID).firestore()
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

describe('rsvps — só o admin altera e apaga', () => {
  before(async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      const f = c.firestore()
      await setDoc(doc(f, 'rsvps/fixo'), { nome: 'Ana', presenca: 'sim', criadoEm: new Date() })
      await setDoc(doc(f, 'rsvps/paraApagar'), {
        nome: 'Rui',
        presenca: 'nao',
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

  it('autenticado que não é o admin não altera', async () => {
    await assertFails(updateDoc(doc(intruso(), 'rsvps/fixo'), { presenca: 'nao' }))
  })

  it('autenticado que não é o admin não apaga', async () => {
    await assertFails(deleteDoc(doc(intruso(), 'rsvps/fixo')))
  })

  it('o admin altera', async () => {
    await assertSucceeds(updateDoc(doc(admin(), 'rsvps/fixo'), { presenca: 'nao' }))
  })

  it('o admin apaga', async () => {
    await assertSucceeds(deleteDoc(doc(admin(), 'rsvps/paraApagar')))
  })
})

describe('conteudo do site', () => {
  before(async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await setDoc(doc(c.firestore(), 'conteudo/site'), { textos: { 'hero.data': 'x' } })
    })
  })

  it('qualquer pessoa lê (é o que o site mostra)', async () => {
    await assertSucceeds(getDoc(doc(convidado(), 'conteudo/site')))
  })

  it('convidado NÃO escreve', async () => {
    await assertFails(setDoc(doc(convidado(), 'conteudo/site'), { textos: { a: 'b' } }))
  })

  it('autenticado que não é o admin NÃO escreve', async () => {
    await assertFails(setDoc(doc(intruso(), 'conteudo/site'), { textos: { a: 'b' } }))
  })

  it('o admin escreve', async () => {
    await assertSucceeds(
      setDoc(doc(admin(), 'conteudo/site'), { textos: { 'hero.data': '6 | 12 | 2026' } })
    )
  })
})

describe('lista de presentes «Para a casa»', () => {
  const item = { nome: 'Torradeira', descricao: 'Para as manhãs', preco: 40, ordem: 10 }

  before(async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await setDoc(doc(c.firestore(), 'presentes-casa/exemplo'), item)
    })
  })

  it('qualquer pessoa lê a lista', async () => {
    await assertSucceeds(getDocs(collection(convidado(), 'presentes-casa')))
  })

  it('convidado NÃO acrescenta', async () => {
    await assertFails(addDoc(collection(convidado(), 'presentes-casa'), item))
  })

  it('convidado NÃO altera', async () => {
    await assertFails(updateDoc(doc(convidado(), 'presentes-casa/exemplo'), { reservado: true }))
  })

  it('convidado NÃO apaga', async () => {
    await assertFails(deleteDoc(doc(convidado(), 'presentes-casa/exemplo')))
  })

  it('autenticado que não é o admin NÃO acrescenta', async () => {
    await assertFails(addDoc(collection(intruso(), 'presentes-casa'), item))
  })

  it('o admin acrescenta', async () => {
    await assertSucceeds(addDoc(collection(admin(), 'presentes-casa'), item))
  })

  it('o admin altera', async () => {
    await assertSucceeds(updateDoc(doc(admin(), 'presentes-casa/exemplo'), { reservado: true }))
  })

  it('rejeita item sem nome', async () => {
    await assertFails(addDoc(collection(admin(), 'presentes-casa'), { ...item, nome: '' }))
  })

  it('rejeita descrição acima de 1000 caracteres', async () => {
    await assertFails(
      addDoc(collection(admin(), 'presentes-casa'), { ...item, descricao: 'x'.repeat(1001) })
    )
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

describe('fotografias em base64', () => {
  const valida = {
    dados: 'data:image/webp;base64,AAAA',
    largura: 800,
    altura: 600,
    criadoEm: serverTimestamp(),
  }

  before(async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await setDoc(doc(c.firestore(), 'fotografias/exemplo'), {
        dados: 'data:image/webp;base64,BBBB',
        largura: 1,
        altura: 1,
        criadoEm: new Date(),
      })
    })
  })

  it('qualquer pessoa lê (é o que o site mostra)', async () => {
    await assertSucceeds(getDocs(collection(convidado(), 'fotografias')))
  })

  it('convidado NÃO cria', async () => {
    await assertFails(addDoc(collection(convidado(), 'fotografias'), valida))
  })

  it('autenticado que não é o admin NÃO cria', async () => {
    await assertFails(addDoc(collection(intruso(), 'fotografias'), valida))
  })

  it('o admin cria', async () => {
    await assertSucceeds(addDoc(collection(admin(), 'fotografias'), valida))
  })

  it('rejeita o que não seja uma imagem', async () => {
    await assertFails(
      addDoc(collection(admin(), 'fotografias'), { ...valida, dados: 'javascript:alert(1)' })
    )
  })

  it('rejeita acima de 750 kB', async () => {
    await assertFails(
      addDoc(collection(admin(), 'fotografias'), {
        ...valida,
        dados: 'data:image/webp;base64,' + 'A'.repeat(750000),
      })
    )
  })

  it('rejeita campos a mais', async () => {
    await assertFails(addDoc(collection(admin(), 'fotografias'), { ...valida, dono: 'x' }))
  })

  it('ninguém altera uma fotografia', async () => {
    await assertFails(updateDoc(doc(admin(), 'fotografias/exemplo'), { largura: 2 }))
  })

  it('o admin apaga', async () => {
    await assertSucceeds(deleteDoc(doc(admin(), 'fotografias/exemplo')))
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

describe('mais do que um administrador', () => {
  before(async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await setDoc(doc(c.firestore(), 'rsvps/paraOsDois'), {
        nome: 'Ana',
        presenca: 'sim',
        criadoEm: new Date(),
      })
    })
  })

  it('o segundo admin lê as respostas', async () => {
    await assertSucceeds(getDocs(collection(segundoAdmin(), 'rsvps')))
  })

  it('o segundo admin escreve conteúdo', async () => {
    await assertSucceeds(
      setDoc(doc(segundoAdmin(), 'conteudo/site'), { textos: { 'hero.data': 'x' } })
    )
  })

  it('o segundo admin apaga uma resposta', async () => {
    await assertSucceeds(deleteDoc(doc(segundoAdmin(), 'rsvps/paraOsDois')))
  })

  it('quem não está na lista continua de fora', async () => {
    await assertFails(getDocs(collection(intruso(), 'rsvps')))
  })
})

describe('sanidade', () => {
  it('o ficheiro de regras usado nos testes é o do repositório', () => {
    assert.ok(regras.includes('service cloud.firestore'))
    assert.ok(regras.includes(ADMIN_UID), 'a lista de UIDs foi substituída')
    assert.ok(regras.includes(SEGUNDO_ADMIN_UID), 'a lista tem os dois UIDs')
  })
})
