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
 * UIDs das contas com acesso à área de administração, separados por vírgula.
 *
 * Isto é uma verificação de conveniência para a interface. A que conta a sério
 * é a mesma lista em `firestore.rules`, aplicada no servidor: mesmo que alguém
 * contorne o ecrã de login, sem estar nela não lê um único documento.
 *
 * `VITE_ADMIN_UID` (singular) continua a ser lido para não partir instalações
 * anteriores a haver mais do que um administrador.
 */
export const ADMIN_UIDS = (
  import.meta.env.VITE_ADMIN_UIDS ||
  import.meta.env.VITE_ADMIN_UID ||
  ''
)
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean)

export function ehAdmin(utilizador) {
  return Boolean(utilizador && ADMIN_UIDS.includes(utilizador.uid))
}

/**
 * Sessão que morre ao fechar o separador. Para uma área usada de vez em quando,
 * num portátil que pode ser partilhado, é a opção certa — não fica sessão
 * aberta indefinidamente.
 */
export async function entrar(email, palavraPasse) {
  if (!ADMIN_UIDS.length) {
    // Não é uma falha de credenciais — o site é que não sabe quem é o admin.
    // Dizer isto não revela nada sobre contas nenhumas, e poupa horas a
    // desconfiar da palavra-passe.
    throw new Error('sem-configuracao')
  }

  await setPersistence(auth, browserSessionPersistence)
  const { user } = await signInWithEmailAndPassword(auth, email, palavraPasse)

  if (!ehAdmin(user)) {
    await signOut(auth)
    marcarAdmin(false)
    // Quem chegou aqui já provou ser dono desta conta, por isso dizer-lhe que
    // ela não é a de administração não lhe revela nada de novo.
    throw new Error('sem-permissao')
  }

  // Marca que faz as páginas públicas carregarem o modo de edição. É só uma
  // pista de desempenho — evita descarregar o SDK de autenticação para os
  // convidados. Quem a forjar vê os botões e mais nada: gravar depende das
  // regras do Firestore, que correm no servidor.
  marcarAdmin(true)
  window.dispatchEvent(new Event(EVENTO_ENTROU))

  return user
}

/**
 * Mensagem para o utilizador a partir do erro.
 *
 * Todas as falhas de credenciais dão a MESMA frase, de propósito: distinguir
 * "email não existe" de "palavra-passe errada" deixaria enumerar contas. Já os
 * problemas de configuração e de rede são ditos como são — não têm nada a ver
 * com credenciais e calar-se sobre eles só faz perder tempo.
 */
export function mensagemDeErro(erro) {
  switch (erro?.message || erro?.code) {
    case 'sem-configuracao':
      return 'A administração ainda não está configurada neste site (falta VITE_ADMIN_UIDS).'
    case 'sem-permissao':
      return 'Esta conta não tem acesso à administração.'
    case 'auth/too-many-requests':
      return 'Demasiadas tentativas. Espera uns minutos antes de tentar de novo.'
    case 'auth/network-request-failed':
      return 'Não foi possível contactar o Firebase. Verifica a ligação.'
    case 'auth/operation-not-allowed':
      return 'O acesso por email e palavra-passe está desligado na consola do Firebase.'
    case 'auth/unauthorized-domain':
      return 'Este domínio não está autorizado no Firebase (Authentication > Settings > Authorized domains).'
    default:
      return 'Credenciais inválidas.'
  }
}

export const EVENTO_ENTROU = 'admin-entrou'

export function marcarAdmin(sim) {
  try {
    if (sim) localStorage.setItem('ja-entrou-como-admin', '1')
    else localStorage.removeItem('ja-entrou-como-admin')
  } catch {
    /* modo privado */
  }
}

export async function sair() {
  marcarAdmin(false)
  await signOut(auth)
}

/**
 * A marca é reposta aqui e não só no `entrar()`: quem já tinha sessão antes
 * desta funcionalidade existir nunca chegaria a tê-la, e a barra de edição
 * ficava invisível sem razão aparente.
 */
export function observarSessao(callback) {
  return onAuthStateChanged(auth, (utilizador) => {
    if (ehAdmin(utilizador)) {
      marcarAdmin(true)
      window.dispatchEvent(new Event(EVENTO_ENTROU))
    }
    callback(utilizador)
  })
}
