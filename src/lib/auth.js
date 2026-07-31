import {
  getAuth,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { app } from './firebase.js'

export const auth = getAuth(app)

/**
 * UID da única conta com acesso à área de administração.
 *
 * Isto é uma verificação de conveniência para a interface. A que conta a sério
 * é a mesma condição em `firestore.rules`, aplicada no servidor: mesmo que
 * alguém contorne o ecrã de login, sem este UID não lê um único documento.
 */
export const ADMIN_UID = import.meta.env.VITE_ADMIN_UID || ''

export function ehAdmin(utilizador) {
  return Boolean(utilizador && ADMIN_UID && utilizador.uid === ADMIN_UID)
}

/**
 * Sessão que morre ao fechar o separador. Para uma área usada de vez em quando,
 * num portátil que pode ser partilhado, é a opção certa — não fica sessão
 * aberta indefinidamente.
 */
export async function entrar(email, palavraPasse) {
  await setPersistence(auth, browserSessionPersistence)
  const { user } = await signInWithEmailAndPassword(auth, email, palavraPasse)
  if (!ehAdmin(user)) {
    await signOut(auth)
    throw new Error('sem-permissao')
  }
  return user
}

export function sair() {
  return signOut(auth)
}

export function observarSessao(callback) {
  return onAuthStateChanged(auth, callback)
}
