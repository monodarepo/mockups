/**
 * Tokens de cor do design system do HPO.
 * Espelham o tailwind.config.js — use estes valores em SVGs e no recharts,
 * onde classes utilitárias não chegam.
 */

export const colors = {
  app: '#F6F8FB',
  card: '#FFFFFF',
  line: '#E6EBF2',
  ink: '#0F172A',
  muted: '#64748B',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primarySoft: '#EFF6FF',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#0EA5E9',
  setup: '#F97316',
  clean: '#8B5CF6',
  neutral: '#64748B',
} as const

/** Paleta ordenada para séries de gráfico com mais de uma dimensão. */
export const chartPalette = [
  colors.primary,
  colors.info,
  colors.success,
  colors.warning,
  colors.clean,
  colors.setup,
  colors.danger,
] as const

/** Tons semânticos usados por StatusPill, KpiCard, Badge e afins. */
export type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'setup' | 'clean' | 'neutral'

export const toneHex: Record<Tone, string> = {
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  info: colors.info,
  setup: colors.setup,
  clean: colors.clean,
  neutral: colors.neutral,
}

/** Classes utilitárias por tom: fundo suave + texto forte (padrão do StatusPill). */
export const toneSoftClass: Record<Tone, string> = {
  primary: 'bg-primary-soft text-primary-strong',
  success: 'bg-success-soft text-success-strong',
  warning: 'bg-warning-soft text-warning-strong',
  danger: 'bg-danger-soft text-danger-strong',
  info: 'bg-info-soft text-info-strong',
  setup: 'bg-setup-soft text-setup-strong',
  clean: 'bg-clean-soft text-clean-strong',
  neutral: 'bg-neutral-soft text-neutral-strong',
}

export const toneTextClass: Record<Tone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning-strong',
  danger: 'text-danger',
  info: 'text-info-strong',
  setup: 'text-setup-strong',
  clean: 'text-clean-strong',
  neutral: 'text-muted',
}

/**
 * Mapa de rótulo de status → tom, conforme a regra do design system.
 * Consultado por StatusPill; aceita qualquer capitalização.
 */
const statusTone: Record<string, Tone> = {
  // Vermelho
  crítico: 'danger',
  critico: 'danger',
  crítica: 'danger',
  alto: 'danger',
  alta: 'danger',
  reprovado: 'danger',
  rejeitado: 'danger',
  rejeitada: 'danger',
  atrasado: 'danger',
  atrasada: 'danger',
  'em risco': 'danger',
  // Âmbar
  médio: 'warning',
  medio: 'warning',
  média: 'warning',
  media: 'warning',
  atenção: 'warning',
  atencao: 'warning',
  pendente: 'warning',
  'em aprovação': 'warning',
  monitorando: 'warning',
  escalado: 'danger',
  // Verde
  baixo: 'success',
  baixa: 'success',
  normal: 'success',
  'no prazo': 'success',
  liberado: 'success',
  aprovado: 'success',
  aprovada: 'success',
  executada: 'success',
  executado: 'success',
  atualizado: 'success',
  atualizada: 'success',
  concluído: 'success',
  concluido: 'success',
  // Azul
  info: 'info',
  aberto: 'info',
  planejada: 'info',
  planejado: 'info',
  programada: 'info',
  programado: 'info',
  'sob demanda': 'info',
  'em análise': 'info',
  'em analise': 'info',
  'em execução': 'info',
  'em execucao': 'info',
  // Cinza
  bloqueado: 'neutral',
  pausado: 'neutral',
  parada: 'neutral',
  parado: 'neutral',
}

export function toneForStatus(status: string): Tone {
  return statusTone[status.trim().toLowerCase()] ?? 'neutral'
}
