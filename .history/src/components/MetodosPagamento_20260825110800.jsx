import { useEffect, useRef, useState } from 'react'
import { useTexto } from '../lib/conteudo.jsx'
import { useEdicao } from '../lib/edicao.jsx'
import T from './T.jsx'
import './MetodosPagamento.css'

/**
 * Os métodos de pagamento, um cartão para cada.
 *
 * Vive dentro da janela de cada presente, por baixo do valor e do nome: quem
 * está a oferecer tem os dados à frente enquanto preenche, e não tem de os ir
 * procurar depois. O mesmo bloco fecha a página dos presentes, para quem
 * preferir dar sem escolher nada da lista.
 *
 * Aos convidados, um cartão só aparece se tiver dados — sem tag de Revolut,
 * ficam dois cartões em vez de três. Ao admin aparecem sempre os três, com os
 * campos editáveis no próprio sítio: é aí que se preenchem, sem ter de ir à
 * administração à procura das chaves de texto.
 */

/** Copia para a área de transferência, com recurso ao truque antigo. */
async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    // `navigator.clipboard` não existe fora de HTTPS nem em alguns browsers
    // de telemóvel dentro de aplicações.
    const campo = document.createElement('textarea')
    campo.value = texto
    campo.setAttribute('readonly', '')
    campo.style.position = 'fixed'
    campo.style.opacity = '0'
    document.body.appendChild(campo)
    campo.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    document.body.removeChild(campo)
    return ok
  }
}

function IconeCopiar({ feito }) {
  if (feito) {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3 8.5 6.2 12 13 4.5" fill="none" strokeWidth="1.6" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.6" fill="none" strokeWidth="1.3" />
      <path d="M10.5 3.5H3.4a.9.9 0 0 0-.9.9v7.1" fill="none" strokeWidth="1.3" />
    </svg>
  )
}

/**
 * Uma linha copiável: a etiqueta por cima, o valor e o botão em baixo.
 *
 * Recebe as chaves dos textos e não os textos já lidos, porque em edição são
 * elas que dizem ao `T` o que há-de gravar. O valor a copiar continua a ser a
 * string, que é o que interessa à área de transferência.
 */
function Dado({ chaveEtiqueta, chaveValor, etiqueta, valor, emEdicao }) {
  const [estado, setEstado] = useState('idle')
  const temporizador = useRef(null)

  useEffect(() => () => clearTimeout(temporizador.current), [])

  async function aoCopiar() {
    const ok = await copiar(valor)
    setEstado(ok ? 'copiado' : 'falhou')
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setEstado('idle'), 2000)
  }

  // Em edição a etiqueta aparece mesmo quando está vazia, senão não havia onde
  // carregar para lhe dar um nome.
  const mostraEtiqueta = emEdicao ? Boolean(chaveEtiqueta) : Boolean(etiqueta)

  return (
    <div className="pagar__dado">
      {mostraEtiqueta && (
        <span className="pagar__etiqueta">
          {emEdicao ? <T k={chaveEtiqueta} multilinha={false} /> : etiqueta}
        </span>
      )}
      <span className="pagar__valor">
        {emEdicao ? <T k={chaveValor} multilinha={false} /> : valor}
        {!emEdicao && (
          <button
            type="button"
            className={'pagar__copiar' + (estado === 'copiado' ? ' is-copiado' : '')}
            onClick={aoCopiar}
            title={estado === 'falhou' ? 'Copia à mão' : 'Copiar'}
            aria-label={`Copiar ${etiqueta || valor}`}
          >
            <IconeCopiar feito={estado === 'copiado'} />
          </button>
        )}
      </span>
      {/* Só para leitores de ecrã: o ícone muda sozinho e sem isto a
          confirmação passava despercebida a quem não o vê. */}
      <span className="pagar__aviso" role="status" aria-live="polite">
        {estado === 'copiado' ? 'Copiado' : ''}
      </span>
    </div>
  )
}

function Cartao({ marca, selo, link, vazio, children }) {
  return (
    <div className={`pagar__cartao pagar__cartao--${marca}` + (vazio ? ' is-vazio' : '')}>
      <div className="pagar__topo">
        <span className="pagar__selo">{selo}</span>
        {/* `noopener` fecha o acesso ao `window.opener` a partir da aplicação. */}
        {link && (
          <a
            className="pagar__abrir"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir ${selo}`}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5.5 10.5 10.5 5.5M6.4 5.5h4.1v4.1" fill="none" strokeWidth="1.5" />
            </svg>
          </a>
        )}
      </div>
      {children}
    </div>
  )
}

export default function MetodosPagamento({ titulo, nota }) {
  const t = useTexto()
  const { emEdicao: _e } = useEdicao()
  const emEdicao = true // TESTE

  const limpo = (chave) => (t(chave) || '').trim()

  const mbway = [
    { n: 1, nome: limpo('pagamento.mbway1.nome'), numero: limpo('pagamento.mbway1.numero') },
    { n: 2, nome: limpo('pagamento.mbway2.nome'), numero: limpo('pagamento.mbway2.numero') },
  ]
  const mbwayVisivel = mbway.filter((m) => m.numero)

  const tag = limpo('pagamento.revolut.tag')
  const iban = limpo('pagamento.iban')
  const titular = limpo('pagamento.titular')

  if (!emEdicao && mbwayVisivel.length === 0 && !tag && !iban) return null

  const linhas = emEdicao ? mbway : mbwayVisivel

  return (
    <div className={'pagar' + (emEdicao ? ' pagar--edicao' : '')}>
      {titulo && (
        <p className="pagar__titulo">{emEdicao ? <T k="pagamento.titulo" /> : titulo}</p>
      )}

      <div className="pagar__cartoes">
        {(emEdicao || mbwayVisivel.length > 0) && (
          <Cartao marca="mbway" selo="MB WAY" vazio={mbwayVisivel.length === 0}>
            {linhas.map((m) => (
              <Dado
                key={m.n}
                chaveEtiqueta={`pagamento.mbway${m.n}.nome`}
                chaveValor={`pagamento.mbway${m.n}.numero`}
                etiqueta={m.nome}
                valor={m.numero}
                emEdicao={emEdicao}
              />
            ))}
          </Cartao>
        )}

        {(emEdicao || tag) && (
          <Cartao
            marca="revolut"
            selo="Revolut"
            vazio={!tag}
            link={tag ? `https://revolut.me/${tag.replace(/^@/, '')}` : ''}
          >
            <Dado
              chaveValor="pagamento.revolut.tag"
              etiqueta="Tag"
              valor={tag}
              emEdicao={emEdicao}
            />
          </Cartao>
        )}

        {(emEdicao || iban) && (
          <Cartao marca="iban" selo="IBAN" vazio={!iban}>
            <Dado
              chaveEtiqueta="pagamento.titular"
              chaveValor="pagamento.iban"
              etiqueta={titular}
              valor={iban}
              emEdicao={emEdicao}
            />
          </Cartao>
        )}
      </div>

      {emEdicao && (
      )}

      {nota && <p className="pagar__nota">{emEdicao ? <T k="pagamento.nota" /> : nota}</p>}
    </div>
  )
}
