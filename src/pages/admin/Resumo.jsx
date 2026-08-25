import { useEffect, useState } from 'react'
import { collection, getFirestore, onSnapshot } from 'firebase/firestore'
import { app } from '../../lib/firebase.js'
import { useConteudo } from '../../lib/conteudo.jsx'
import { euros } from '../../components/OferecerPresente.jsx'
import { resumo } from '../../lib/contribuicoes.js'

const db = getFirestore(app)

/**
 * Os números que abrem a administração, e as contagens dos separadores.
 *
 * Escuta as coleções em vez de as ir buscar uma vez: assim, uma contribuição
 * que chegue com a página aberta aparece nos totais sem ninguém recarregar.
 * Os erros ficam calados de propósito — se as regras ainda não estiverem
 * publicadas, é o painel de cada separador que o diz, e não vale a pena
 * repetir o aviso três vezes no topo.
 */
export function useNumeros() {
  const { presentesCasa } = useConteudo()
  const [contribuicoes, setContribuicoes] = useState([])
  const [rsvps, setRsvps] = useState([])

  useEffect(() => {
    const parar = [
      onSnapshot(
        collection(db, 'contribuicoes'),
        (snap) => setContribuicoes(snap.docs.map((d) => d.data())),
        () => {}
      ),
      onSnapshot(
        collection(db, 'rsvps'),
        (snap) => setRsvps(snap.docs.map((d) => d.data())),
        () => {}
      ),
    ]
    return () => parar.forEach((p) => p())
  }, [])

  const contas = resumo(contribuicoes, presentesCasa)

  return {
    ...contas,
    vem: rsvps.filter((r) => r.presenca === 'sim').length,
    contagens: {
      contribuicoes: contribuicoes.length,
      presentes: presentesCasa?.length ?? 0,
      rsvps: rsvps.length,
    },
  }
}

/** Os três cartões de números no topo da administração. */
export default function Resumo({ numeros }) {
  const cartoes = [
    [
      'Total angariado',
      euros(numeros.total),
      `${numeros.quantas} ${numeros.quantas === 1 ? 'contribuição registada' : 'contribuições registadas'}`,
    ],
    [
      'Presentes completos',
      String(numeros.completos),
      numeros.porCompletar === 0
        ? 'Está tudo completo.'
        : `${numeros.porCompletar} ainda por completar`,
    ],
    ['Valor médio', euros(numeros.media), 'Média por contribuição recebida'],
    [
      'Confirmações',
      String(numeros.vem),
      `${numeros.contagens.rsvps} ${numeros.contagens.rsvps === 1 ? 'resposta' : 'respostas'} ao todo`,
    ],
  ]

  return (
    <section className="admin__numeros" aria-label="Resumo">
      {cartoes.map(([etiqueta, valor, nota]) => (
        <article key={etiqueta} className="admin__numero">
          <span className="admin__numero-etiqueta">{etiqueta}</span>
          <strong className="admin__numero-valor">{valor}</strong>
          <span className="admin__numero-nota">{nota}</span>
        </article>
      ))}
    </section>
  )
}
