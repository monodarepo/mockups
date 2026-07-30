import type { BlocoSequencia, FamiliaProduto, Restricao, TipoBloco } from './types'

/**
 * Sequência de produção de Anápolis para a semana 20–26/mai/2025 — fonte
 * única do Gantt de /sequenciamento. Os IDs de bloco são estáveis entre a
 * sequência vigente e a otimizada para permitir animação de reordenação.
 */

const dt = (dia: number, hora = 0, minuto = 0) => new Date(2025, 4, dia, hora, minuto)

/** Início do eixo do Gantt: Seg 20/mai, 00:00. */
export const GANTT_INICIO = dt(20)
/** Fim do eixo do Gantt: Dom 26/mai, 24:00. */
export const GANTT_FIM = dt(27)

interface OpcoesBloco {
  ordemId?: string
  risco?: boolean
  motivoRisco?: string
}

function bloco(
  id: string,
  linhaId: string,
  tipo: TipoBloco,
  inicio: Date,
  fim: Date,
  rotulo: string,
  opcoes: OpcoesBloco = {},
): BlocoSequencia {
  return { id, linhaId, tipo, inicio, fim, rotulo, ...opcoes }
}

/**
 * Sequência vigente (~35 blocos). Ineficiências propositais da história:
 * a L08 alterna Analgésicos → Antitérmicos → Analgésicos e a L05 divide o
 * Dorflex em duas corridas — é o que a otimização corrige.
 */
export const blocosSequencia: BlocoSequencia[] = [
  // L12 — Comprimidos
  bloco('l12-s1', 'L12', 'setup', dt(20, 6), dt(20, 8), 'Setup Buscopan Composto'),
  bloco('l12-p1', 'L12', 'producao', dt(20, 8), dt(22, 16), 'Buscopan Composto', {
    ordemId: 'OF-045678',
    risco: true,
    motivoRisco: 'Cobertura de Ibuprofeno API em 1,4 dia — risco de parada por material.',
  }),
  bloco('l12-l1', 'L12', 'limpeza', dt(22, 16), dt(22, 19), 'Limpeza completa'),
  bloco('l12-s2', 'L12', 'setup', dt(22, 19), dt(22, 20), 'Ajuste de ferramental'),
  bloco('l12-m1', 'L12', 'manutencao', dt(23, 8), dt(23, 16), 'Preventiva Compressora L12'),
  bloco('l12-f1', 'L12', 'folga', dt(23, 16), dt(25, 0), 'Folga'),
  // L08 — Sólidos (alternância de família — ineficiente)
  bloco('l08-s1', 'L08', 'setup', dt(20, 5), dt(20, 6), 'Setup Neosaldina'),
  bloco('l08-p1', 'L08', 'producao', dt(20, 6), dt(21, 14), 'Neosaldina', { ordemId: 'OF-045679' }),
  bloco('l08-l1', 'L08', 'limpeza', dt(21, 14), dt(21, 16), 'Limpeza completa'),
  bloco('l08-s2', 'L08', 'setup', dt(21, 16), dt(21, 17), 'Setup Advil'),
  bloco('l08-p2', 'L08', 'producao', dt(21, 17), dt(23, 12), 'Advil', { ordemId: 'OF-045687' }),
  bloco('l08-l2', 'L08', 'limpeza', dt(23, 12), dt(23, 14), 'Limpeza completa'),
  bloco('l08-s3', 'L08', 'setup', dt(23, 14), dt(23, 15), 'Setup Novalgina'),
  bloco('l08-p3', 'L08', 'producao', dt(23, 15), dt(25, 10), 'Novalgina', {
    ordemId: 'OF-045686',
    risco: true,
    motivoRisco: 'L08 projetada a 110% da capacidade em 24/mai.',
  }),
  // L03 — Cápsulas
  bloco('l03-s1', 'L03', 'setup', dt(20, 6), dt(20, 7), 'Setup Benegrip Multi'),
  bloco('l03-p1', 'L03', 'producao', dt(20, 7), dt(21, 18), 'Benegrip Multi', { ordemId: 'OF-045680' }),
  bloco('l03-l1', 'L03', 'limpeza', dt(21, 18), dt(21, 20), 'Limpeza completa'),
  bloco('l03-s2', 'L03', 'setup', dt(22, 6), dt(22, 7), 'Setup Addera D3'),
  bloco('l03-p2', 'L03', 'producao', dt(22, 7), dt(23, 9), 'Addera D3', { ordemId: 'OF-045684' }),
  bloco('l03-l2', 'L03', 'limpeza', dt(23, 9), dt(23, 11), 'Limpeza completa'),
  bloco('l03-f1', 'L03', 'folga', dt(23, 11), dt(25, 6), 'Folga'),
  bloco('l03-s3', 'L03', 'setup', dt(25, 6), dt(25, 7), 'Setup Apracur'),
  bloco('l03-p3', 'L03', 'producao', dt(25, 7), dt(26, 10), 'Apracur', {
    ordemId: 'OF-045683',
    risco: true,
    motivoRisco: 'Cápsula gelatina chega 26/mai, 09:00 — material indisponível no início programado.',
  }),
  // L05 — Drágeas (Dorflex dividido em duas corridas — ineficiente)
  bloco('l05-s1', 'L05', 'setup', dt(20, 6), dt(20, 7, 30), 'Setup Dorflex'),
  bloco('l05-p1', 'L05', 'producao', dt(20, 7, 30), dt(21, 12), 'Dorflex — 1ª corrida', { ordemId: 'OF-045681' }),
  bloco('l05-l1', 'L05', 'limpeza', dt(21, 12), dt(21, 14), 'Limpeza completa'),
  bloco('l05-s2', 'L05', 'setup', dt(21, 14), dt(21, 15), 'Setup Tylenol 750mg'),
  bloco('l05-p2', 'L05', 'producao', dt(21, 15), dt(23, 6), 'Tylenol 750mg', { ordemId: 'OF-045685' }),
  bloco('l05-l2', 'L05', 'limpeza', dt(23, 6), dt(23, 8), 'Limpeza completa'),
  bloco('l05-s3', 'L05', 'setup', dt(23, 8), dt(23, 9), 'Setup Dorflex — retomada'),
  bloco('l05-p3', 'L05', 'producao', dt(23, 9), dt(24, 6), 'Dorflex — 2ª corrida', { ordemId: 'OF-045681' }),
  bloco('l05-f1', 'L05', 'folga', dt(24, 6), dt(26, 0), 'Folga'),
  // L15 — Pó
  bloco('l15-x1', 'L15', 'parada', dt(20, 6), dt(21, 12), 'Parada — aguardando Blister Alu/Alu 10cp', {
    risco: true,
    motivoRisco: 'Blister Alu/Alu 10cp com prontidão de 62% — parada não planejada.',
  }),
  bloco('l15-s1', 'L15', 'setup', dt(21, 12), dt(21, 13), 'Setup Rinosoro'),
  bloco('l15-p1', 'L15', 'producao', dt(21, 13), dt(23, 6), 'Rinosoro', { ordemId: 'OF-045682' }),
  bloco('l15-f1', 'L15', 'folga', dt(23, 6), dt(25, 0), 'Folga'),
]

/**
 * Sequência otimizada — reagrupa a família Analgésicos e elimina 3 setups
 * (l12-s2, l08-s3 e l05-s3). Na L08 a Novalgina roda logo após a Neosaldina
 * com troca rápida; na L05 o Dorflex vira corrida única. A L03 não muda:
 * o material do Apracur só chega 26/mai (conflito crítico).
 */
export const blocosSequenciaOtimizada: BlocoSequencia[] = [
  // L12 — setup de ajuste eliminado
  bloco('l12-s1', 'L12', 'setup', dt(20, 6, 30), dt(20, 8), 'Setup Buscopan Composto'),
  bloco('l12-p1', 'L12', 'producao', dt(20, 8), dt(22, 16), 'Buscopan Composto', {
    ordemId: 'OF-045678',
    risco: true,
    motivoRisco: 'Cobertura de Ibuprofeno API em 1,4 dia — risco de parada por material.',
  }),
  bloco('l12-l1', 'L12', 'limpeza', dt(22, 16), dt(22, 19), 'Limpeza completa'),
  bloco('l12-m1', 'L12', 'manutencao', dt(23, 8), dt(23, 16), 'Preventiva Compressora L12'),
  bloco('l12-f1', 'L12', 'folga', dt(23, 16), dt(25, 0), 'Folga'),
  // L08 — Analgésicos agrupados: Neosaldina → Novalgina (troca rápida) → Advil
  bloco('l08-s1', 'L08', 'setup', dt(20, 5), dt(20, 6), 'Setup Neosaldina'),
  bloco('l08-p1', 'L08', 'producao', dt(20, 6), dt(21, 14), 'Neosaldina', { ordemId: 'OF-045679' }),
  // Troca rápida na mesma família: 30 min sem bloco de setup dedicado.
  bloco('l08-p3', 'L08', 'producao', dt(21, 14, 30), dt(23, 9, 30), 'Novalgina', { ordemId: 'OF-045686' }),
  bloco('l08-l2', 'L08', 'limpeza', dt(23, 9, 30), dt(23, 11, 30), 'Limpeza completa'),
  bloco('l08-s2', 'L08', 'setup', dt(23, 11, 30), dt(23, 12, 30), 'Setup Advil'),
  bloco('l08-p2', 'L08', 'producao', dt(23, 12, 30), dt(25, 7, 30), 'Advil', { ordemId: 'OF-045687' }),
  // L03 — inalterada (conflito de material impede antecipar o Apracur)
  bloco('l03-s1', 'L03', 'setup', dt(20, 6), dt(20, 7), 'Setup Benegrip Multi'),
  bloco('l03-p1', 'L03', 'producao', dt(20, 7), dt(21, 18), 'Benegrip Multi', { ordemId: 'OF-045680' }),
  bloco('l03-l1', 'L03', 'limpeza', dt(21, 18), dt(21, 20), 'Limpeza completa'),
  bloco('l03-s2', 'L03', 'setup', dt(22, 6), dt(22, 7), 'Setup Addera D3'),
  bloco('l03-p2', 'L03', 'producao', dt(22, 7), dt(23, 9), 'Addera D3', { ordemId: 'OF-045684' }),
  bloco('l03-l2', 'L03', 'limpeza', dt(23, 9), dt(23, 11), 'Limpeza completa'),
  bloco('l03-f1', 'L03', 'folga', dt(23, 11), dt(25, 6), 'Folga'),
  bloco('l03-s3', 'L03', 'setup', dt(25, 6), dt(25, 7), 'Setup Apracur'),
  bloco('l03-p3', 'L03', 'producao', dt(25, 7), dt(26, 10), 'Apracur', {
    ordemId: 'OF-045683',
    risco: true,
    motivoRisco: 'Cápsula gelatina chega 26/mai, 09:00 — material indisponível no início programado.',
  }),
  // L05 — Dorflex em corrida única; setup de retomada eliminado
  bloco('l05-s1', 'L05', 'setup', dt(20, 6), dt(20, 7, 30), 'Setup Dorflex'),
  bloco('l05-p1', 'L05', 'producao', dt(20, 7, 30), dt(22, 10), 'Dorflex — corrida única', { ordemId: 'OF-045681' }),
  bloco('l05-l1', 'L05', 'limpeza', dt(22, 10), dt(22, 12), 'Limpeza completa'),
  bloco('l05-s2', 'L05', 'setup', dt(22, 12), dt(22, 13), 'Setup Tylenol 750mg'),
  bloco('l05-p2', 'L05', 'producao', dt(22, 13), dt(24, 4), 'Tylenol 750mg', { ordemId: 'OF-045685' }),
  bloco('l05-f1', 'L05', 'folga', dt(24, 4), dt(26, 0), 'Folga'),
  // L15 — inalterada
  bloco('l15-x1', 'L15', 'parada', dt(20, 6), dt(21, 12), 'Parada — aguardando Blister Alu/Alu 10cp', {
    risco: true,
    motivoRisco: 'Blister Alu/Alu 10cp com prontidão de 62% — parada não planejada.',
  }),
  bloco('l15-s1', 'L15', 'setup', dt(21, 12), dt(21, 13), 'Setup Rinosoro'),
  bloco('l15-p1', 'L15', 'producao', dt(21, 13), dt(23, 6), 'Rinosoro', { ordemId: 'OF-045682' }),
  bloco('l15-f1', 'L15', 'folga', dt(23, 6), dt(25, 0), 'Folga'),
]

/** Ganho da otimização — usado por toast, KPIs e copiloto. */
export const GANHO_OTIMIZACAO = {
  setupsEliminados: 3,
  horasLiberadas: 10.7,
  valorEstimado: 210_000,
} as const

// ── Matriz de troca / setup (minutos) ────────────────────────────────────────

export const FAMILIAS_SETUP: FamiliaProduto[] = [
  'Analgésicos',
  'Vitaminas',
  'Antitérmicos',
  'Antigripais',
  'Outros',
]

/**
 * Minutos de troca entre famílias (de → para). Diagonal = mesma família.
 * Antigripais ↔ Antitérmicos exigem limpeza obrigatória (70 min) — a
 * restrição de qualidade da semana.
 */
export const matrizSetup: Record<FamiliaProduto, Record<FamiliaProduto, number>> = {
  Analgésicos: { Analgésicos: 45, Vitaminas: 58, Antitérmicos: 62, Antigripais: 60, Outros: 55 },
  Vitaminas: { Analgésicos: 56, Vitaminas: 45, Antitérmicos: 59, Antigripais: 63, Outros: 57 },
  Antitérmicos: { Analgésicos: 64, Vitaminas: 59, Antitérmicos: 46, Antigripais: 70, Outros: 61 },
  Antigripais: { Analgésicos: 61, Vitaminas: 62, Antitérmicos: 70, Antigripais: 47, Outros: 58 },
  Outros: { Analgésicos: 54, Vitaminas: 55, Antitérmicos: 60, Antigripais: 59, Outros: 45 },
}

// ── Restrições e conflitos da semana ─────────────────────────────────────────

export const restricoes: Restricao[] = [
  {
    id: 'RST-01',
    tipo: 'material',
    titulo: 'Material indisponível — Apracur (L03)',
    detalhe: 'Produção programada para 25/mai; cápsula gelatina chega 26/mai, 09:00.',
    severidade: 'Crítica',
  },
  {
    id: 'RST-02',
    tipo: 'manutencao',
    titulo: 'Janela de manutenção — L12',
    detalhe: 'Preventiva da Compressora em 23/mai, 08:00 – 16:00, bloqueia a linha.',
    severidade: 'Alta',
  },
  {
    id: 'RST-03',
    tipo: 'qualidade',
    titulo: 'Conflito de qualidade',
    detalhe: 'Limpeza completa obrigatória entre Antigripais e Antitérmicos (70 min).',
    severidade: 'Média',
  },
  {
    id: 'RST-04',
    tipo: 'capacidade',
    titulo: 'Capacidade excedida — L08',
    detalhe: 'Projeção de 110% em 24/mai com a campanha de Novalgina.',
    severidade: 'Alta',
  },
  {
    id: 'RST-05',
    tipo: 'setup',
    titulo: 'Setups acima do planejado',
    detalhe: '+18 h contra a meta da semana (312 h vs 294 h).',
    severidade: 'Média',
  },
  {
    id: 'RST-06',
    tipo: 'folga',
    titulo: 'Folga não alocada',
    detalhe: 'L03 com 43 h livres entre 23 e 25/mai — capacidade disponível para antecipação.',
    severidade: 'Baixa',
  },
]

// ── Heurística de impacto do drag & drop ─────────────────────────────────────

export interface ImpactoMudanca {
  /** Δ prazo em horas (positivo = atraso). */
  prazoHoras: number
  /** Δ setup em minutos (positivo = mais setup). */
  setupMinutos: number
  riscoRuptura: 'Baixo' | 'Médio' | 'Alto'
  /** Δ utilização da linha em p.p. */
  utilizacaoPontos: number
  /** Custo adicional estimado em R$. */
  custoAdicional: number
}

/**
 * Impacto determinístico de mover um bloco de produção: distância movida ×
 * fatores fixos. Atrasar custa R$ 4.200/h; antecipar, R$ 1.500/h de esforço
 * de replanejamento.
 */
export function impactoDaMudanca(deltaHoras: number): ImpactoMudanca {
  const abs = Math.abs(deltaHoras)
  const atrasa = deltaHoras > 0
  return {
    prazoHoras: deltaHoras,
    setupMinutos: Math.round(deltaHoras * 5),
    riscoRuptura: abs <= 4 ? 'Baixo' : abs <= 12 ? 'Médio' : 'Alto',
    utilizacaoPontos: Math.round((atrasa ? -0.2 : 0.15) * abs * 10) / 10,
    custoAdicional: Math.round(abs * (atrasa ? 4_200 : 1_500)),
  }
}
