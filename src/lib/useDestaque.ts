import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Lê `?destaque=` da URL (gravado pela busca global), devolve o id por 3 s
 * para a tela realçar a linha correspondente e depois limpa o parâmetro.
 */
export function useDestaque(): string | undefined {
  const [searchParams, setSearchParams] = useSearchParams()
  const destaque = searchParams.get('destaque') ?? undefined
  const [ativo, setAtivo] = useState<string | undefined>(destaque)

  useEffect(() => {
    if (!destaque) return
    setAtivo(destaque)
    const timer = window.setTimeout(() => {
      setAtivo(undefined)
      setSearchParams(
        (params) => {
          params.delete('destaque')
          return params
        },
        { replace: true },
      )
    }, 3_000)
    return () => window.clearTimeout(timer)
  }, [destaque, setSearchParams])

  return ativo
}
