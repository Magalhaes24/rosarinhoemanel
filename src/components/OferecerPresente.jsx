import { useEffect, useState } from 'react'
import { useTexto } from '../lib/conteudo.jsx'
import { enviar } from '../lib/enviar.js'
import MetodosPagamento from './MetodosPagamento.jsx'
import './OferecerPresente.css'

export function euros(valor) {
  const n = Number(valor)
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  })
}

/**
 * Janela para oferecer um presente.
 *
 * Aceita contribuições parciais: um presente caro pode ser oferecido por
 * várias pessoas, e cada uma vê quanto falta.
 *
 * Escreve em dois sítios de propósito. A contribuição — presente e valor, sem
 * nome — vai para `contribuicoes`, que é pública e alimenta a barra de
 * progresso. O nome e a mensagem vão para `presentes`, que só o admin lê.
 * Assim ninguém consegue saber quem ofereceu o quê a partir do site.
 */
export default function OferecerPresente({ item, jaContribuido, aoFechar }) {
  const t = useTexto()
  const [valor, setValor] = useState('')
  const [nome, setNome] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [estado, setEstado] = useState('idle')
  const [enviado, setEnviado] = useState(0)
  const [erro, setErro] = useState('')
  const [armadilha, setArmadilha] = useState('')

  const preco = Number(item.preco) || 0
  const falta = preco > 0 ? Math.max(0, preco - jaContribuido) : 0
  const montante = Number(String(valor).replace(',', '.')) || 0
  const passaOQueFalta = preco > 0 && montante > falta

  useEffect(() => {
    const aoTeclar = (e) => e.key === 'Escape' && aoFechar()
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoFechar])

  async function submeter(e) {
    e.preventDefault()
    if (armadilha) {
      setEstado('feito')
      return
    }
    if (!nome.trim()) {
      setErro('Falta o nome, para podermos agradecer.')
      return
    }
    if (montante <= 0) {
      setErro('Indica quanto queres dar.')
      return
    }
    if (passaOQueFalta) {
      setErro(`Para este presente falta apenas ${euros(falta)}.`)
      return
    }

    setEstado('a-enviar')
    setErro('')
    try {
      // Primeiro o valor: é o que faz a barra andar e o que os outros
      // convidados veem. O nome segue a seguir, para o admin.
      await enviar('contribuicoes', { presenteId: item.id, valor: montante })
      await enviar('presentes', {
        nome: nome.trim().slice(0, 120),
        presente: `${item.nome} — ${euros(montante)}`.slice(0, 200),
        mensagem: mensagem.trim().slice(0, 1000),
      })
      setEnviado(montante)
      setEstado('feito')
    } catch (err) {
      console.error(err)
      setErro(
        err.code === 'permission-denied'
          ? 'Não foi possível registar. Avisa-nos, por favor.'
          : 'Não foi possível registar. Tenta outra vez.'
      )
      setEstado('idle')
    }
  }

  return (
    <div
      className="oferecer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="oferecer-titulo"
      onPointerDown={(e) => e.target === e.currentTarget && aoFechar()}
    >
      <div className="oferecer__caixa">
        <button
          type="button"
          className="oferecer__fechar"
          onClick={aoFechar}
          aria-label="Fechar"
        >
          ×
        </button>

        {estado === 'feito' ? (
          <div className="oferecer__feito">
            <h2 id="oferecer-titulo">Obrigado!</h2>
            <p>
              Ficou registado. Falta só enviares{enviado > 0 ? ` ${euros(enviado)}` : ''} por
              um dos métodos abaixo, com o teu nome na descrição.
            </p>
            <div className="oferecer__pagar">
              <MetodosPagamento titulo={t('pagamento.titulo')} />
            </div>
            <button type="button" className="oferecer__btn" onClick={aoFechar}>
              Fechar
            </button>
          </div>
        ) : (
          <>
            {item.imagem && (
              <div className="oferecer__imagem">
                <img src={item.imagem} alt="" />
              </div>
            )}

            <header className="oferecer__topo">
              <span className="oferecer__etiqueta">{t('presentes.etiquetaJanela')}</span>
              <h2 id="oferecer-titulo">{item.nome}</h2>
              {item.descricao && <p className="oferecer__descricao">{item.descricao}</p>}
            </header>

            {preco > 0 && (
              <div className="oferecer__numeros">
                <span>
                  Valor total
                  <strong>{euros(preco)}</strong>
                </span>
                <span>
                  Já oferecido
                  <strong>{euros(jaContribuido)}</strong>
                </span>
                <span>
                  Em falta
                  <strong>{euros(falta)}</strong>
                </span>
              </div>
            )}

            <form onSubmit={submeter} noValidate>
              <div className="oferecer__linha">
                <label className="oferecer__campo">
                  <span>Valor</span>
                  <div className="oferecer__valor">
                    <span aria-hidden="true">€</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      inputMode="decimal"
                      placeholder="0"
                      value={valor}
                      onChange={(e) => {
                        setValor(e.target.value)
                        setErro('')
                      }}
                      autoFocus
                    />
                  </div>
                </label>

                <label className="oferecer__campo">
                  <span>O teu nome</span>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    maxLength={120}
                    autoComplete="name"
                    required
                  />
                </label>
              </div>

              <label className="oferecer__campo">
                <span>Mensagem (opcional)</span>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  maxLength={1000}
                  rows={2}
                />
              </label>

              {/* Os dados ficam à vista enquanto se preenche: quem oferece
                  copia o IBAN sem sair da janela nem perder o que escreveu. */}
              <div className="oferecer__pagar">
                <MetodosPagamento titulo={t('pagamento.titulo')} nota={t('pagamento.nota')} />
              </div>

              {/* Honeypot: invisível para pessoas, irresistível para bots. */}
              <div className="form-armadilha" aria-hidden="true">
                <label htmlFor="of-website">Website</label>
                <input
                  id="of-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={armadilha}
                  onChange={(e) => setArmadilha(e.target.value)}
                />
              </div>

              {erro && <p className="oferecer__erro">{erro}</p>}

              <div className="oferecer__acoes">
                <button
                  type="button"
                  className="oferecer__btn oferecer__btn--claro"
                  onClick={aoFechar}
                >
                  Cancelar
                </button>
                <button type="submit" className="oferecer__btn" disabled={estado === 'a-enviar'}>
                  {estado === 'a-enviar'
                    ? 'A registar…'
                    : montante > 0
                      ? `Registar ${euros(montante)}`
                      : t('presentes.registar')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

/** Barra de progresso de um presente. */
export function Progresso({ contribuido, preco }) {
  const pct = preco > 0 ? Math.min(100, (contribuido / preco) * 100) : 0
  return (
    <div
      className="progresso"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="progresso__barra" style={{ width: `${pct}%` }} />
    </div>
  )
}
