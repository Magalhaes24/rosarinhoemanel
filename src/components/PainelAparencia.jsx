import { useConteudo } from '../lib/conteudo.jsx'
import { useEdicao } from '../lib/edicao.jsx'
import { coresEditaveis, gruposDeTexto, temaPadrao } from '../data/conteudoPadrao.js'
import { FONTES } from '../data/fontes.js'
import './PainelAparencia.css'


/** O nome do grupo onde o texto vive, para o eliminado se reconhecer. */
function ondeVive(chave) {
  const grupo = gruposDeTexto.find((g) => g.chaves.includes(chave))
  return grupo ? grupo.titulo : 'Site'
}

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
      if (chave.startsWith('cor.')) alterarTema(chave, '')
      if (chave.startsWith('fundo.')) alterarTema(chave, '')
      if (chave.startsWith('espaco.')) alterarTema(chave, '')
      if (chave.startsWith('peso.')) alterarTema(chave, '')
      if (chave.startsWith('fonte.')) alterarTema(chave, '')
      if (chave.startsWith('oculto.')) alterarTema(chave, '')
    }
  }

  const eliminados = Object.keys(tema)
    .filter((c) => c.startsWith('oculto.') && tema[c])
    .map((c) => c.slice('oculto.'.length))

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
        carregares em «Gravar». Para mexer só num texto — tamanho, lado, largura, espaço e cores —
        carrega nele no site e usa os botões que aparecem por cima (o «B» põe a negrito, o «Aa» muda a letra e o «🗑» elimina o item);
        as cores de uma secção inteira estão na barra que aparece por cima dela.
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

      {eliminados.length > 0 && (
        <>
          <h3 className="aparencia__sub">Itens eliminados</h3>
          <ul className="aparencia__eliminados">
            {eliminados.map((chave) => (
              <li key={chave}>
                <span>
                  {ondeVive(chave)} <code>{chave}</code>
                </span>
                <button type="button" onClick={() => alterarTema(`oculto.${chave}`, '')}>
                  Repor
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <button type="button" className="aparencia__repor" onClick={reporTudo}>
        Repor a aparência original
      </button>
    </aside>
  )
}
