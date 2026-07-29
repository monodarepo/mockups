/**
 * Gerador determinístico de séries do HPO.
 *
 * Regra do produto: recarregar a página nunca muda um número. Nada aqui usa
 * Math.random — toda variação vem de um PRNG semeado por string, então a mesma
 * seed sempre devolve a mesma série.
 */
import { addDays, addHours, subDays } from 'date-fns'
import { formatDiaMes, formatHora } from './format'

/** Hash FNV-1a de 32 bits — converte a seed textual em inteiro estável. */
function hashSeed(seed: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** PRNG mulberry32: rápido, estável e suficiente para dados de mockup. */
function mulberry32(estado: number): () => number {
  let a = estado
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Sorteador determinístico exposto para mocks que precisam de variação própria. */
export function criarRandom(seed: string): () => number {
  return mulberry32(hashSeed(seed))
}

export interface OpcoesSerie {
  /** Seed textual — mesma seed, mesma série. */
  seed: string
  /** Quantidade de pontos. */
  pontos: number
  /** Valor inicial da série. */
  base: number
  /** Variação total acumulada do começo ao fim (em unidades do valor). */
  tendencia?: number
  /** Amplitude do ruído, em fração do valor base (0.04 = ±4%). */
  ruido?: number
  /** Amplitude de uma onda senoidal sobreposta, em fração do valor base. */
  sazonalidade?: number
  /** Limites de recorte. */
  min?: number
  max?: number
  /** Casas decimais do resultado. */
  decimais?: number
}

/**
 * Série numérica = base + tendência linear + onda sazonal + ruído suavizado.
 * O ruído passa por uma média móvel de 3 pontos para evitar serrilhado.
 */
export function gerarSerie({
  seed,
  pontos,
  base,
  tendencia = 0,
  ruido = 0.04,
  sazonalidade = 0,
  min,
  max,
  decimais = 1,
}: OpcoesSerie): number[] {
  const rand = criarRandom(seed)
  const bruto: number[] = []
  for (let i = 0; i < pontos; i++) bruto.push(rand() * 2 - 1)

  const suave = bruto.map((_, i) => {
    const anterior = bruto[i - 1] ?? bruto[i]
    const proximo = bruto[i + 1] ?? bruto[i]
    return (anterior + bruto[i] * 2 + proximo) / 4
  })

  const fator = 10 ** decimais
  return suave.map((n, i) => {
    const progresso = pontos > 1 ? i / (pontos - 1) : 0
    const onda = sazonalidade ? Math.sin(progresso * Math.PI * 2) * base * sazonalidade : 0
    let valor = base + tendencia * progresso + onda + n * base * ruido
    if (min !== undefined) valor = Math.max(min, valor)
    if (max !== undefined) valor = Math.min(max, valor)
    return Math.round(valor * fator) / fator
  })
}

export interface PontoSerie {
  /** Rótulo pronto para o eixo X. */
  label: string
  valor: number
  /** Instante do ponto — útil para tooltips e ordenação. */
  data: Date
}

/**
 * Série horária de um turno (8 h por padrão), rotulada "06:00", "07:00"…
 */
export function serieHoraria(
  seed: string,
  inicio: Date,
  opcoes: Omit<OpcoesSerie, 'seed' | 'pontos'> & { horas?: number },
): PontoSerie[] {
  const { horas = 8, ...resto } = opcoes
  const valores = gerarSerie({ seed, pontos: horas, ...resto })
  return valores.map((valor, i) => {
    const data = addHours(inicio, i)
    return { label: formatHora(data), valor, data }
  })
}

/**
 * Série diária terminando no dia de referência (inclusive), rotulada "13/mai".
 * Use dias = 7 ou 30.
 */
export function serieDiaria(
  seed: string,
  referencia: Date,
  dias: number,
  opcoes: Omit<OpcoesSerie, 'seed' | 'pontos'>,
): PontoSerie[] {
  const valores = gerarSerie({ seed, pontos: dias, ...opcoes })
  const primeiro = subDays(referencia, dias - 1)
  return valores.map((valor, i) => {
    const data = addDays(primeiro, i)
    return { label: formatDiaMes(data), valor, data }
  })
}

/** Série curta e crua para sparklines de KpiCard. */
export function serieSparkline(
  seed: string,
  pontos = 12,
  opcoes: Partial<Omit<OpcoesSerie, 'seed' | 'pontos'>> = {},
): number[] {
  return gerarSerie({ seed, pontos, base: 100, ruido: 0.05, ...opcoes })
}

/** Escolha determinística dentro de uma lista. */
export function escolher<T>(seed: string, itens: readonly T[]): T {
  return itens[Math.floor(criarRandom(seed)() * itens.length) % itens.length]
}

/** Inteiro determinístico no intervalo [min, max]. */
export function inteiroEntre(seed: string, min: number, max: number): number {
  return min + Math.floor(criarRandom(seed)() * (max - min + 1))
}
