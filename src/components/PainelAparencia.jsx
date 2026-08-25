import { useConteudo } from '../lib/conteudo.jsx'
import { useEdicao } from '../lib/edicao.jsx'
import { coresEditaveis, temaPadrao } from '../data/conteudoPadrao.js'
import './PainelAparencia.css'

const FONTES = [
  ["'Lovelace Text', 'Playfair Display', Georgia, serif", 'Lovelace Text'],
  ["'Garet', 'Poppins', 'Segoe UI', sans-serif", 'Garet'],
  ["'The Seasons', 'Cormorant Garamond', Georgia, serif", 'The Seasons'],
  ['Georgia, serif', 'Georgia'],
  ['"Times New Roman", serif', 'Times New Roman'],
  ['system-ui, sans-serif', 'Do sistema'],
]

const ESCALAS = [
  ['escalaTitulos', 'Tamanho dos títulos', 0.6, 1.6, 0.05],
  ['escalaCorpo', 'Tamanho do texto', 0.6, 1.6, 0.05],
  ['respiro', 'Espaçamento vertical', 1, 2, 0.05],
]

/**
 * Cores, tipos de letra e tamanhos, editados sobre o próprio site.
 *
 * As alterações entram no mesmo rascunho de tudo o resto, por isso veem-se de
 * imediato nas páginas por trás e gravam-se com o mesmo botão. Estão aqui, e
 * não junto de cada elemento, porque são globais: mudar o verde muda-o em
 * todo o lado, e um seletor por secção daria a ideia errada.
 */
export default function PainelAparencia({ aoFechar }) {
  const { tema } = useConteudo()
  const { alterarTema } = useEdicao()

  const reporTudo = () => {
    for (const [chave, valor] of Object.entries(temaPadrao)) alterarTema(chave, valor)
    // Os tamanhos dados a textos soltos não estão no tema original, por isso
    // não eram apanhados pelo ciclo de cima e sobreviviam ao «repor».
    for (const chave of Object.keys(tema)) {
      if (chave.startsWith('tamanho.')) alterarTema(chave, 1)
      if (chave.startsWith('largura.')) alterarTema(chave, 100)
      if (chave.startsWith('alinhar.')) alterarTema(chave, '')
    }
  }

  return (
    <aside className="aparencia" aria-label="Aparência do site">
      <header className="aparencia__topo">
        <h2>Aparência</h2>
        <button type="button" className="aparencia__fechar" onClick={aoFechar} aria-label="Fechar">
          ×
        </button>
      </header>

      <p className="aparencia__ajuda">
        Aplica-se ao site inteiro. Vês o resultado por trás enquanto mexes; só fica gravado quando
        carregares em «Gravar». Para mexer só num texto — tamanho, lado e largura da caixa —
        carrega nele no site e usa os botões que aparecem por cima.
      </p>

      <h3 className="aparencia__sub">Cores</h3>
      <div className="aparencia__cores">
        {coresEditaveis.map(([chave, nome]) => (
          <label key={chave} className="aparencia__cor">
            <input
              type="color"
              value={tema[chave] || '#000000'}
              onChange={(e) => alterarTema(chave, e.target.value)}
            />
            <span>{nome}</span>
          </label>
        ))}
      </div>

      <h3 className="aparencia__sub">Tipos de letra</h3>
      {[
        ['fonteTitulos', 'Títulos'],
        ['fonteCorpo', 'Texto e menu'],
        ['fonteFormularios', 'Formulários'],
      ].map(([chave, nome]) => (
        <label key={chave} className="aparencia__campo">
          <span>{nome}</span>
          <select value={tema[chave]} onChange={(e) => alterarTema(chave, e.target.value)}>
            {FONTES.map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </label>
      ))}

      <h3 className="aparencia__sub">Tamanhos e espaçamento</h3>
      {ESCALAS.map(([chave, nome, min, max, passo]) => (
        <label key={chave} className="aparencia__campo">
          <span>
            {nome} <code>{Number(tema[chave]).toFixed(2)}×</code>
          </span>
          <input
            type="range"
            min={min}
            max={max}
            step={passo}
            value={tema[chave]}
            onChange={(e) => alterarTema(chave, Number(e.target.value))}
          />
        </label>
      ))}

      <button type="button" className="aparencia__repor" onClick={reporTudo}>
        Repor a aparência original
      </button>
    </aside>
  )
}
