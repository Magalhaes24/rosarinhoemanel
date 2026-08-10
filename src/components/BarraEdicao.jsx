import { useState } from 'react'
import { Link, useLocation } from '../lib/router.jsx'
import { useEdicao } from '../lib/edicao.jsx'
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
  const [aparencia, setAparencia] = useState(false)
  // Invisível para quem não é o admin — que é toda a gente.
  if (!podeEditar) return null

  // Na administração não há nada nesta página para editar no sítio: a barra só
  // faria ruído por cima de uma ferramenta que já tem os seus próprios botões.
  if (pathname === '/admin') return null

  return (
    <>
      {emEdicao && aparencia && <PainelAparencia aoFechar={() => setAparencia(false)} />}

      <div className={'barra-edicao' + (emEdicao ? ' is-ativa' : '')}>
        <button type="button" className="barra-edicao__principal" onClick={alternar}>
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
    </>
  )
}
