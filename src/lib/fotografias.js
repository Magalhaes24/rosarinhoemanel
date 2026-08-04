import { app } from './firebase.js'

/**
 * Fotografias guardadas no próprio Firestore, em base64.
 *
 * O Firebase Storage exige o plano Blaze, que este projeto não tem. A
 * alternativa é o Firestore, com duas restrições que mandam no desenho:
 *
 *  1. Um documento não pode passar de 1 MiB. Por isso a imagem é reduzida e
 *     recomprimida no browser antes de sair, e há um limite rígido a seguir.
 *  2. Cada fotografia vai para o SEU documento, na coleção `fotografias`, e o
 *     conteúdo do site guarda só uma referência. Se ficassem todas dentro de
 *     `conteudo/site`, cada visitante descarregava-as todas de uma vez só para
 *     ler um título.
 */

const COLECAO = 'fotografias'
export const PREFIXO = 'firestore:'

/** Folga confortável abaixo do limite de 1 MiB do Firestore. */
const MAX_BASE64 = 700_000

/**
 * Tentativas por ordem, do melhor ao mais agressivo. Baixa-se a qualidade e,
 * quando isso não chega, também o tamanho — só assim se garante que converge:
 * uma fotografia muito ruidosa pode não caber no limite por muito que se lhe
 * baixe a qualidade.
 */
const TENTATIVAS = [
  [1600, 0.75],
  [1400, 0.7],
  [1400, 0.58],
  [1200, 0.55],
  [1000, 0.5],
  [800, 0.45],
  [640, 0.4],
  [480, 0.35],
]

const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']

/** O WebP comprime melhor e mantém transparência; nem todos os browsers o dão. */
function melhorFormato() {
  const c = document.createElement('canvas')
  c.width = c.height = 1
  return c.toDataURL('image/webp').startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg'
}

function carregar(ficheiro) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(ficheiro)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem.'))
    }
    img.src = url
  })
}

/**
 * Reduz e recomprime, baixando a qualidade até caber. Devolve um data URL.
 */
export async function comprimir(ficheiro, aoProgresso) {
  if (!TIPOS.includes(ficheiro.type)) {
    throw new Error('Só são aceites imagens (JPEG, PNG, WebP, AVIF ou GIF).')
  }

  aoProgresso?.(0.1)
  const img = await carregar(ficheiro)
  const formato = melhorFormato()
  const tela = document.createElement('canvas')
  const ctx = tela.getContext('2d')

  for (let i = 0; i < TENTATIVAS.length; i++) {
    const [lado, qualidade] = TENTATIVAS[i]
    aoProgresso?.(0.15 + (i / TENTATIVAS.length) * 0.55)

    const escala = Math.min(1, lado / Math.max(img.width, img.height))
    const largura = Math.max(1, Math.round(img.width * escala))
    const altura = Math.max(1, Math.round(img.height * escala))

    tela.width = largura
    tela.height = altura
    ctx.imageSmoothingQuality = 'high'
    ctx.clearRect(0, 0, largura, altura)
    ctx.drawImage(img, 0, 0, largura, altura)

    const dados = tela.toDataURL(formato, qualidade)
    if (dados.length <= MAX_BASE64) return { dados, largura, altura }
  }

  throw new Error(
    'Não foi possível reduzir esta imagem o suficiente. Corta-a ou guarda-a com menos qualidade antes de a enviar.'
  )
}

/**
 * Guarda a fotografia e devolve a referência a pôr no conteúdo.
 *
 * `aoGuardar` recebe o par (id, dados) mal o documento existe. Serve para o
 * site mostrar a fotografia de imediato, sem esperar que o `onSnapshot` a
 * traga de volta do servidor — sem isso havia uma janela em que a referência
 * já estava no conteúdo mas a imagem ainda não, e aparecia em branco.
 */
export async function guardarFotografia(ficheiro, aoProgresso, aoGuardar) {
  const { dados, largura, altura } = await comprimir(ficheiro, aoProgresso)

  aoProgresso?.(0.8)
  const fs = await import('firebase/firestore')
  const db = fs.getFirestore(app)

  const doc = await fs.addDoc(fs.collection(db, COLECAO), {
    dados,
    largura,
    altura,
    criadoEm: fs.serverTimestamp(),
  })

  aoGuardar?.(doc.id, dados)
  aoProgresso?.(1)
  return PREFIXO + doc.id
}

export async function apagarFotografia(referencia) {
  if (!referencia?.startsWith(PREFIXO)) return
  try {
    const fs = await import('firebase/firestore')
    const db = fs.getFirestore(app)
    await fs.deleteDoc(fs.doc(db, COLECAO, referencia.slice(PREFIXO.length)))
  } catch {
    /* já não existe */
  }
}

export function mensagemDeEnvio(erro) {
  const codigo = erro?.code || ''
  if (codigo === 'permission-denied') {
    return 'Sem permissão para gravar. Falta publicar as regras: npm run regras'
  }
  if (codigo.includes('invalid-argument') || codigo.includes('resource-exhausted')) {
    return 'A imagem ficou grande demais para o Firestore. Corta-a ou reduz o tamanho.'
  }
  return erro?.message || 'Não foi possível guardar a imagem.'
}
