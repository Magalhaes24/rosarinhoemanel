import { Link } from '../lib/router.jsx'
import { useEdicao } from '../lib/edicao.jsx'
import './BarraEdicao.css'

const MENSAGENS = {
  ok: 'Gravado.',
  erro: 'Não foi possível gravar.',
  'sem-permissao': 'Sem permissão para gravar. Falta publicar as regras: npm run regras',
}

export default function BarraEdicao() {
  const { podeEditar, emEdicao, alternar, porGravar, resumo, gravar, descartar, estado } =
    useEdicao()

  // Invisível para quem não é o admin — que é toda a gente.
  if (!podeEditar) return null

  return (
    <div className={'barra-edicao' + (emEdicao ? ' is-ativa' : '')}>
      <button type="button" className="barra-edicao__principal" onClick={alternar}>
        {emEdicao ? 'Sair da edição' : 'Editar esta página'}
      </button>

      {emEdicao && (
        <>
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
            onClick={descartar}
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
  )
}
