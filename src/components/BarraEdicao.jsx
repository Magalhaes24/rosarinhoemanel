import { useState } from 'react'
import { Link, useLocation } from '../lib/router.jsx'
import { useEdicao } from '../lib/edicao.jsx'
import { useConfirmar } from './Confirmacao.jsx'
import PainelAparencia from './PainelAparencia.jsx'
import './BarraEdicao.css'

const MENSAGENS = {
  ok: 'Gravado.',
  erro: 'Não foi possível gravar.',
  'sem-permissao': 'Sem permissão para gravar. Falta publicar as regras: npm run regras',
}

export default function BarraEdicao() {
  const { podeEditar, emEdicao, alternar, porGravar, resumo, gravar, descartar, estado } =
    useEdicao()
  const { pathname } = useLocation()
  const confirmar = useConfirmar()
  const [aparencia, setAparencia] = useState(false)

  /**
   * Sair da edição com alterações por gravar apagava-as sem dizer nada.
   *
   * O rascunho vive em memória: sair do modo de edição deixa de o mostrar e o
   * primeiro recarregamento leva-o. Quem tinha removido uma secção via-a
   * voltar sem perceber porquê — e a culpa parecia ser do botão de remover.
   */
  const sair = async () => {
    if (!emEdicao || !porGravar) {
      alternar()
      return
    }
    const ok = await confirmar({
      titulo: 'Sair sem gravar?',
      mensagem:
        'As alterações que fizeste ainda não estão no site. Se saíres agora, perdem-se.',
      detalhe: resumo,
      textoConfirmar: 'Sair e perder',
    })
    if (!ok) return
    descartar()
    alternar()
  }
  // Invisível para quem não é o admin — que é toda a gente.
  if (!podeEditar) return null

  // Na administração não há nada nesta página para editar no sítio: a barra só
  // faria ruído por cima de uma ferramenta que já tem os seus próprios botões.
  if (pathname === '/admin') return null

  return (
    <>
      {emEdicao && aparencia && <PainelAparencia aoFechar={() => setAparencia(false)} />}

      <div className={'barra-edicao' + (emEdicao ? ' is-ativa' : '')}>
        <button type="button" className="barra-edicao__principal" onClick={sair}>
          {emEdicao ? 'Sair da edição' : 'Editar esta página'}
        </button>

        {emEdicao && (
          <>
            <button
              type="button"
              className={'barra-edicao__btn' + (aparencia ? ' is-ativo' : '')}
              onClick={() => setAparencia((v) => !v)}
              aria-pressed={aparencia}
            >
              Aparência
            </button>

            <span className="barra-edicao__estado">{resumo}</span>

            <button
              type="button"
              className="barra-edicao__btn"
              onClick={gravar}
              disabled={!porGravar || estado === 'a-gravar'}
            >
              {estado === 'a-gravar' ? 'A gravar…' : 'Gravar'}
            </button>

            <button
              type="button"
              className="barra-edicao__btn barra-edicao__btn--claro"
              onClick={async () => {
                const ok = await confirmar({
                  titulo: 'Descartar as alterações?',
                  mensagem: 'Voltam a ficar como estavam no site. Não dá para desfazer.',
                  detalhe: resumo,
                  textoConfirmar: 'Descartar',
                })
                if (ok) descartar()
              }}
              disabled={!porGravar}
            >
              Descartar
            </button>

            <Link to="/admin" className="barra-edicao__btn barra-edicao__btn--claro">
              Administração
            </Link>
          </>
        )}

        {MENSAGENS[estado] && (
          <span className={'barra-edicao__msg' + (estado === 'ok' ? ' is-ok' : ' is-erro')}>
            {MENSAGENS[estado]}
          </span>
        )}
      </div>
    </>
  )
}
