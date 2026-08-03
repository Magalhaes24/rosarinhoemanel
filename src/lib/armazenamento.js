import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { app } from './firebase.js'

const storage = getStorage(app)

const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
const TAMANHO_MAX = 8 * 1024 * 1024

/** Tempo sem qualquer sinal de vida antes de desistir. */
const LIMITE_SEM_RESPOSTA = 15000

/**
 * Envia uma fotografia e devolve o endereço público.
 *
 * Usa `uploadBytesResumable` — e não `uploadBytes` — por duas razões: dá
 * progresso, e permite cancelar. Quando o Firebase Storage não está ativo no
 * projeto (precisa do plano Blaze), o SDK fica a repetir o pedido durante
 * minutos sem dizer nada; sem este limite, a interface ficava parada à espera
 * e parecia avariada.
 *
 * As validações repetem-se em storage.rules — estas servem para dar um erro
 * imediato e legível, as outras é que impedem mesmo.
 */
export function enviarFotografia(ficheiro, aoProgresso) {
  if (!TIPOS.includes(ficheiro.type)) {
    return Promise.reject(new Error('Só são aceites imagens (JPEG, PNG, WebP, AVIF ou GIF).'))
  }
  if (ficheiro.size > TAMANHO_MAX) {
    return Promise.reject(new Error('A imagem não pode passar de 8 MB.'))
  }

  // Nome sem caracteres estranhos e com sufixo aleatório, para nunca haver
  // colisões nem nomes controlados por conteúdo externo.
  const seguro = ficheiro.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-60)
  const sufixo = crypto.randomUUID().slice(0, 8)
  const destino = ref(storage, `fotografias/${sufixo}-${seguro}`)

  return new Promise((resolve, reject) => {
    const tarefa = uploadBytesResumable(destino, ficheiro, { contentType: ficheiro.type })

    let ultimoSinal = Date.now()
    const vigia = setInterval(() => {
      if (Date.now() - ultimoSinal > LIMITE_SEM_RESPOSTA) {
        clearInterval(vigia)
        try {
          tarefa.cancel()
        } catch {
          /* já terminou */
        }
        const e = new Error('sem-resposta')
        e.code = 'storage/sem-resposta'
        reject(e)
      }
    }, 1000)

    tarefa.on(
      'state_changed',
      (s) => {
        ultimoSinal = Date.now()
        if (s.totalBytes) aoProgresso?.(s.bytesTransferred / s.totalBytes)
      },
      (erro) => {
        clearInterval(vigia)
        reject(erro)
      },
      async () => {
        clearInterval(vigia)
        try {
          resolve(await getDownloadURL(tarefa.snapshot.ref))
        } catch (e) {
          reject(e)
        }
      }
    )
  })
}

/** Traduz o erro do SDK para algo que se perceba e que diga o que fazer. */
export function mensagemDeEnvio(erro) {
  const codigo = erro?.code || ''
  if (codigo.includes('sem-resposta') || codigo.includes('retry-limit')) {
    return 'O Firebase Storage não respondeu. Costuma ser por não estar ativo no projeto — precisa do plano Blaze. Usa antes «Colar endereço».'
  }
  if (codigo.includes('unauthorized')) {
    return 'Sem permissão para enviar. Publica as regras do Storage: npm run regras:storage'
  }
  if (codigo.includes('canceled')) return 'Envio cancelado.'
  if (codigo.includes('quota')) return 'O Storage atingiu o limite do plano.'
  return erro?.message || 'Não foi possível enviar a imagem.'
}

export async function apagarFotografia(url) {
  try {
    await deleteObject(ref(storage, url))
  } catch {
    // Já não existe, ou é uma imagem que não está no nosso Storage.
  }
}
