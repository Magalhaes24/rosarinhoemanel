import CampoFotografia from '../components/CampoFotografia.jsx'

/**
 * Formulário gerado a partir dos `campos` que cada tipo de secção declara.
 *
 * Vive aqui, e não na administração, porque agora é usado nos dois sítios: no
 * separador «Secções» e no painel que abre por cima da própria secção quando
 * se edita o site por dentro. As classes continuam as da administração — o
 * painel de edição reaproveita a mesma folha de estilo.
 */

/** Um cartão da grelha. Só o que faz sentido dentro de uma célula. */
const CAMPOS_DO_CARTAO = [
  ['titulo', 'Título'],
  ['texto', 'Texto'],
  ['botao', 'Botão'],
  ['destino', 'Destino do botão'],
]

/**
 * Lista de cartões, para as grelhas: acrescentar, remover e trocar de lugar.
 *
 * A grelha guarda os cartões como lista e não como campos numerados
 * (`titulo1`, `titulo2`, …) para o número de colunas e de cartões poderem
 * mudar sem deixar campos órfãos para trás.
 */
function CampoCartoes({ valor, aoMudar, etiqueta }) {
  const cartoes = Array.isArray(valor) ? valor : []

  const mudarCartao = (i, dados) => aoMudar(cartoes.map((c, k) => (k === i ? dados : c)))

  const mover = (i, dir) => {
    const destino = i + dir
    if (destino < 0 || destino >= cartoes.length) return
    const nova = [...cartoes]
    ;[nova[i], nova[destino]] = [nova[destino], nova[i]]
    aoMudar(nova)
  }

  return (
    <div className="admin__cartoes">
      <span className="admin__campo-etiqueta">{etiqueta}</span>

      {cartoes.map((cartao, i) => (
        <div key={i} className="admin__cartao">
          <div className="admin__cartao-topo">
            <strong>Cartão {i + 1}</strong>
            <div className="admin__acoes">
              <button
                type="button"
                className="admin__btn admin__btn--claro"
                onClick={() => mover(i, -1)}
                disabled={i === 0}
                aria-label="Passar para trás"
              >
                ↑
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--claro"
                onClick={() => mover(i, 1)}
                disabled={i === cartoes.length - 1}
                aria-label="Passar para a frente"
              >
                ↓
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--perigo"
                onClick={() => aoMudar(cartoes.filter((_, k) => k !== i))}
              >
                Remover
              </button>
            </div>
          </div>

          <CampoFotografia
            valor={cartao.fotografia || ''}
            aoMudar={(v) => mudarCartao(i, { ...cartao, fotografia: v })}
          />

          {CAMPOS_DO_CARTAO.map(([chave, nome]) => (
            <label key={chave} className="admin__campo">
              <span>{nome}</span>
              {chave === 'texto' ? (
                <textarea
                  rows={2}
                  value={cartao[chave] || ''}
                  onChange={(e) => mudarCartao(i, { ...cartao, [chave]: e.target.value })}
                />
              ) : (
                <input
                  type="text"
                  value={cartao[chave] || ''}
                  onChange={(e) => mudarCartao(i, { ...cartao, [chave]: e.target.value })}
                />
              )}
            </label>
          ))}
        </div>
      ))}

      <button
        type="button"
        className="admin__btn admin__btn--claro"
        onClick={() => aoMudar([...cartoes, { titulo: '', texto: '' }])}
      >
        Acrescentar cartão
      </button>
    </div>
  )
}

export default function Campos({ definicao, dados, aoMudar }) {
  return definicao.campos.map((campo) => {
    const valor = dados[campo.chave] ?? ''
    const muda = (v) => aoMudar({ ...dados, [campo.chave]: v })

    if (campo.tipo === 'fotografia') {
      return (
        <CampoFotografia
          key={campo.chave}
          etiqueta={campo.etiqueta}
          valor={valor}
          aoMudar={muda}
        />
      )
    }

    if (campo.tipo === 'cartoes') {
      return (
        <CampoCartoes
          key={campo.chave}
          etiqueta={campo.etiqueta}
          valor={dados[campo.chave]}
          aoMudar={muda}
        />
      )
    }

    return (
      <label key={campo.chave} className="admin__campo">
        <span>
          {campo.etiqueta}
          {campo.ajuda && <em className="admin__campo-ajuda"> — {campo.ajuda}</em>}
        </span>

        {campo.tipo === 'textoLongo' || campo.tipo === 'listaDeFotografias' ? (
          <textarea
            rows={campo.tipo === 'listaDeFotografias' ? 5 : 3}
            value={valor}
            onChange={(e) => muda(e.target.value)}
            placeholder={campo.tipo === 'listaDeFotografias' ? 'https://…\nhttps://…' : undefined}
          />
        ) : campo.tipo === 'escolha' ? (
          <select value={valor} onChange={(e) => muda(e.target.value)}>
            {campo.opcoes.map(([v, etiqueta]) => (
              <option key={v} value={v}>
                {etiqueta}
              </option>
            ))}
          </select>
        ) : campo.tipo === 'numero' ? (
          <input
            type="number"
            min={campo.min}
            max={campo.max}
            step={campo.passo}
            value={valor}
            onChange={(e) => muda(Number(e.target.value))}
          />
        ) : campo.tipo === 'booleano' ? (
          <input
            type="checkbox"
            checked={valor !== false}
            onChange={(e) => muda(e.target.checked)}
          />
        ) : (
          <input type="text" value={valor} onChange={(e) => muda(e.target.value)} />
        )}
      </label>
    )
  })
}
