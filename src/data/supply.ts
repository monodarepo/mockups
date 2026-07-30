import { serieSparkline } from '@/lib/series'
import { formatMoedaCompacta, formatNumero, formatPercent, formatPontosPercentuais } from '@/lib/format'
import type { ConteudoCopilot, KpiCardData } from './types'
import type { Tone } from '@/lib/colors'

/**
 * Perspectiva Supply da Visão Geral — 19/mai/2025, Turno A.
 * A aderência de 91,3% é do plano de ABASTECIMENTO (a de produção segue 92,1%).
 */

export const kpisSupply: KpiCardData[] = [
  {
    id: 'sp-otif',
    label: 'OTIF de Abastecimento',
    valor: formatPercent(94.2),
    delta: formatPontosPercentuais(2.8),
    deltaGoodWhen: 'up',
    sublabel: 'vs último mês',
    sparkline: serieSparkline('kpi-sp-otif', 12, { base: 91.2, tendencia: 3, ruido: 0.008 }),
  },
  {
    id: 'sp-servico',
    label: 'Nível de Serviço',
    valor: formatPercent(96.1),
    delta: formatPontosPercentuais(1.9),
    deltaGoodWhen: 'up',
    sublabel: 'vs último mês',
    sparkline: serieSparkline('kpi-sp-servico', 12, { base: 94.1, tendencia: 2, ruido: 0.006 }),
  },
  {
    id: 'sp-estoque',
    label: 'Estoque Total',
    valor: formatMoedaCompacta(128_400_000),
    delta: '-3,2%',
    deltaGoodWhen: 'down',
    sublabel: 'vs último mês',
    tone: 'success',
    sparkline: serieSparkline('kpi-sp-estoque', 12, { base: 133, tendencia: -4.4, ruido: 0.015 }),
  },
  {
    id: 'sp-cobertura',
    label: 'Cobertura de Estoque',
    valor: `${formatNumero(23)} dias`,
    delta: '+2 dias',
    deltaGoodWhen: 'up',
    sublabel: 'vs última semana',
    sparkline: serieSparkline('kpi-sp-cobertura', 12, { base: 20.6, tendencia: 2.3, ruido: 0.03 }),
  },
  {
    id: 'sp-giro',
    label: 'Giro de Estoque',
    valor: `${formatNumero(6.2, 1)}x`,
    delta: '+0,4x',
    deltaGoodWhen: 'up',
    sublabel: 'anualizado · vs trimestre',
    sparkline: serieSparkline('kpi-sp-giro', 12, { base: 5.7, tendencia: 0.5, ruido: 0.02 }),
  },
]

export const kpisSupplySecundarios: KpiCardData[] = [
  {
    id: 'sp-rupturas',
    label: 'Rupturas Projetadas',
    valor: formatNumero(12),
    delta: '+4',
    deltaGoodWhen: 'down',
    sublabel: 'próximos 7 dias · rede',
    tone: 'danger',
    sparkline: serieSparkline('kpi-sp-rupturas', 12, { base: 8, tendencia: 4, ruido: 0.15, decimais: 0, min: 5 }),
  },
  {
    id: 'sp-aderencia',
    label: 'Aderência ao Plano',
    valor: formatPercent(91.3),
    delta: formatPontosPercentuais(2.6),
    deltaGoodWhen: 'up',
    sublabel: 'abastecimento · vs semana',
    sparkline: serieSparkline('kpi-sp-aderencia', 12, { base: 88.6, tendencia: 2.8, ruido: 0.01 }),
  },
  {
    id: 'sp-ocupacao',
    label: 'Ocupação do Armazém',
    valor: formatPercent(78, 0),
    delta: formatPontosPercentuais(3, 0),
    deltaGoodWhen: 'down',
    sublabel: 'Armazém MP · Anápolis',
    tone: 'warning',
    sparkline: serieSparkline('kpi-sp-ocupacao', 12, { base: 74, tendencia: 4, ruido: 0.02 }),
  },
  {
    id: 'sp-atrasos',
    label: 'Pedidos em Atraso',
    valor: formatNumero(27),
    delta: '+5',
    deltaGoodWhen: 'down',
    sublabel: 'rede · vs última semana',
    tone: 'warning',
    sparkline: serieSparkline('kpi-sp-atrasos', 12, { base: 21, tendencia: 6, ruido: 0.1, decimais: 0, min: 15 }),
  },
  {
    id: 'sp-leadtime',
    label: 'Lead Time Médio',
    valor: `${formatNumero(6.4, 1)} dias`,
    delta: '-0,6',
    deltaGoodWhen: 'down',
    sublabel: 'abastecimento · vs mês',
    tone: 'success',
    sparkline: serieSparkline('kpi-sp-leadtime', 12, { base: 7.1, tendencia: -0.7, ruido: 0.03 }),
  },
]

// ── Mapa do site ─────────────────────────────────────────────────────────────

export interface PontoMapaSite {
  id: string
  nome: string
  detalhe: string
  tone: Tone
  /** Posição em % do SVG do site (x, y). */
  posicao: [number, number]
}

export const pontosMapaSite: PontoMapaSite[] = [
  { id: 'site-recebimento', nome: 'Recebimento', detalhe: '100% concluído', tone: 'success', posicao: [13, 26] },
  { id: 'site-armazem-mp', nome: 'Armazém MP', detalhe: 'ocupação 78%', tone: 'warning', posicao: [15, 72] },
  { id: 'site-producao', nome: 'Produção', detalhe: 'Em execução', tone: 'info', posicao: [45, 43] },
  { id: 'site-expedicao', nome: 'Expedição', detalhe: 'Aguardando coleta', tone: 'warning', posicao: [73, 26] },
  { id: 'site-cd', nome: 'CD / Distribuição', detalhe: 'ocupação 86%', tone: 'warning', posicao: [84, 62] },
  { id: 'site-transportes', nome: 'Transportes', detalhe: '25 veículos ativos', tone: 'info', posicao: [55, 84] },
]

// ── Fluxo e destaques ────────────────────────────────────────────────────────

export interface EtapaFluxoSupply {
  etapa: string
  status: string
  tone: Tone
  concluida: boolean
}

export const fluxoSupply: EtapaFluxoSupply[] = [
  { etapa: 'Recebimento', status: '100% concluído', tone: 'success', concluida: true },
  { etapa: 'Armazenagem', status: 'Em andamento', tone: 'info', concluida: false },
  { etapa: 'Produção', status: 'Em execução', tone: 'info', concluida: false },
  { etapa: 'Expedição', status: 'Aguardando coleta', tone: 'warning', concluida: false },
  { etapa: 'Entrega', status: 'Em trânsito', tone: 'info', concluida: false },
]

export const destaquesSemana = [
  { id: 'ds-mp', rotulo: 'Entrada de MPs', valor: '1.245 ton', delta: '+8,9%', deltaGoodWhen: 'up' as const },
  { id: 'ds-producao', rotulo: 'Produção Total', valor: '512.340 un', delta: '+4,6%', deltaGoodWhen: 'up' as const },
  { id: 'ds-expedicoes', rotulo: 'Expedições', valor: '486.780 un', delta: '+3,2%', deltaGoodWhen: 'up' as const },
]

/** Composição do estoque total (R$ 128,4 mi) — soma 100%. */
export const composicaoEstoque = [
  { id: 'ce-mp', rotulo: 'MP', percent: 42 },
  { id: 'ce-processo', rotulo: 'Em processo', percent: 28 },
  { id: 'ce-pa', rotulo: 'PA Acabado', percent: 30 },
]

// ── Copiloto e alertas da perspectiva ────────────────────────────────────────

export const copilotSupply: ConteudoCopilot = {
  tela: '/supply',
  perguntasSugeridas: ['Qual a cobertura do Ibuprofeno?', 'Quais produtos podem romper?', 'Qual o impacto financeiro em risco?'],
  saudacao: 'Bom dia, {nome}. O abastecimento fecha a semana com OTIF de 94,2%.',
  resumo:
    'OTIF subiu 2,8 p.p. e a cobertura de estoque chegou a 23 dias. Atenção às rupturas projetadas de Ibuprofeno API e Paracetamol API na semana W24.',
  riscos: [
    'Ruptura projetada de Ibuprofeno API — cobertura de 1,4 dia em Anápolis.',
    'Paracetamol API com 2,1 dias e reposição ainda em trânsito (PO-88213).',
  ],
  causas: [
    'Consumo 15% acima do plano com a campanha de Buscopan.',
    'Fornecedor Alfa Química com atraso recorrente nas últimas entregas.',
  ],
  acoes: [
    'Priorizar a reposição de Ibuprofeno API nas próximas 48 h.',
    'Antecipar os recebimentos do fornecedor Alfa Química.',
    'Revisar os parâmetros de estoque mínimo de cápsulas.',
  ],
  botoes: ['Simular impacto', 'Priorizar reposição', 'Ver materiais críticos'],
}

export const alertasSupply = [
  { id: 'sp-al-01', titulo: 'Risco de ruptura — Ibuprofeno API', severidade: 'Crítico', tone: 'danger' as Tone },
  { id: 'sp-al-02', titulo: 'Atraso de fornecedor — Alfa Química', severidade: 'Alto', tone: 'danger' as Tone },
  { id: 'sp-al-03', titulo: 'Ocupação crítica no CD Goiânia', severidade: 'Atenção', tone: 'warning' as Tone },
]

// ── Nós logísticos (mini-mapa do Brasil) ─────────────────────────────────────

export interface NoLogistico {
  id: string
  nome: string
  tipo: 'fabrica' | 'cd' | 'transito'
  /** Posição no viewBox 200×210 do mini-mapa. */
  posicao: [number, number]
}

export const nosLogisticos: NoLogistico[] = [
  { id: 'no-anapolis', nome: 'Fábrica Anápolis', tipo: 'fabrica', posicao: [78, 94] },
  { id: 'no-goiania', nome: 'Fábrica Goiânia', tipo: 'fabrica', posicao: [72, 101] },
  { id: 'no-jacarei', nome: 'Fábrica Jacareí', tipo: 'fabrica', posicao: [108, 124] },
  { id: 'no-cd-goiania', nome: 'CD Goiânia', tipo: 'cd', posicao: [65, 108] },
  { id: 'no-cd-cajamar', nome: 'CD Cajamar', tipo: 'cd', posicao: [100, 119] },
  { id: 'no-cd-recife', nome: 'CD Recife', tipo: 'cd', posicao: [148, 62] },
  { id: 'no-cd-itajai', nome: 'CD Itajaí', tipo: 'cd', posicao: [93, 150] },
  { id: 'no-transito-1', nome: 'Carga GO → SP', tipo: 'transito', posicao: [88, 111] },
  { id: 'no-transito-2', nome: 'Carga GO → NE', tipo: 'transito', posicao: [116, 82] },
  { id: 'no-transito-3', nome: 'Carga SP → Sul', tipo: 'transito', posicao: [97, 137] },
]
