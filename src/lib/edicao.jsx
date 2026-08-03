import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useConteudo } from './conteudo.jsx'

/**
 * Modo de edição: o admin navega o site normal e altera as coisas no sítio.
 *
 * O SDK de autenticação só é carregado se houver sinal de que esta pessoa já
 * entrou alguma vez na administração — uma marca no `localStorage`. Para os
 * convidados, que são toda a gente, nada disto chega sequer a ser
 * descarregado.
 *
 * A marca é uma pista de desempenho, não uma proteção: quem a forjar vê os
 * botões e mais nada, porque gravar depende das regras do Firestore, que
 * correm no servidor e só conhecem um UID.
 */

const Contexto = createContext(null)

export const MARCA_ADMIN = 'ja-entrou-como-admin'

export function ConteudoProviderEdicao({ children }) {
  const conteudo = useConteudo()
  const {
    textosGravados,
    paginasGravadas,
    rascunhoTextos,
    setRascunhoTextos,
    rascunhoPaginas,
    setRascunhoPaginas,
  } = conteudo

  const [utilizador, setUtilizador] = useState(null)
  const [ligado, setLigado] = useState(false)
  const [estado, setEstado] = useState('idle')

  /**
   * Sessão — só se carrega o SDK de autenticação para quem já entrou alguma
   * vez na administração.
   *
   * Fica à escuta do evento de entrada porque a decisão de carregar é tomada
   * uma vez, ao montar: sem isto, quem entrasse em /admin e navegasse para o
   * site pela barra de menu não veria a barra de edição até recarregar a
   * página inteira.
   */
  useEffect(() => {
    let cancelarSessao = () => {}
    let montado = true

    function subscrever() {
      if (typeof localStorage === 'undefined') return
      if (!localStorage.getItem(MARCA_ADMIN)) return

      import('./auth.js')
        .then((auth) => {
          if (!montado) return
          cancelarSessao()
          cancelarSessao = auth.observarSessao((u) => setUtilizador(auth.ehAdmin(u) ? u : null))
        })
        .catch(() => {})
    }

    subscrever()
    window.addEventListener('admin-entrou', subscrever)
    // Login noutro separador do mesmo browser.
    window.addEventListener('storage', subscrever)

    return () => {
      montado = false
      cancelarSessao()
      window.removeEventListener('admin-entrou', subscrever)
      window.removeEventListener('storage', subscrever)
    }
  }, [])

  const podeEditar = Boolean(utilizador)
  const emEdicao = podeEditar && ligado

  // Sair do modo de edição quando a sessão acaba.
  useEffect(() => {
    if (!podeEditar && ligado) setLigado(false)
  }, [podeEditar, ligado])

  const alterarTexto = useCallback(
    (chave, valor) => {
      setRascunhoTextos((r) => ({ ...(r || {}), [chave]: valor }))
    },
    [setRascunhoTextos]
  )

  const alterarPagina = useCallback(
    (pagina, seccoes) => {
      setRascunhoPaginas((r) => ({ ...(r || {}), [pagina]: seccoes }))
    },
    [setRascunhoPaginas]
  )

  const nTextos = Object.keys(rascunhoTextos || {}).length
  const nPaginas = Object.keys(rascunhoPaginas || {}).length
  const porGravar = nTextos + nPaginas

  /** «2 textos e 1 página por gravar» — conta as duas coisas em separado,
      porque uma alteração de ordem afeta a página toda e não um texto. */
  const resumo = (() => {
    if (!porGravar) return 'Sem alterações'
    const partes = []
    if (nTextos) partes.push(`${nTextos} ${nTextos === 1 ? 'texto' : 'textos'}`)
    if (nPaginas) partes.push(`${nPaginas} ${nPaginas === 1 ? 'página' : 'páginas'}`)
    return `${partes.join(' e ')} por gravar`
  })()

  const descartar = useCallback(() => {
    setRascunhoTextos(null)
    setRascunhoPaginas(null)
    setEstado('idle')
  }, [setRascunhoTextos, setRascunhoPaginas])

  const gravar = useCallback(async () => {
    if (!porGravar) return
    setEstado('a-gravar')
    try {
      const fs = await import('firebase/firestore')
      const { app } = await import('./firebase.js')
      const db = fs.getFirestore(app)

      const dados = {}
      if (rascunhoTextos) dados.textos = { ...textosGravados, ...rascunhoTextos }
      if (rascunhoPaginas) dados.paginas = { ...paginasGravadas, ...rascunhoPaginas }

      await fs.setDoc(fs.doc(db, 'conteudo', 'site'), dados, { merge: true })

      // O que vier do Firestore passa a ser a verdade; o rascunho sai de cena.
      setRascunhoTextos(null)
      setRascunhoPaginas(null)
      setEstado('ok')
      window.setTimeout(() => setEstado('idle'), 2500)
    } catch (e) {
      console.error(e)
      setEstado(e.code === 'permission-denied' ? 'sem-permissao' : 'erro')
    }
  }, [
    porGravar,
    rascunhoTextos,
    rascunhoPaginas,
    textosGravados,
    paginasGravadas,
    setRascunhoTextos,
    setRascunhoPaginas,
  ])

  // Avisa antes de fechar o separador com alterações por gravar.
  useEffect(() => {
    if (!porGravar) return
    const aoSair = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', aoSair)
    return () => window.removeEventListener('beforeunload', aoSair)
  }, [porGravar])

  // Marca o documento para o CSS do modo de edição.
  useEffect(() => {
    document.documentElement.classList.toggle('em-edicao', emEdicao)
    return () => document.documentElement.classList.remove('em-edicao')
  }, [emEdicao])

  const valor = useMemo(
    () => ({
      utilizador,
      podeEditar,
      emEdicao,
      ligar: () => setLigado(true),
      desligar: () => setLigado(false),
      alternar: () => setLigado((v) => !v),
      alterarTexto,
      alterarPagina,
      porGravar,
      resumo,
      gravar,
      descartar,
      estado,
    }),
    [
      utilizador,
      podeEditar,
      emEdicao,
      alterarTexto,
      alterarPagina,
      porGravar,
      resumo,
      gravar,
      descartar,
      estado,
    ]
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useEdicao() {
  return useContext(Contexto) || { emEdicao: false, podeEditar: false }
}
