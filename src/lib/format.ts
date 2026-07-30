/**
 * Formatação pt-BR do HPO. Toda a UI passa por aqui — nenhuma tela formata
 * número, moeda ou data por conta própria.
 */
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const nf = (min: number, max: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: min, maximumFractionDigits: max })

/** 1256840 → "1.256.840" · (1256.84, 2) → "1.256,84" */
export function formatNumero(valor: number, decimais = 0): string {
  return nf(decimais, decimais).format(valor)
}

/** 92.4 → "92,4%" · (92.4, 0) → "92%" */
export function formatPercent(valor: number, decimais = 1): string {
  return `${nf(decimais, decimais).format(valor)}%`
}

/** Percentual com sinal explícito: 2.1 → "+2,1%" */
export function formatPercentAssinado(valor: number, decimais = 1): string {
  return `${valor > 0 ? '+' : ''}${formatPercent(valor, decimais)}`
}

/** Diferença em pontos percentuais: -1.8 → "-1,8 p.p." · 3 → "+3,0 p.p." */
export function formatPontosPercentuais(valor: number, decimais = 1): string {
  return `${valor > 0 ? '+' : ''}${nf(decimais, decimais).format(valor)} p.p.`
}

/** Moeda cheia: 1256840 → "R$ 1.256.840,00" */
export function formatMoeda(valor: number, decimais = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  }).format(valor)
}

/**
 * Moeda compacta do design system:
 * 620000 → "R$ 620 mil" · 1840000 → "R$ 1,84 mi" · 2300000000 → "R$ 2,3 bi" · 840 → "R$ 840"
 */
export function formatMoedaCompacta(valor: number): string {
  const sinal = valor < 0 ? '-' : ''
  const abs = Math.abs(valor)

  if (abs >= 1_000_000_000) return `${sinal}R$ ${nf(0, 2).format(abs / 1_000_000_000)} bi`
  if (abs >= 1_000_000) return `${sinal}R$ ${nf(0, 2).format(abs / 1_000_000)} mi`
  if (abs >= 1_000) return `${sinal}R$ ${nf(0, 0).format(Math.round(abs / 1_000))} mil`
  return `${sinal}R$ ${nf(0, 0).format(abs)}`
}

/** Número compacto sem moeda: 1256840 → "1,26 mi" · 12500 → "12,5 mil" */
export function formatNumeroCompacto(valor: number): string {
  const sinal = valor < 0 ? '-' : ''
  const abs = Math.abs(valor)

  if (abs >= 1_000_000) return `${sinal}${nf(0, 2).format(abs / 1_000_000)} mi`
  if (abs >= 10_000) return `${sinal}${nf(0, 1).format(abs / 1_000)} mil`
  return `${sinal}${nf(0, 0).format(abs)}`
}

/** Unidade colada ao número: (12.3, "mm/s") → "12,3 mm/s" */
export function formatUnidade(valor: number, unidade: string, decimais = 1): string {
  return `${nf(decimais, decimais).format(valor)} ${unidade}`
}

/** Cronômetro HH:MM:SS a partir de segundos: 16038 → "04:27:18" */
export function formatHorasMinSeg(totalSegundos: number): string {
  const segundosPositivos = Math.max(0, Math.floor(totalSegundos))
  const h = Math.floor(segundosPositivos / 3600)
  const m = Math.floor((segundosPositivos % 3600) / 60)
  const s = segundosPositivos % 60
  const dois = (valor: number) => String(valor).padStart(2, '0')
  return `${dois(h)}:${dois(m)}:${dois(s)}`
}

/** Duração em minutos → "2 h 15 min" · "45 min" */
export function formatDuracao(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = Math.round(minutos % 60)
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

/** Data no padrão do produto: 19/mai/2025 */
export function formatData(data: Date): string {
  return format(data, 'dd/MMM/yyyy', { locale: ptBR })
}

/** Data numérica: 19/05/2025 */
export function formatDataNumerica(data: Date): string {
  return format(data, 'dd/MM/yyyy', { locale: ptBR })
}

/** Dia curto para eixos de gráfico: 19/mai */
export function formatDiaMes(data: Date): string {
  return format(data, 'dd/MMM', { locale: ptBR })
}

/** Dia da semana abreviado: seg, ter, qua… */
export function formatDiaSemana(data: Date): string {
  return format(data, 'EEE', { locale: ptBR })
}

/** Hora cravada: 06:00 */
export function formatHora(data: Date): string {
  return format(data, 'HH:mm', { locale: ptBR })
}

/** Faixa de hora com travessão do design system: "06:00 – 14:00" */
export function formatFaixaHoraria(inicio: Date, fim: Date): string {
  return `${formatHora(inicio)} – ${formatHora(fim)}`
}

/** Carimbo do rodapé: "19/05/2025 10:18" */
export function formatDataHora(data: Date): string {
  return `${formatDataNumerica(data)} ${formatHora(data)}`
}

/** Data e hora por extenso curto: "19/mai/2025 · 10:18" */
export function formatDataHoraLonga(data: Date): string {
  return `${formatData(data)} · ${formatHora(data)}`
}

/** Hora relativa ao "agora" da simulação: "há 2 min", "há 1 h", "agora". */
export function formatHoraRelativa(data: Date, referencia: Date): string {
  const minutos = Math.round((referencia.getTime() - data.getTime()) / 60000)
  if (minutos < 1) return 'agora'
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.floor(minutos / 60)
  return `há ${formatNumero(horas)} h`
}
