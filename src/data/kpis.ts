import { serieSparkline } from '@/lib/series'
import {
  formatMoedaCompacta,
  formatNumero,
  formatPercent,
  formatPercentAssinado,
  formatPontosPercentuais,
} from '@/lib/format'
import type { KpiCardData } from './types'
import { alertas } from './alertas'
import { ordens } from './ordens'
import { materiais } from './materiais'
import { lotes } from './lotes'
import { equipamentos } from './equipamentos'
import { ordensManutencao } from './manutencao'
import { acoesAgentes, agentes } from './agentes'
import { cenarios, eventosSimulaveis } from './cenarios'
import { relatorios } from './relatorios'
import { linhas } from './fabricas'
import { personas } from './personas'

// ── Valores derivados dos próprios mocks — uma única fonte de verdade ────────

const impactoMateriais = alertas
  .filter((a) => a.area === 'Materiais')
  .reduce((soma, a) => soma + a.impactoEstimado, 0)

const linhasAnapolis = linhas.filter((l) => l.fabricaId === 'anapolis')
const utilizacaoMediaAnapolis =
  linhasAnapolis.reduce((soma, l) => soma + l.capacidadeUtilizada, 0) / linhasAnapolis.length

const coberturaMediaMateriais =
  materiais.reduce((soma, m) => soma + m.coberturaDias, 0) / materiais.length
const materiaisCriticos = materiais.filter((m) => m.status === 'Crítico').length
const materiaisAtencao = materiais.filter((m) => m.status === 'Atenção').length
const materiaisBloqueados = materiais.filter((m) => m.status === 'Bloqueado').length

const lotesEmAnalise = lotes.filter((l) => l.status === 'Em análise').length
const lotesBloqueados = lotes.filter((l) => l.status === 'Bloqueado').length

const disponibilidadeMedia =
  equipamentos.reduce((soma, e) => soma + e.disponibilidade, 0) / equipamentos.length
const ativosCriticos = equipamentos.filter((e) => e.status === 'Crítico').length
const probFalhaMaxima = Math.max(...equipamentos.map((e) => e.probabilidadeFalha ?? 0))
const otsAbertas = ordensManutencao.filter((ot) => ot.status !== 'Concluída').length
const preventivasAtrasadas = ordensManutencao.filter((ot) => ot.status === 'Atrasada').length

const agentesAtivos = agentes.filter((a) => a.status === 'Ativo').length
const tarefasHojeTotal = agentes.reduce((soma, a) => soma + a.tarefasHoje, 0)
const slaMedioAgentes = agentes.reduce((soma, a) => soma + a.slaPercent, 0) / agentes.length
const aceitacaoMedia = agentes.reduce((soma, a) => soma + a.taxaAceitacao, 0) / agentes.length
const agentesN4 = agentes.filter((a) => a.autonomia === 'N4').length
const acoesPendentes = acoesAgentes.filter((a) => a.status === 'Pendente').length

const planoBase = cenarios[0]

/**
 * KPIs de /sequenciamento — variam com o estado da otimização:
 * Setups 28 → 25 e Horas de Setup 312 h → 301,3 h (−10,7 h).
 */
export function kpisSequenciamento(otimizada: boolean): KpiCardData[] {
  return [
    {
      id: 'sq-aderencia',
      label: 'Aderência da Sequência',
      valor: formatPercent(94.1),
      delta: formatPontosPercentuais(3.2),
      deltaGoodWhen: 'up',
      sublabel: 'vs última semana',
      sparkline: serieSparkline('kpi-sq-aderencia', 12, { base: 90.5, tendencia: 3.4, ruido: 0.01 }),
    },
    {
      id: 'sq-setups',
      label: 'Setups Planejados',
      valor: formatNumero(otimizada ? 25 : 28),
      delta: otimizada ? '-3' : '-4',
      deltaGoodWhen: 'down',
      sublabel: otimizada ? 'com otimização aplicada' : 'vs última semana',
      tone: otimizada ? 'success' : 'primary',
      sparkline: serieSparkline('kpi-sq-setups', 12, { base: 31, tendencia: -3.5, ruido: 0.08, decimais: 0 }),
    },
    {
      id: 'sq-horas',
      label: 'Horas de Setup',
      valor: otimizada ? `${formatNumero(301.3, 1)} h` : `${formatNumero(312)} h`,
      delta: otimizada ? `-${formatNumero(10.7, 1)} h` : '+18 h',
      deltaGoodWhen: 'down',
      sublabel: otimizada ? 'com otimização aplicada' : 'vs meta da semana (294 h)',
      tone: otimizada ? 'success' : 'warning',
      sparkline: serieSparkline('kpi-sq-horas', 12, { base: 296, tendencia: 15, ruido: 0.03 }),
    },
    {
      id: 'sq-risco',
      label: 'Ordens em Risco',
      valor: formatNumero(11),
      delta: '+2',
      deltaGoodWhen: 'down',
      sublabel: 'vs última semana',
      tone: 'danger',
      sparkline: serieSparkline('kpi-sq-risco', 12, { base: 8.5, tendencia: 2.4, ruido: 0.12, decimais: 0, min: 5 }),
    },
    {
      id: 'sq-eficiencia',
      label: 'Eficiência da Sequência',
      valor: formatPercent(87.8),
      delta: formatPontosPercentuais(2.6),
      deltaGoodWhen: 'up',
      sublabel: 'vs última semana',
      sparkline: serieSparkline('kpi-sq-eficiencia', 12, { base: 84.8, tendencia: 2.8, ruido: 0.012 }),
    },
    {
      id: 'sq-ganho',
      label: 'Ganho Potencial',
      valor: formatMoedaCompacta(1_380_000),
      delta: `+${formatMoedaCompacta(210_000)}`,
      deltaGoodWhen: 'up',
      sublabel: 'identificado pelo otimizador',
      tone: 'success',
      sparkline: serieSparkline('kpi-sq-ganho', 12, { base: 1080, tendencia: 280, ruido: 0.06 }),
    },
  ]
}

/**
 * KPIs de /alertas — "Decisões Pendentes" é reativo ao store: aprovar ou
 * rejeitar em qualquer tela decrementa o valor (badge da sidebar idem).
 */
export function kpisAlertas(pendencias: number): KpiCardData[] {
  return [
    {
      id: 'al-criticos',
      label: 'Alertas Críticos',
      valor: formatNumero(14),
      delta: '+3',
      deltaGoodWhen: 'down',
      sublabel: 'rede · vs ontem',
      tone: 'danger',
      sparkline: serieSparkline('kpi-al-criticos', 12, { base: 11, tendencia: 3, ruido: 0.12, decimais: 0, min: 6 }),
    },
    {
      id: 'al-pendentes',
      label: 'Decisões Pendentes',
      valor: formatNumero(pendencias),
      delta: '+2',
      deltaGoodWhen: 'down',
      sublabel: 'aguardando aprovação',
      tone: 'warning',
      sparkline: serieSparkline('kpi-al-pendentes', 12, { base: 10, tendencia: 2, ruido: 0.1, decimais: 0, min: 6 }),
    },
    {
      id: 'al-impacto',
      label: 'Impacto Financeiro em Risco',
      valor: formatMoedaCompacta(1_820_000),
      delta: `+${formatMoedaCompacta(320_000)}`,
      deltaGoodWhen: 'down',
      sublabel: 'últimas 24 h',
      tone: 'danger',
      sparkline: serieSparkline('kpi-al-impacto-risco', 12, { base: 1450, tendencia: 340, ruido: 0.05 }),
    },
    {
      id: 'al-ordens',
      label: 'Ordens Afetadas',
      valor: formatNumero(27),
      delta: '+4',
      deltaGoodWhen: 'down',
      sublabel: 'rede · vs ontem',
      sparkline: serieSparkline('kpi-al-ordens-afetadas', 12, { base: 22, tendencia: 4.5, ruido: 0.08, decimais: 0, min: 16 }),
    },
    {
      id: 'al-slas',
      label: 'SLAs Próximos do Vencimento',
      valor: formatNumero(6),
      delta: '+2',
      deltaGoodWhen: 'down',
      sublabel: 'vencem nas próximas 4 h',
      tone: 'warning',
      sparkline: serieSparkline('kpi-al-slas', 12, { base: 4, tendencia: 2, ruido: 0.2, decimais: 0, min: 1 }),
    },
    {
      id: 'al-concluidas',
      label: 'Ações Concluídas',
      valor: formatNumero(31),
      delta: '+8',
      deltaGoodWhen: 'up',
      sublabel: 'hoje · vs média diária',
      tone: 'success',
      sparkline: serieSparkline('kpi-al-concluidas', 12, { base: 24, tendencia: 7, ruido: 0.1, decimais: 0, min: 15 }),
    },
  ]
}

/**
 * KPIs de todas as telas, na ordem em que os cards aparecem.
 * Valores já formatados em pt-BR; sparklines determinísticas por seed.
 */
export const kpisPorTela: Record<string, KpiCardData[]> = {
  // Visão executiva da rede (3 fábricas) — persona Ricardo Martins.
  '/': [
    {
      id: 'vg-oee',
      label: 'OEE',
      valor: formatPercent(78.6),
      delta: formatPontosPercentuais(5.4),
      deltaGoodWhen: 'up',
      sublabel: 'vs última semana',
      sparkline: serieSparkline('kpi-vg-oee-rede', 12, { base: 73, tendencia: 5.5, ruido: 0.018 }),
    },
    {
      id: 'vg-aderencia',
      label: 'Aderência ao Plano',
      valor: formatPercent(92.1),
      delta: formatPontosPercentuais(3.2),
      deltaGoodWhen: 'up',
      sublabel: 'vs última semana',
      sparkline: serieSparkline('kpi-vg-aderencia-rede', 12, { base: 88.5, tendencia: 3.4, ruido: 0.012 }),
    },
    {
      id: 'vg-ordens-risco',
      label: 'Ordens em Risco',
      valor: formatNumero(23),
      delta: '+6',
      deltaGoodWhen: 'down',
      sublabel: 'vs última semana',
      tone: 'danger',
      sparkline: serieSparkline('kpi-vg-ordens-risco', 12, { base: 16, tendencia: 7, ruido: 0.12, decimais: 0, min: 10 }),
    },
    {
      id: 'vg-capacidade',
      label: 'Capacidade Utilizada',
      valor: formatPercent(81.3),
      delta: formatPontosPercentuais(2.7),
      deltaGoodWhen: 'up',
      sublabel: 'vs última semana',
      sparkline: serieSparkline('kpi-vg-capacidade', 12, { base: 78.4, tendencia: 2.8, ruido: 0.015 }),
    },
    {
      id: 'vg-rupturas',
      label: 'Rupturas Projetadas',
      valor: formatNumero(7),
      delta: '-2',
      deltaGoodWhen: 'down',
      sublabel: 'próximos 7 dias',
      tone: 'success',
      sparkline: serieSparkline('kpi-vg-rupturas', 12, { base: 9.5, tendencia: -2.4, ruido: 0.14, decimais: 0, min: 4 }),
    },
    {
      id: 'vg-ganho',
      label: 'Ganho Capturado',
      valor: formatMoedaCompacta(2_480_000),
      delta: `+${formatMoedaCompacta(620_000)}`,
      deltaGoodWhen: 'up',
      sublabel: 'no mês · vs abril',
      tone: 'success',
      sparkline: serieSparkline('kpi-vg-ganho', 12, { base: 1850, tendencia: 610, ruido: 0.05 }),
    },
  ],
  '/planejamento': [
    {
      id: 'pl-atendimento',
      label: 'Atendimento projetado',
      valor: formatPercent(planoBase.atendimentoPercent, 0),
      delta: formatPontosPercentuais(-1.5),
      deltaGoodWhen: 'up',
      sublabel: 'plano-base · vs semana anterior',
      sparkline: serieSparkline('kpi-pl-atendimento', 12, { base: 95, tendencia: -1, ruido: 0.015 }),
    },
    {
      id: 'pl-ordens',
      label: 'Ordens na semana',
      valor: formatNumero(ordens.length),
      sublabel: '20 – 26/mai · 3 fábricas',
      sparkline: serieSparkline('kpi-pl-ordens', 12, { base: 14, ruido: 0.1, decimais: 0, min: 10 }),
    },
    {
      id: 'pl-setup',
      label: 'Horas de setup',
      valor: `${formatNumero(planoBase.horasSetup)} h`,
      delta: formatPercentAssinado(6.7),
      deltaGoodWhen: 'down',
      sublabel: 'plano-base · vs padrão',
      tone: 'warning',
      sparkline: serieSparkline('kpi-pl-setup', 12, { base: 300, tendencia: 20, ruido: 0.05 }),
    },
    {
      id: 'pl-utilizacao',
      label: 'Utilização média',
      valor: formatPercent(utilizacaoMediaAnapolis),
      sublabel: 'linhas de Anápolis',
      sparkline: serieSparkline('kpi-pl-utilizacao', 12, { base: 85, tendencia: 2, ruido: 0.02 }),
    },
    {
      id: 'pl-ruptura',
      label: 'SKUs em risco de ruptura',
      valor: formatNumero(planoBase.skusComRuptura),
      delta: '+3',
      deltaGoodWhen: 'down',
      sublabel: 'plano-base · vs semana anterior',
      tone: 'danger',
      sparkline: serieSparkline('kpi-pl-ruptura', 12, { base: 9, tendencia: 3, ruido: 0.15, decimais: 0, min: 4 }),
    },
    {
      id: 'pl-cobertura',
      label: 'Cobertura média de materiais',
      valor: `${formatNumero(coberturaMediaMateriais, 1)} dias`,
      delta: '-0,8 dia',
      deltaGoodWhen: 'up',
      sublabel: 'vs última semana',
      tone: 'warning',
      sparkline: serieSparkline('kpi-pl-cobertura', 12, { base: 5.6, tendencia: -0.8, ruido: 0.05 }),
    },
  ],
  '/sequenciamento': kpisSequenciamento(false),
  '/execucao': [
    {
      id: 'ex-oee',
      label: 'OEE Atual',
      valor: formatPercent(78.4),
      delta: formatPontosPercentuais(-2.6),
      deltaGoodWhen: 'up',
      sublabel: 'vs turno anterior',
      sparkline: serieSparkline('kpi-ex-oee', 12, { base: 80.5, tendencia: -2.4, ruido: 0.015 }),
    },
    {
      id: 'ex-producao',
      label: 'Produção do Turno',
      valor: formatNumero(1_256_840),
      delta: formatPercentAssinado(6.3),
      deltaGoodWhen: 'up',
      sublabel: 'unidades · vs turno anterior',
      sparkline: serieSparkline('kpi-ex-producao', 12, { base: 1180, tendencia: 75, ruido: 0.04 }),
    },
    {
      id: 'ex-aderencia',
      label: 'Aderência ao Plano',
      valor: formatPercent(92.1),
      delta: formatPontosPercentuais(-3.1),
      deltaGoodWhen: 'up',
      sublabel: 'vs turno anterior',
      sparkline: serieSparkline('kpi-ex-aderencia', 12, { base: 95, tendencia: -3, ruido: 0.012 }),
    },
    {
      id: 'ex-paradas',
      label: 'Paradas Não Planejadas',
      valor: '36 min',
      delta: '+18 min',
      deltaGoodWhen: 'down',
      sublabel: 'no turno · vs turno anterior',
      tone: 'danger',
      sparkline: serieSparkline('kpi-ex-paradas', 12, { base: 20, tendencia: 16, ruido: 0.15, min: 5 }),
    },
    {
      id: 'ex-refugo',
      label: 'Refugo / Perdas',
      valor: formatPercent(1.42, 2),
      delta: formatPontosPercentuais(0.28, 2),
      deltaGoodWhen: 'down',
      sublabel: 'vs turno anterior',
      tone: 'danger',
      sparkline: serieSparkline('kpi-ex-refugo', 12, { base: 1.15, tendencia: 0.28, ruido: 0.06, decimais: 2 }),
    },
    {
      id: 'ex-ordens',
      label: 'Ordens em Execução',
      valor: formatNumero(18),
      delta: '+2',
      deltaGoodWhen: 'up',
      sublabel: 'rede · vs turno anterior',
      sparkline: serieSparkline('kpi-ex-ordens', 12, { base: 16, tendencia: 2, ruido: 0.08, decimais: 0, min: 12 }),
    },
  ],
  '/gemeo': [
    {
      id: 'gm-eventos',
      label: 'Eventos simuláveis',
      valor: formatNumero(eventosSimulaveis.length),
      sublabel: 'biblioteca da semana',
      sparkline: serieSparkline('kpi-gm-eventos', 12, { base: 5, ruido: 0.1, decimais: 0, min: 3 }),
    },
    {
      id: 'gm-cenarios',
      label: 'Cenários comparados',
      valor: formatNumero(cenarios.length),
      sublabel: 'plano-base, A e B',
      sparkline: serieSparkline('kpi-gm-cenarios', 12, { base: 3, ruido: 0.12, decimais: 0, min: 1 }),
    },
    {
      id: 'gm-oee',
      label: 'OEE projetado',
      valor: formatPercent(planoBase.oeeProjetado, 0),
      delta: formatPontosPercentuais(5, 0),
      deltaGoodWhen: 'up',
      sublabel: 'Cenário A vs plano-base',
      sparkline: serieSparkline('kpi-gm-oee', 12, { base: 68, tendencia: 4, ruido: 0.02 }),
    },
    {
      id: 'gm-atendimento',
      label: 'Atendimento projetado',
      valor: formatPercent(planoBase.atendimentoPercent, 0),
      delta: formatPontosPercentuais(3, 0),
      deltaGoodWhen: 'up',
      sublabel: 'Cenário A vs plano-base',
      sparkline: serieSparkline('kpi-gm-atendimento', 12, { base: 94, tendencia: 2.5, ruido: 0.012 }),
    },
    {
      id: 'gm-custo',
      label: 'Custo incremental',
      valor: 'R$ 0',
      sublabel: 'plano-base ativo',
      sparkline: serieSparkline('kpi-gm-custo', 12, { base: 90, ruido: 0.3, min: 0 }),
    },
    {
      id: 'gm-confiabilidade',
      label: 'Confiabilidade do modelo',
      valor: formatPercent(92.4),
      delta: formatPontosPercentuais(0.8),
      deltaGoodWhen: 'up',
      sublabel: 'calibrado às 10:18',
      tone: 'success',
      sparkline: serieSparkline('kpi-gm-confiabilidade', 12, { base: 91, tendencia: 1.4, ruido: 0.01 }),
    },
  ],
  '/qualidade': [
    {
      id: 'qa-fila',
      label: 'Lotes na fila',
      valor: formatNumero(lotes.length),
      sublabel: 'fila de liberação QA',
      sparkline: serieSparkline('kpi-qa-fila', 12, { base: 6, ruido: 0.15, decimais: 0, min: 2 }),
    },
    {
      id: 'qa-analise',
      label: 'Em análise',
      valor: formatNumero(lotesEmAnalise),
      sublabel: 'inclui o 2456789A (Alta)',
      sparkline: serieSparkline('kpi-qa-analise', 12, { base: 2, ruido: 0.25, decimais: 0, min: 0, max: 4 }),
    },
    {
      id: 'qa-bloqueados',
      label: 'Bloqueados',
      valor: formatNumero(lotesBloqueados),
      sublabel: '2456793E reprovado',
      tone: 'danger',
      sparkline: serieSparkline('kpi-qa-bloqueados', 12, { base: 1, ruido: 0.4, decimais: 0, min: 0, max: 2 }),
    },
    {
      id: 'qa-tempo',
      label: 'Tempo médio de liberação',
      valor: '4 h 12 min',
      delta: '+38 min',
      deltaGoodWhen: 'down',
      sublabel: 'vs média do mês',
      tone: 'warning',
      sparkline: serieSparkline('kpi-qa-tempo', 12, { base: 220, tendencia: 30, ruido: 0.06 }),
    },
    {
      id: 'qa-aprovacao',
      label: 'Taxa de aprovação',
      valor: formatPercent(96.8),
      delta: formatPontosPercentuais(-0.6),
      deltaGoodWhen: 'up',
      sublabel: 'últimos 30 dias',
      sparkline: serieSparkline('kpi-qa-aprovacao', 12, { base: 97.5, tendencia: -0.6, ruido: 0.006 }),
    },
    {
      id: 'qa-reprovados',
      label: 'Reprovados na semana',
      valor: formatNumero(1),
      sublabel: 'lote 2456793E (Apracur)',
      tone: 'danger',
      sparkline: serieSparkline('kpi-qa-reprovados', 12, { base: 0.6, ruido: 0.6, decimais: 0, min: 0, max: 2 }),
    },
    {
      id: 'qa-desvios',
      label: 'Desvios abertos',
      valor: formatNumero(3),
      delta: '+1',
      deltaGoodWhen: 'down',
      sublabel: 'vs última semana',
      sparkline: serieSparkline('kpi-qa-desvios', 12, { base: 2.4, tendencia: 0.8, ruido: 0.3, decimais: 0, min: 0 }),
    },
  ],
  '/manutencao': [
    {
      id: 'mn-ativos',
      label: 'Ativos monitorados',
      valor: formatNumero(equipamentos.length),
      sublabel: 'telemetria em tempo real',
      sparkline: serieSparkline('kpi-mn-ativos', 12, { base: 8, ruido: 0.03, decimais: 0 }),
    },
    {
      id: 'mn-criticos',
      label: 'Ativos críticos',
      valor: formatNumero(ativosCriticos),
      sublabel: 'Compressora L12 · Seladora L15',
      tone: 'danger',
      sparkline: serieSparkline('kpi-mn-criticos', 12, { base: 1, tendencia: 1, ruido: 0.4, decimais: 0, min: 0, max: 3 }),
    },
    {
      id: 'mn-disponibilidade',
      label: 'Disponibilidade média',
      valor: formatPercent(disponibilidadeMedia),
      delta: formatPontosPercentuais(-2.4),
      deltaGoodWhen: 'up',
      sublabel: 'vs última semana',
      tone: 'warning',
      sparkline: serieSparkline('kpi-mn-disponibilidade', 12, { base: 89, tendencia: -2.4, ruido: 0.015 }),
    },
    {
      id: 'mn-ots',
      label: 'OTs abertas',
      valor: formatNumero(otsAbertas),
      sublabel: 'carteira da semana',
      sparkline: serieSparkline('kpi-mn-ots', 12, { base: 6, tendencia: 1, ruido: 0.15, decimais: 0, min: 3 }),
    },
    {
      id: 'mn-atrasadas',
      label: 'Preventivas atrasadas',
      valor: formatNumero(preventivasAtrasadas),
      sublabel: 'HVAC AHU-03 · reprogramada 21/mai',
      tone: 'warning',
      sparkline: serieSparkline('kpi-mn-atrasadas', 12, { base: 0.8, ruido: 0.5, decimais: 0, min: 0, max: 2 }),
    },
    {
      id: 'mn-falha',
      label: 'Prob. máxima de falha',
      valor: formatPercent(probFalhaMaxima, 0),
      delta: formatPontosPercentuais(16, 0),
      deltaGoodWhen: 'down',
      sublabel: 'Compressora L12 · 7 dias',
      tone: 'danger',
      sparkline: serieSparkline('kpi-mn-falha', 12, { base: 55, tendencia: 23, ruido: 0.05 }),
    },
    {
      id: 'mn-mtbf',
      label: 'MTBF médio',
      valor: `${formatNumero(312)} h`,
      delta: '-28 h',
      deltaGoodWhen: 'up',
      sublabel: 'vs último mês',
      sparkline: serieSparkline('kpi-mn-mtbf', 12, { base: 335, tendencia: -25, ruido: 0.03 }),
    },
  ],
  '/materiais': [
    {
      id: 'mt-itens',
      label: 'Itens monitorados',
      valor: formatNumero(materiais.length),
      sublabel: 'APIs, excipientes e embalagem',
      sparkline: serieSparkline('kpi-mt-itens', 12, { base: 10, ruido: 0.04, decimais: 0 }),
    },
    {
      id: 'mt-criticos',
      label: 'Críticos',
      valor: formatNumero(materiaisCriticos),
      sublabel: 'Ibuprofeno API · Blister Alu/Alu',
      tone: 'danger',
      sparkline: serieSparkline('kpi-mt-criticos', 12, { base: 1, tendencia: 1, ruido: 0.4, decimais: 0, min: 0, max: 3 }),
    },
    {
      id: 'mt-atencao',
      label: 'Em atenção',
      valor: formatNumero(materiaisAtencao),
      sublabel: 'cobertura entre 2 e 4 dias',
      tone: 'warning',
      sparkline: serieSparkline('kpi-mt-atencao', 12, { base: 3, ruido: 0.25, decimais: 0, min: 1, max: 5 }),
    },
    {
      id: 'mt-bloqueados',
      label: 'Bloqueados',
      valor: formatNumero(materiaisBloqueados),
      sublabel: 'Sacarose · aguardando CoA',
      sparkline: serieSparkline('kpi-mt-bloqueados', 12, { base: 0.8, ruido: 0.5, decimais: 0, min: 0, max: 2 }),
    },
    {
      id: 'mt-cobertura',
      label: 'Cobertura média',
      valor: `${formatNumero(coberturaMediaMateriais, 1)} dias`,
      delta: '-0,8 dia',
      deltaGoodWhen: 'up',
      sublabel: 'vs última semana',
      tone: 'warning',
      sparkline: serieSparkline('kpi-mt-cobertura', 12, { base: 5.6, tendencia: -0.8, ruido: 0.05 }),
    },
    {
      id: 'mt-risco',
      label: 'Valor em risco',
      valor: formatMoedaCompacta(impactoMateriais),
      sublabel: 'alertas de materiais ativos',
      tone: 'danger',
      sparkline: serieSparkline('kpi-mt-risco', 12, { base: 380, tendencia: 95, ruido: 0.08 }),
    },
    {
      id: 'mt-transito',
      label: 'Pedidos em trânsito',
      valor: formatNumero(4),
      sublabel: 'próxima chegada: 21/mai',
      sparkline: serieSparkline('kpi-mt-transito', 12, { base: 4, ruido: 0.2, decimais: 0, min: 1, max: 7 }),
    },
  ],
  '/custos': [
    {
      id: 'cs-oee',
      label: 'OEE global',
      valor: formatPercent(68.4),
      delta: formatPontosPercentuais(-2.1),
      deltaGoodWhen: 'up',
      sublabel: 'vs última semana',
      tone: 'warning',
      sparkline: serieSparkline('kpi-cs-oee', 12, { base: 70, tendencia: -2, ruido: 0.02 }),
    },
    {
      id: 'cs-custo-dia',
      label: 'Custo de produção do dia',
      valor: formatMoedaCompacta(1_840_000),
      delta: formatPercentAssinado(3.2),
      deltaGoodWhen: 'down',
      sublabel: 'vs orçamento',
      sparkline: serieSparkline('kpi-cs-custo-dia', 12, { base: 1780, tendencia: 60, ruido: 0.03 }),
    },
    {
      id: 'cs-perdas',
      label: 'Perdas de produção',
      valor: formatMoedaCompacta(620_000),
      delta: formatPercentAssinado(18),
      deltaGoodWhen: 'down',
      sublabel: 'vs média da semana',
      tone: 'danger',
      sparkline: serieSparkline('kpi-cs-perdas', 12, { base: 520, tendencia: 100, ruido: 0.07 }),
    },
    {
      id: 'cs-setup',
      label: 'Custo de setup',
      valor: formatMoedaCompacta(184_000),
      delta: formatPercentAssinado(9),
      deltaGoodWhen: 'down',
      sublabel: 'semana · vs padrão',
      tone: 'warning',
      sparkline: serieSparkline('kpi-cs-setup', 12, { base: 168, tendencia: 16, ruido: 0.05 }),
    },
    {
      id: 'cs-extras',
      label: 'Horas extras',
      valor: formatMoedaCompacta(96_000),
      delta: formatPercentAssinado(-4),
      deltaGoodWhen: 'down',
      sublabel: 'mês corrente · vs abril',
      sparkline: serieSparkline('kpi-cs-extras', 12, { base: 100, tendencia: -4, ruido: 0.06 }),
    },
    {
      id: 'cs-unitario',
      label: 'Custo por mil unidades',
      valor: 'R$ 148,20',
      delta: formatPercentAssinado(2.4),
      deltaGoodWhen: 'down',
      sublabel: 'vs custo padrão',
      sparkline: serieSparkline('kpi-cs-unitario', 12, { base: 144, tendencia: 4, ruido: 0.02 }),
    },
    {
      id: 'cs-orcamento',
      label: 'Desvio vs orçamento',
      valor: formatPercentAssinado(3.2),
      delta: formatPontosPercentuais(1.1),
      deltaGoodWhen: 'down',
      sublabel: 'acumulado do mês',
      tone: 'warning',
      sparkline: serieSparkline('kpi-cs-orcamento', 12, { base: 2, tendencia: 1.2, ruido: 0.2 }),
    },
  ],
  '/alertas': kpisAlertas(12),
  '/relatorios': [
    {
      id: 'rl-disponiveis',
      label: 'Relatórios disponíveis',
      valor: formatNumero(relatorios.length),
      sublabel: 'catálogo ativo',
      sparkline: serieSparkline('kpi-rl-disponiveis', 12, { base: 8, ruido: 0.04, decimais: 0 }),
    },
    {
      id: 'rl-gerados',
      label: 'Gerados hoje',
      valor: formatNumero(3),
      sublabel: 'até 10:18',
      sparkline: serieSparkline('kpi-rl-gerados', 12, { base: 3, ruido: 0.25, decimais: 0, min: 0, max: 6 }),
    },
    {
      id: 'rl-agendados',
      label: 'Agendados',
      valor: formatNumero(5),
      sublabel: 'próximos 7 dias',
      sparkline: serieSparkline('kpi-rl-agendados', 12, { base: 5, ruido: 0.15, decimais: 0, min: 2 }),
    },
    {
      id: 'rl-exportacoes',
      label: 'Exportações na semana',
      valor: formatNumero(26),
      delta: '+8',
      deltaGoodWhen: 'up',
      sublabel: 'vs semana anterior',
      sparkline: serieSparkline('kpi-rl-exportacoes', 12, { base: 20, tendencia: 6, ruido: 0.1, decimais: 0 }),
    },
    {
      id: 'rl-tempo',
      label: 'Tempo médio de geração',
      valor: '18 s',
      delta: '-3 s',
      deltaGoodWhen: 'down',
      sublabel: 'vs última semana',
      tone: 'success',
      sparkline: serieSparkline('kpi-rl-tempo', 12, { base: 21, tendencia: -3, ruido: 0.08 }),
    },
    {
      id: 'rl-dashboards',
      label: 'Dashboards ativos',
      valor: formatNumero(4),
      sublabel: 'compartilhados com a diretoria',
      sparkline: serieSparkline('kpi-rl-dashboards', 12, { base: 4, ruido: 0.12, decimais: 0, min: 2 }),
    },
  ],
  '/agentes': [
    {
      id: 'ag-ativos',
      label: 'Agentes ativos',
      valor: `${formatNumero(agentesAtivos)} de ${formatNumero(agentes.length)}`,
      sublabel: 'Auditoria em treinamento',
      sparkline: serieSparkline('kpi-ag-ativos', 12, { base: 8, ruido: 0.05, decimais: 0, max: 9 }),
    },
    {
      id: 'ag-acoes',
      label: 'Ações propostas hoje',
      valor: formatNumero(acoesPendentes),
      sublabel: 'aguardando decisão',
      tone: 'warning',
      sparkline: serieSparkline('kpi-ag-acoes', 12, { base: 3, tendencia: 1, ruido: 0.3, decimais: 0, min: 0 }),
    },
    {
      id: 'ag-tarefas',
      label: 'Tarefas concluídas hoje',
      valor: formatNumero(tarefasHojeTotal),
      delta: formatPercentAssinado(12),
      deltaGoodWhen: 'up',
      sublabel: 'vs média diária',
      sparkline: serieSparkline('kpi-ag-tarefas', 12, { base: 150, tendencia: 20, ruido: 0.06, decimais: 0 }),
    },
    {
      id: 'ag-sla',
      label: 'SLA médio',
      valor: formatPercent(slaMedioAgentes),
      delta: formatPontosPercentuais(0.4),
      deltaGoodWhen: 'up',
      sublabel: 'vs última semana',
      tone: 'success',
      sparkline: serieSparkline('kpi-ag-sla', 12, { base: 97.4, tendencia: 0.3, ruido: 0.004 }),
    },
    {
      id: 'ag-aceitacao',
      label: 'Taxa média de aceitação',
      valor: formatPercent(aceitacaoMedia),
      delta: formatPontosPercentuais(1.2),
      deltaGoodWhen: 'up',
      sublabel: 'últimos 30 dias',
      sparkline: serieSparkline('kpi-ag-aceitacao', 12, { base: 90, tendencia: 1.6, ruido: 0.01 }),
    },
    {
      id: 'ag-n4',
      label: 'Autonomia N4',
      valor: formatNumero(agentesN4),
      sublabel: 'Materiais · Execução',
      sparkline: serieSparkline('kpi-ag-n4', 12, { base: 2, ruido: 0.2, decimais: 0, min: 0, max: 3 }),
    },
    {
      id: 'ag-intervencoes',
      label: 'Intervenções humanas',
      valor: formatNumero(6),
      delta: '-2',
      deltaGoodWhen: 'down',
      sublabel: 'hoje · vs média diária',
      tone: 'success',
      sparkline: serieSparkline('kpi-ag-intervencoes', 12, { base: 8, tendencia: -2, ruido: 0.15, decimais: 0, min: 2 }),
    },
  ],
  '/configuracoes': [
    {
      id: 'cf-usuarios',
      label: 'Usuários ativos',
      valor: formatNumero(48),
      delta: '+3',
      deltaGoodWhen: 'up',
      sublabel: 'vs último mês',
      sparkline: serieSparkline('kpi-cf-usuarios', 12, { base: 44, tendencia: 4, ruido: 0.04, decimais: 0 }),
    },
    {
      id: 'cf-personas',
      label: 'Personas configuradas',
      valor: formatNumero(personas.length),
      sublabel: 'PCP, Diretoria e Administração',
      sparkline: serieSparkline('kpi-cf-personas', 12, { base: 3, ruido: 0.1, decimais: 0, min: 1 }),
    },
    {
      id: 'cf-integracoes',
      label: 'Integrações conectadas',
      valor: formatNumero(6),
      sublabel: 'SAP, MES, LIMS e outras',
      tone: 'success',
      sparkline: serieSparkline('kpi-cf-integracoes', 12, { base: 6, ruido: 0.06, decimais: 0 }),
    },
    {
      id: 'cf-agentes',
      label: 'Agentes habilitados',
      valor: formatNumero(agentes.length),
      sublabel: '2 em autonomia N4',
      sparkline: serieSparkline('kpi-cf-agentes', 12, { base: 9, ruido: 0.05, decimais: 0 }),
    },
    {
      id: 'cf-politicas',
      label: 'Políticas de aprovação',
      valor: formatNumero(4),
      sublabel: 'alçadas por valor e área',
      sparkline: serieSparkline('kpi-cf-politicas', 12, { base: 4, ruido: 0.1, decimais: 0, min: 2 }),
    },
    {
      id: 'cf-uptime',
      label: 'Uptime da plataforma',
      valor: formatPercent(99.97, 2),
      sublabel: 'últimos 90 dias · SAP sync 10:12',
      tone: 'success',
      sparkline: serieSparkline('kpi-cf-uptime', 12, { base: 99.9, ruido: 0.0006, decimais: 2 }),
    },
  ],
}
