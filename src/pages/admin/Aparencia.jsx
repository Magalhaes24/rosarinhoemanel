import { useState } from 'react'
import { doc, getFirestore, setDoc } from 'firebase/firestore'
import { app } from '../../lib/firebase.js'
import { useConteudo } from '../../lib/conteudo.jsx'
import {
  coresEditaveis,
  gruposDeTexto,
  temaPadrao,
  textosPadrao,
} from '../../data/conteudoPadrao.js'

const db = getFirestore(app)

const FONTES = [
  ["'Lovelace Text', 'Playfair Display', Georgia, serif", 'Lovelace Text (títulos)'],
  ["'Garet', 'Poppins', 'Segoe UI', sans-serif", 'Garet (corpo)'],
  ["'The Seasons', 'Cormorant Garamond', Georgia, serif", 'The Seasons (formulários)'],
  ['Georgia, serif', 'Georgia'],
  ['"Times New Roman", serif', 'Times New Roman'],
  ['system-ui, sans-serif', 'Do sistema'],
]

/** Grava o documento único de conteúdo, juntando ao que já lá está. */
async function gravar(parcial) {
  await setDoc(doc(db, 'conteudo', 'site'), parcial, { merge: true })
}

function BarraGravar({ estado, aoGravar, aoRepor }) {
  return (
    <div className="admin__barra-acoes">
      <button type="button" className="admin__btn" onClick={aoGravar} disabled={estado === 'a-gravar'}>
        {estado === 'a-gravar' ? 'A gravar…' : 'Gravar alterações'}
      </button>
      <button type="button" className="admin__btn admin__btn--claro" onClick={aoRepor}>
        Repor o original
      </button>
      {estado === 'ok' && <span className="admin__ok">Gravado.</span>}
      {estado === 'erro' && <span className="admin__erro">Não foi possível gravar.</span>}
    </div>
  )
}

function Tema() {
  const { tema } = useConteudo()
  const [rascunho, setRascunho] = useState(tema)
  const [estado, setEstado] = useState('idle')

  const muda = (k, v) => setRascunho({ ...rascunho, [k]: v })

  async function submeter() {
    setEstado('a-gravar')
    try {
      await gravar({ tema: rascunho })
      setEstado('ok')
    } catch {
      setEstado('erro')
    }
  }

  return (
    <section className="admin__seccao">
      <h2>Cores, tipos de letra e tamanhos</h2>
      <p className="admin__ajuda">
        As alterações aplicam-se ao site inteiro assim que gravares. Enquanto não gravares, só as
        vês aqui.
      </p>

      <h3 className="admin__sub">Cores</h3>
      <div className="admin__cores">
        {coresEditaveis.map(([chave, nome]) => (
          <label key={chave} className="admin__cor">
            <input
              type="color"
              value={rascunho[chave] || '#000000'}
              onChange={(e) => muda(chave, e.target.value)}
            />
            <span>{nome}</span>
            <code>{rascunho[chave]}</code>
          </label>
        ))}
      </div>

      <h3 className="admin__sub">Tipos de letra</h3>
      {[
        ['fonteTitulos', 'Títulos'],
        ['fonteCorpo', 'Texto corrido e menu'],
        ['fonteFormularios', 'Formulários e IBAN'],
      ].map(([chave, nome]) => (
        <label key={chave} className="admin__campo">
          <span>{nome}</span>
          <select value={rascunho[chave]} onChange={(e) => muda(chave, e.target.value)}>
            {FONTES.map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </label>
      ))}

      <h3 className="admin__sub">Tamanhos e espaçamento</h3>
      {[
        ['escalaTitulos', 'Tamanho dos títulos', 0.6, 1.6],
        ['escalaCorpo', 'Tamanho do texto', 0.6, 1.6],
        ['respiro', 'Espaçamento vertical', 1, 2],
      ].map(([chave, nome, min, max]) => (
        <label key={chave} className="admin__campo admin__campo--range">
          <span>
            {nome} <code>{Number(rascunho[chave]).toFixed(2)}×</code>
          </span>
          <input
            type="range"
            min={min}
            max={max}
            step="0.05"
            value={rascunho[chave]}
            onChange={(e) => muda(chave, Number(e.target.value))}
          />
        </label>
      ))}

      <BarraGravar
        estado={estado}
        aoGravar={submeter}
        aoRepor={() => setRascunho(temaPadrao)}
      />
    </section>
  )
}

function Textos() {
  const { textos } = useConteudo()
  const [rascunho, setRascunho] = useState(textos)
  const [estado, setEstado] = useState('idle')

  async function submeter() {
    setEstado('a-gravar')
    try {
      await gravar({ textos: rascunho })
      setEstado('ok')
    } catch {
      setEstado('erro')
    }
  }

  return (
    <section className="admin__seccao">
      <h2>Textos do site</h2>
      <p className="admin__ajuda">
        Todo o texto visível, agrupado por secção. Deixar um campo vazio faz voltar ao texto
        original.
      </p>

      {gruposDeTexto.map((grupo) => (
        <div key={grupo.titulo} className="admin__grupo">
          <h3 className="admin__sub">{grupo.titulo}</h3>
          {grupo.chaves.map((chave) => {
            const valor = rascunho[chave] ?? ''
            const longo = (textosPadrao[chave] || '').length > 60 || valor.includes('\n')
            return (
              <label key={chave} className="admin__campo">
                <span>
                  <code>{chave}</code>
                </span>
                {longo ? (
                  <textarea
                    rows={3}
                    value={valor}
                    onChange={(e) => setRascunho({ ...rascunho, [chave]: e.target.value })}
                  />
                ) : (
                  <input
                    type="text"
                    value={valor}
                    onChange={(e) => setRascunho({ ...rascunho, [chave]: e.target.value })}
                  />
                )}
              </label>
            )
          })}
        </div>
      ))}

      <BarraGravar estado={estado} aoGravar={submeter} aoRepor={() => setRascunho(textosPadrao)} />
    </section>
  )
}

export default function Aparencia({ separador }) {
  return separador === 'tema' ? <Tema /> : <Textos />
}
