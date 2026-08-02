import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { app } from './firebase.js'
import {
  temaPadrao,
  textosPadrao,
  variavelCss,
} from '../data/conteudoPadrao.js'

/**
 * Conteúdo do site: tema, textos e lista de presentes.
 *
 * Os valores por omissão vivem no código (conteudoPadrao.js) e são o que o
 * site mostra de imediato. Por cima, e só depois de chegar, sobrepõe-se o que
 * o admin gravou em `conteudo/site`. As duas consequências que interessam:
 *
 *  - a primeira pintura nunca espera pela base de dados;
 *  - se o Firestore estiver em baixo, ou o documento vier corrompido, o site
 *    mostra na mesma o conteúdo original em vez de ficar em branco.
 *
 * O Firestore é carregado a pedido, como no resto do site, para não pesar no
 * arranque de quem só vem ver a página.
 */

const Contexto = createContext(null)

const CHAVE_CACHE = 'conteudo-site'

/** Guarda a última versão conhecida, para não haver salto visual ao recarregar. */
function lerCache() {
  try {
    const bruto = localStorage.getItem(CHAVE_CACHE)
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

function guardarCache(dados) {
  try {
    localStorage.setItem(CHAVE_CACHE, JSON.stringify(dados))
  } catch {
    /* modo privado, quota cheia — não é crítico */
  }
}

/** Aplica o tema às variáveis CSS que o site já usa. */
function aplicarTema(tema) {
  const raiz = document.documentElement
  for (const [chave, valor] of Object.entries(tema)) {
    const css = variavelCss[chave]
    if (css && valor !== undefined && valor !== null && valor !== '') {
      raiz.style.setProperty(css, String(valor))
    }
  }
}

export function ConteudoProvider({ children }) {
  const guardado = lerCache()

  const [tema, setTema] = useState({ ...temaPadrao, ...(guardado?.tema || {}) })
  const [textos, setTextos] = useState({ ...textosPadrao, ...(guardado?.textos || {}) })
  const [presentesCasa, setPresentesCasa] = useState(null)

  // Tema -> variáveis CSS, sempre que muda.
  useEffect(() => {
    aplicarTema(tema)
  }, [tema])

  // Escuta o conteúdo e a lista de presentes.
  useEffect(() => {
    let cancelado = false
    let cancelarConteudo = () => {}
    let cancelarPresentes = () => {}

    // Se o Firestore não responder (base de dados ainda por criar, sem rede),
    // assume-se lista vazia em vez de deixar a secção em «a carregar» para
    // sempre.
    const desistir = window.setTimeout(
      () => setPresentesCasa((atual) => atual ?? []),
      5000
    )

    import('firebase/firestore')
      .then((fs) => {
        if (cancelado) return
        const db = fs.getFirestore(app)

        cancelarConteudo = fs.onSnapshot(
          fs.doc(db, 'conteudo', 'site'),
          (snap) => {
            const d = snap.data()
            if (!d) return
            const novoTema = { ...temaPadrao, ...(d.tema || {}) }
            const novosTextos = { ...textosPadrao, ...(d.textos || {}) }
            setTema(novoTema)
            setTextos(novosTextos)
            guardarCache({ tema: d.tema || {}, textos: d.textos || {} })
          },
          () => {} // sem conteúdo gravado ainda, ou sem rede: fica o padrão
        )

        cancelarPresentes = fs.onSnapshot(
          fs.query(fs.collection(db, 'presentes-casa'), fs.orderBy('ordem', 'asc')),
          (snap) => setPresentesCasa(snap.docs.map((x) => ({ id: x.id, ...x.data() }))),
          () => setPresentesCasa([])
        )
      })
      .catch(() => {})

    return () => {
      cancelado = true
      window.clearTimeout(desistir)
      cancelarConteudo()
      cancelarPresentes()
    }
  }, [])

  const valor = useMemo(
    () => ({
      tema,
      textos,
      presentesCasa,
      /** t('hero.nome1') — devolve o texto atual, ou a própria chave se faltar. */
      t: (chave) => textos[chave] ?? chave,
    }),
    [tema, textos, presentesCasa]
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useConteudo() {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('Falta o <ConteudoProvider> à volta da aplicação.')
  return ctx
}

/** Atalho para quem só precisa dos textos. */
export function useTexto() {
  return useConteudo().t
}
