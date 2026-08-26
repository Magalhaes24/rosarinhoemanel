import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Os botões de acção de um separador, desenhados na faixa lá em cima.
 *
 * Quem os declara é o separador — só ele sabe o que fazem e tem o estado do
 * formulário — mas o sítio onde aparecem é a faixa, ao pé dos separadores. Um
 * portal resolve as duas coisas sem levar estado nenhum para fora de casa.
 *
 * Vive num ficheiro só seu, e não dentro do `Admin`, para os separadores não
 * terem de importar a página que os desenha — seria uma volta em círculo.
 */
export default function AccoesDaFaixa({ children }) {
  const [destino, setDestino] = useState(null)

  useEffect(() => {
    setDestino(document.getElementById('admin-faixa-accoes'))
  }, [])

  // Enquanto a faixa não estiver desenhada, os botões ficam onde foram escritos.
  return destino ? createPortal(children, destino) : children
}
