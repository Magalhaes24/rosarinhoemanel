import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { app } from './firebase.js'

const storage = getStorage(app)

const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
const TAMANHO_MAX = 8 * 1024 * 1024

/**
 * Envia uma fotografia e devolve o endereço público.
 *
 * As validações repetem-se em storage.rules — estas servem para dar um erro
 * imediato e legível, as outras é que impedem mesmo. Nunca confiar só nestas.
 */
export async function enviarFotografia(ficheiro) {
  if (!TIPOS.includes(ficheiro.type)) {
    throw new Error('Só são aceites imagens (JPEG, PNG, WebP, AVIF ou GIF).')
  }
  if (ficheiro.size > TAMANHO_MAX) {
    throw new Error('A imagem não pode passar de 8 MB.')
  }

  // Nome sem caracteres estranhos e com sufixo aleatório, para nunca haver
  // colisões nem nomes controlados por conteúdo externo.
  const seguro = ficheiro.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-60)
  const sufixo = crypto.randomUUID().slice(0, 8)
  const destino = ref(storage, `fotografias/${sufixo}-${seguro}`)

  await uploadBytes(destino, ficheiro, { contentType: ficheiro.type })
  return getDownloadURL(destino)
}

export async function apagarFotografia(url) {
  try {
    await deleteObject(ref(storage, url))
  } catch {
    // Já não existe, ou é uma imagem que não está no nosso Storage.
  }
}
