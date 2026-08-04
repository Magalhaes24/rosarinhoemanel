import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import './Confirmacao.css'

/**
 * Diálogo de confirmação, em vez do `confirm()` do browser.
 *
 * Usa-se como uma pergunta que se espera:
 *
 *   if (!(await confirmar({ titulo: '…', mensagem: '…' }))) return
 *
 * O `confirm()` nativo não se pode estilizar, aparece descolado do site, e em
 * alguns browsers traz a opção de «impedir que esta página crie mais
 * diálogos» — que desligaria as confirmações todas sem aviso.
 */

const Contexto = createContext(null)

export function ConfirmacaoProvider({ children }) {
  const [pedido, setPedido] = useState(null)
  const resolver = useRef(null)
  const botaoConfirmar = useRef(null)

  const confirmar = useCallback((opcoes) => {
    setPedido({ textoConfirmar: 'Apagar', destrutivo: true, ...opcoes })
    return new Promise((res) => {
      resolver.current = res
    })
  }, [])

  const responder = useCallback((resposta) => {
    setPedido(null)
    resolver.current?.(resposta)
    resolver.current = null
  }, [])

  // Escape cancela; o foco vai para o botão principal ao abrir.
  useEffect(() => {
    if (!pedido) return
    botaoConfirmar.current?.focus()
    const aoTeclar = (e) => {
      if (e.key === 'Escape') responder(false)
      if (e.key === 'Enter') responder(true)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [pedido, responder])

  return (
    <Contexto.Provider value={confirmar}>
      {children}

      {pedido && (
        <div
          className="confirmacao"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmacao-titulo"
          onPointerDown={(e) => e.target === e.currentTarget && responder(false)}
        >
          <div className="confirmacao__caixa">
            <h2 className="confirmacao__titulo" id="confirmacao-titulo">
              {pedido.titulo}
            </h2>

            {pedido.mensagem && <p className="confirmacao__mensagem">{pedido.mensagem}</p>}

            {pedido.detalhe && <p className="confirmacao__detalhe">{pedido.detalhe}</p>}

            <div className="confirmacao__acoes">
              <button
                type="button"
                className="confirmacao__btn confirmacao__btn--claro"
                onClick={() => responder(false)}
              >
                Cancelar
              </button>
              <button
                ref={botaoConfirmar}
                type="button"
                className={
                  'confirmacao__btn' + (pedido.destrutivo ? ' confirmacao__btn--perigo' : '')
                }
                onClick={() => responder(true)}
              >
                {pedido.textoConfirmar}
              </button>
            </div>
          </div>
        </div>
      )}
    </Contexto.Provider>
  )
}

/** Devolve uma função que faz a pergunta e espera pela resposta. */
export function useConfirmar() {
  const ctx = useContext(Contexto)
  // Sem provider (testes, isolamento), não bloqueia nada.
  return ctx || (async () => true)
}
