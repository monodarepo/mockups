import { serieDiaria } from '@/lib/series'
import { HOJE } from './constants'

export interface PontoProducaoPlano {
  label: string
  /** Produção real, em milhares de unidades. */
  real: number
  /** Plano, em milhares de unidades. */
  plano: number
}

const serieReal = serieDiaria('vg-producao-real', HOJE, 7, {
  base: 1_820,
  tendencia: 240,
  ruido: 0.025,
  decimais: 0,
})
const seriePlano = serieDiaria('vg-producao-plano', HOJE, 7, {
  base: 1_900,
  tendencia: 60,
  ruido: 0.01,
  decimais: 0,
})

/**
 * Produção real × plano dos últimos 7 dias (mil unidades/dia, rede).
 * Os valores finais são fixos — 2.094 real e 1.968 plano — e aparecem como
 * rótulos no card "Produção vs Plano" da Visão Geral.
 */
export const producaoVsPlano: PontoProducaoPlano[] = serieReal.map((ponto, indice) => ({
  label: ponto.label,
  real: indice === serieReal.length - 1 ? 2_094 : ponto.valor,
  plano: indice === seriePlano.length - 1 ? 1_968 : seriePlano[indice].valor,
}))
