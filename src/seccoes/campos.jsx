import { useState } from 'react'
import CampoFotografia from '../components/CampoFotografia.jsx'
import { TIPOS_DE_BLOCO } from './blocos.jsx'

/**
 * Formulário gerado a partir dos `campos` que cada tipo de secção declara.
 *
 * Vive aqui, e não na administração, porque agora é usado nos dois sítios: no
 * separador «Secções» e no painel que abre por cima da própria secção quando
 * se edita o site por dentro. As classes continuam as da administração — o
 * painel de edição reaproveita a mesma folha de estilo.
 */

/**
 * Lista que se reordena a arrastar.
 *
 * Usa o arrastar do próprio browser em vez de uma biblioteca: são três eventos
 * e evita juntar mais 30 kB ao site que os convidados descarregam. As setas
 * ficam na mesma — num telemóvel não há arrastar que se aproveite, e são a
 * única forma de reordenar com teclado.
 */
function ListaArrastavel({ itens, aoMudar, children }) {
  const [origem, setOrigem] = useState(null)
  const [alvo, setAlvo] = useState(null)

  const largar = (destino) => {
    if (origem === null || destino === origem) return limpar()
    const nova = [...itens]
    const [movido] = nova.splice(origem, 1)
    nova.splice(destino, 0, movido)
    aoMudar(nova)
    limpar()
  }

  const limpar = () => {
    setOrigem(null)
    setAlvo(null)
  }

  const mover = (i, dir) => {
    const destino = i + dir
    if (destino < 0 || destino >= itens.length) return
    const nova = [...itens]
    ;[nova[i], nova[destino]] = [nova[destino], nova[i]]
    aoMudar(nova)
  }

  return itens.map((item, i) =>
    children({
      item,
      indice: i,
      mover,
      remover: () => aoMudar(itens.filter((_, k) => k !== i)),
      alterar: (dados) => aoMudar(itens.map((x, k) => (k === i ? dados : x))),
      // O que se cola no elemento que representa o item.
      arrastavel: {
        draggable: true,
        onDragStart: (e) => {
          setOrigem(i)
          e.dataTransfer.effectAllowed = 'move'
          // Sem isto o Firefox não chega a começar o arrastar.
          e.dataTransfer.setData('text/plain', String(i))
        },
        onDragOver: (e) => {
          e.preventDefault()
          if (alvo !== i) setAlvo(i)
        },
        onDrop: (e) => {
          e.preventDefault()
          largar(i)
        },
        onDragEnd: limpar,
        className:
          'admin__cartao' +
          (origem === i ? ' is-arrastado' : '') +
          (alvo === i && origem !== i ? ' is-alvo' : ''),
      },
    })
  )
}

/** Um cartão da grelha. Só o que faz sentido dentro de uma célula. */
const CAMPOS_DO_CARTAO = [
  ['titulo', 'Título'],
  ['texto', 'Texto'],
  ['botao', 'Botão'],
  ['destino', 'Destino do botão'],
]

/** Cabeçalho comum a cartões e blocos: pega para arrastar, setas e remover. */
function TopoDoItem({ nome, indice, total, mover, remover }) {
  return (
    <div className="admin__cartao-topo">
      <strong className="admin__pega" title="Arrastar para reordenar">
        ⠿ {nome}
      </strong>
      <div className="admin__acoes">
        <button
          type="button"
          className="admin__btn admin__btn--claro"
          onClick={() => mover(indice, -1)}
          disabled={indice === 0}
          aria-label="Passar para trás"
        >
          ↑
        </button>
        <button
          type="button"
          className="admin__btn admin__btn--claro"
          onClick={() => mover(indice, 1)}
          disabled={indice === total - 1}
          aria-label="Passar para a frente"
        >
          ↓
        </button>
        <button type="button" className="admin__btn admin__btn--perigo" onClick={remover}>
          Remover
        </button>
      </div>
    </div>
  )
}

/**
 * Lista de cartões, para as grelhas: acrescentar, remover e trocar de lugar.
 *
 * A grelha guarda os cartões como lista e não como campos numerados
 * (`titulo1`, `titulo2`, …) para o número de colunas e de cartões poderem
 * mudar sem deixar campos órfãos para trás.
 */
function CampoCartoes({ valor, aoMudar, etiqueta }) {
  const cartoes = Array.isArray(valor) ? valor : []

  return (
    <div className="admin__cartoes">
      <span className="admin__campo-etiqueta">{etiqueta}</span>

      <ListaArrastavel itens={cartoes} aoMudar={aoMudar}>
        {({ item, indice, mover, remover, alterar, arrastavel }) => (
          <div key={indice} {...arrastavel}>
            <TopoDoItem
              nome={`Cartão ${indice + 1}`}
              indice={indice}
              total={cartoes.length}
              mover={mover}
              remover={remover}
            />

            <CampoFotografia
              valor={item.fotografia || ''}
              aoMudar={(v) => alterar({ ...item, fotografia: v })}
            />

            {CAMPOS_DO_CARTAO.map(([chave, nome]) => (
              <label key={chave} className="admin__campo">
                <span>{nome}</span>
                {chave === 'texto' ? (
                  <textarea
                    rows={2}
                    value={item[chave] || ''}
                    onChange={(e) => alterar({ ...item, [chave]: e.target.value })}
                  />
                ) : (
                  <input
                    type="text"
                    value={item[chave] || ''}
                    onChange={(e) => alterar({ ...item, [chave]: e.target.value })}
                  />
                )}
              </label>
            ))}
          </div>
        )}
      </ListaArrastavel>

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

/**
 * Lista de blocos de uma secção de conteúdo livre.
 *
 * Cada bloco traz os seus próprios campos — os mesmos que os tipos de secção
 * declaram — por isso o formulário de cada um é o `Campos` de baixo, chamado
 * outra vez com a definição do bloco.
 */
function CampoBlocos({ valor, aoMudar, etiqueta }) {
  const blocos = Array.isArray(valor) ? valor : []

  const acrescentar = (tipo) =>
    aoMudar([...blocos, { tipo, ...TIPOS_DE_BLOCO[tipo].omissao }])

  return (
    <div className="admin__cartoes">
      <span className="admin__campo-etiqueta">{etiqueta}</span>

      <ListaArrastavel itens={blocos} aoMudar={aoMudar}>
        {({ item, indice, mover, remover, alterar, arrastavel }) => {
          const def = TIPOS_DE_BLOCO[item.tipo]
          return (
            <div key={indice} {...arrastavel}>
              <TopoDoItem
                nome={def?.nome || item.tipo}
                indice={indice}
                total={blocos.length}
                mover={mover}
                remover={remover}
              />
              {def && <Campos definicao={def} dados={item} aoMudar={alterar} />}
            </div>
          )
        }}
      </ListaArrastavel>

      <div className="admin__acoes admin__acoes--acrescentar">
        {Object.entries(TIPOS_DE_BLOCO).map(([tipo, def]) => (
          <button
            key={tipo}
            type="button"
            className="admin__btn admin__btn--claro"
            onClick={() => acrescentar(tipo)}
          >
            + {def.nome}
          </button>
        ))}
      </div>
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

    if (campo.tipo === 'blocos') {
      return (
        <CampoBlocos
          key={campo.chave}
          etiqueta={campo.etiqueta}
          valor={dados[campo.chave]}
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
