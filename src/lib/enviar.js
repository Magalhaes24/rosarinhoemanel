import { app } from './firebase.js'

/**
 * O SDK do Firestore são umas centenas de kilobytes que a esmagadora maioria
 * das visitas nunca chega a usar — só quem submete um formulário. Por isso só
 * é descarregado no momento do envio, e uma única vez por sessão.
 */
let ligacao

function obterLigacao() {
  if (!ligacao) {
    ligacao = import('firebase/firestore').then((fs) => ({ fs, db: fs.getFirestore(app) }))
  }
  return ligacao
}

export async function enviar(nomeColecao, dados) {
  const { fs, db } = await obterLigacao()
  return fs.addDoc(fs.collection(db, nomeColecao), {
    ...dados,
    criadoEm: fs.serverTimestamp(),
  })
}
