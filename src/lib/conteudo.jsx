import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { app } from './firebase.js'
import { temaPadrao, textosPadrao, imagensPadrao, variavelCss } from '../data/conteudoPadrao.js'
import { paginasPadrao } from '../data/paginasPadrao.js'
import { galeriasPadrao } from '../data/galeriasPadrao.js'
import { caminho } from './caminho.js'

const PREFIXO_FIRESTORE = 'firestore:'

/**
 * Traduz o que está guardado para um endereço que o browser entenda.
 *
 *  - `firestore:abc123` — fotografia gravada em base64 no Firestore; o
 *    conteúdo real vem do mapa `fotografias`, carregado à parte.
 *  - `/images/…` — ficheiro do próprio site; leva o prefixo de instalação,
 *    senão parte quando o site vive num subdiretório.
 *  - `https://…`, `data:…` — já absolutos, passam intactos.
 */
export function resolverImagem(src, fotografias = {}) {
  if (!src) return ''
  if (src.startsWith(PREFIXO_FIRESTORE)) {
    return fotografias[src.slice(PREFIXO_FIRESTORE.length)] || ''
  }
  return /^(https?:|data:|blob:)/i.test(src) ? src : caminho(src)
}

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

/**
 * Aplica o tema às variáveis CSS que o site já usa.
 *
 * Escreve no `body` e não no `html`: as escalas e o `--respiro` estão
 * declarados no `body` em global.css, e uma declaração aí ganha sempre a um
 * valor herdado do `html` — as cores mudavam, os tamanhos não.
 */
function aplicarTema(tema) {
  const raiz = document.body
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
  const [paginas, setPaginas] = useState({ ...paginasPadrao, ...(guardado?.paginas || {}) })
  const [imagens, setImagens] = useState({ ...imagensPadrao, ...(guardado?.imagens || {}) })
  const [galerias, setGalerias] = useState({ ...galeriasPadrao, ...(guardado?.galerias || {}) })
  // Alterações do modo de edição, ainda por gravar. Sobrepõem-se ao que está
  // na base de dados para o admin ver o resultado enquanto edita, e
  // desaparecem se ele descartar.
  const [rascunhoTema, setRascunhoTema] = useState(null)
  const [rascunhoTextos, setRascunhoTextos] = useState(null)
  const [rascunhoPaginas, setRascunhoPaginas] = useState(null)
  const [rascunhoImagens, setRascunhoImagens] = useState(null)
  const [rascunhoGalerias, setRascunhoGalerias] = useState(null)

  const [presentesCasa, setPresentesCasa] = useState(null)
  // Distingue «ainda não chegou» de «chegou vazio» de «não foi possível ler».
  const [erroPresentes, setErroPresentes] = useState('')

  // id -> data URL das fotografias guardadas em base64 no Firestore.
  // As locais são as que acabaram de ser enviadas nesta sessão: entram
  // primeiro, para a fotografia aparecer sem esperar pela volta ao servidor.
  const [fotografiasRemotas, setFotografiasRemotas] = useState({})
  const [fotografiasLocais, setFotografiasLocais] = useState({})
  const [erroFotografias, setErroFotografias] = useState('')

  const registarFotografia = useCallback((id, dados) => {
    setFotografiasLocais((r) => ({ ...r, [id]: dados }))
  }, [])

  // Tema -> variáveis CSS, sempre que muda. Com o rascunho por cima, para o
  // admin ver as cores a mudar enquanto mexe nelas.
  const temaEfetivo = useMemo(
    () => (rascunhoTema ? { ...tema, ...rascunhoTema } : tema),
    [tema, rascunhoTema]
  )

  useEffect(() => {
    aplicarTema(temaEfetivo)
  }, [temaEfetivo])

  // Escuta o conteúdo e a lista de presentes.
  useEffect(() => {
    let cancelado = false
    let cancelarConteudo = () => {}
    let cancelarPresentes = () => {}
    let cancelarFotografias = () => {}

    // Se o Firestore não responder (base de dados ainda por criar, sem rede),
    // assume-se lista vazia em vez de deixar a secção em «a carregar» para
    // sempre.
    const desistir = window.setTimeout(
      () => setPresentesCasa((atual) => atual ?? []),
      3000
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
            setTema({ ...temaPadrao, ...(d.tema || {}) })
            setTextos({ ...textosPadrao, ...(d.textos || {}) })
            // As páginas substituem-se inteiras, não se fundem: uma lista de
            // secções fundida com a original daria uma ordem sem sentido.
            setPaginas({ ...paginasPadrao, ...(d.paginas || {}) })
            setImagens({ ...imagensPadrao, ...(d.imagens || {}) })
            setGalerias({ ...galeriasPadrao, ...(d.galerias || {}) })
            guardarCache({
              tema: d.tema || {},
              textos: d.textos || {},
              paginas: d.paginas || {},
              imagens: d.imagens || {},
              galerias: d.galerias || {},
            })
          },
          () => {} // sem conteúdo gravado ainda, ou sem rede: fica o padrão
        )

        // Fotografias em base64. Coleção à parte para não inchar o documento
        // de conteúdo, que toda a gente lê para ver um título.
        cancelarFotografias = fs.onSnapshot(
          fs.collection(db, 'fotografias'),
          (snap) => {
            const mapa = {}
            snap.docs.forEach((d) => {
              const dados = d.data()?.dados
              if (dados) mapa[d.id] = dados
            })
            setFotografiasRemotas(mapa)
            setErroFotografias('')
          },
          (e) => {
            // Engolir isto em silêncio fazia as fotografias enviadas aparecerem
            // em branco, sem uma única pista do que estava mal.
            setErroFotografias(e.code || e.message)
            console.error('Fotografias:', e.code, e.message)
          }
        )

        // Sem `orderBy` de propósito: o Firestore exclui da consulta qualquer
        // documento a que falte o campo ordenado. Um presente criado à mão na
        // consola, sem `ordem`, desapareceria do site sem dar erro nenhum.
        // A lista é curta — ordena-se aqui.
        cancelarPresentes = fs.onSnapshot(
          fs.collection(db, 'presentes-casa'),
          (snap) => {
            const itens = snap.docs.map((x) => ({ id: x.id, ...x.data() }))
            itens.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
            setPresentesCasa(itens)
            setErroPresentes('')
          },
          (e) => {
            setPresentesCasa([])
            setErroPresentes(e.code || e.message)
            console.error('Lista de presentes:', e.code, e.message)
          }
        )
      })
      .catch(() => {})

    return () => {
      cancelado = true
      window.clearTimeout(desistir)
      cancelarConteudo()
      cancelarPresentes()
      cancelarFotografias()
    }
  }, [])

  const valor = useMemo(() => {
    const textosEfetivos = rascunhoTextos ? { ...textos, ...rascunhoTextos } : textos
    const paginasEfetivas = rascunhoPaginas ? { ...paginas, ...rascunhoPaginas } : paginas
    const imagensEfetivas = rascunhoImagens ? { ...imagens, ...rascunhoImagens } : imagens
    const galeriasEfetivas = rascunhoGalerias ? { ...galerias, ...rascunhoGalerias } : galerias
    // As locais entram por cima: são as mais recentes e podem ainda não ter
    // chegado ao servidor.
    const fotografias = { ...fotografiasRemotas, ...fotografiasLocais }

    return {
      tema: temaEfetivo,
      textos: textosEfetivos,
      paginas: paginasEfetivas,
      imagens: imagensEfetivas,
      galerias: galeriasEfetivas,
      presentesCasa,
      erroPresentes,

      /** t('hero.nome1') — devolve o texto atual, ou a própria chave se faltar. */
      t: (chave) => textosEfetivos[chave] ?? chave,
      /** img('hero.casal') — endereço pronto a usar num `<img src>`. */
      img: (chave) =>
        resolverImagem(imagensEfetivas[chave] ?? imagensPadrao[chave], fotografias),
      /** galeria('infancia') — lista de endereços já resolvidos. */
      galeria: (nome) => (galeriasEfetivas[nome] || []).map((s) => resolverImagem(s, fotografias)),
      fotografias,
      registarFotografia,
      erroFotografias,

      // Usados pelo modo de edição (src/lib/edicao.jsx).
      temaGravado: tema,
      rascunhoTema,
      setRascunhoTema,
      textosGravados: textos,
      paginasGravadas: paginas,
      imagensGravadas: imagens,
      galeriasGravadas: galerias,
      rascunhoTextos,
      setRascunhoTextos,
      rascunhoPaginas,
      setRascunhoPaginas,
      rascunhoImagens,
      setRascunhoImagens,
      rascunhoGalerias,
      setRascunhoGalerias,
    }
  }, [
    tema,
    temaEfetivo,
    rascunhoTema,
    textos,
    paginas,
    imagens,
    galerias,
    rascunhoTextos,
    rascunhoPaginas,
    rascunhoImagens,
    rascunhoGalerias,
    fotografiasRemotas,
    fotografiasLocais,
    registarFotografia,
    erroFotografias,
    presentesCasa,
    erroPresentes,
  ])

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
