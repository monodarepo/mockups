import type { Material } from './types'

/**
 * Cobertura de materiais em 19/mai/2025. O Ibuprofeno API e o Blister
 * Alu/Alu 10cp são os dois fios críticos da história da demo.
 */
export const materiais: Material[] = [
  {
    id: 'MAT-API-001',
    nome: 'Ibuprofeno API',
    categoria: 'API',
    unidade: 'kg',
    estoque: 320,
    coberturaDias: 1.4,
    consumoDia: 220,
    variacaoConsumoPercent: 15,
    estoqueSeguranca: 500,
    leadTimeDias: 12,
    fornecedor: 'PharmaQuímica Ltda.',
    loteAtual: 'IBP-250518-02',
    validadeLote: new Date(2026, 7, 18),
    coa: 'Pendente',
    status: 'Crítico',
    prontidaoPercent: 62,
    pedidosAbertos: 0,
    variacaoEstoquePercent: -18,
    proximaAcao: 'Priorizar transferência entre plantas',
    linhasAfetadas: ['L12'],
    ordensAfetadas: ['OF-045678', 'OF-045687'],
  },
  {
    id: 'MAT-API-002',
    nome: 'Paracetamol API',
    categoria: 'API',
    unidade: 'kg',
    estoque: 460,
    coberturaDias: 2.1,
    consumoDia: 220,
    variacaoConsumoPercent: 4,
    estoqueSeguranca: 400,
    leadTimeDias: 10,
    fornecedor: 'Síntese Farma S.A.',
    loteAtual: 'PCT-250512-05',
    validadeLote: new Date(2027, 1, 10),
    coa: 'Recebido',
    status: 'Atenção',
    prontidaoPercent: 96,
    pedidosAbertos: 400,
    variacaoEstoquePercent: -6,
    proximaAcao: 'Confirmar pedido PO-88213 com chegada em 21/mai',
    linhasAfetadas: ['L05'],
    ordensAfetadas: ['OF-045685'],
  },
  {
    id: 'MAT-API-003',
    nome: 'Dipirona Sódica API',
    categoria: 'API',
    unidade: 'kg',
    estoque: 1_650,
    coberturaDias: 7.5,
    consumoDia: 220,
    estoqueSeguranca: 600,
    leadTimeDias: 9,
    fornecedor: 'Síntese Farma S.A.',
    loteAtual: 'DIP-250505-11',
    validadeLote: new Date(2027, 3, 5),
    coa: 'Recebido',
    status: 'Normal',
    prontidaoPercent: 98,
    pedidosAbertos: 0,
    variacaoEstoquePercent: -2,
    proximaAcao: 'Manter monitoramento semanal',
    linhasAfetadas: ['L08', 'L05', 'L12'],
  },
  {
    id: 'MAT-EXC-010',
    nome: 'Lactose Monoidratada',
    categoria: 'Excipiente',
    unidade: 'kg',
    estoque: 5_740,
    coberturaDias: 8.2,
    consumoDia: 700,
    estoqueSeguranca: 1_500,
    leadTimeDias: 7,
    fornecedor: 'Excipientes do Brasil S.A.',
    coa: 'Recebido',
    status: 'Normal',
    prontidaoPercent: 97,
    pedidosAbertos: 2400,
    variacaoEstoquePercent: 4,
    proximaAcao: 'Manter monitoramento semanal',
  },
  {
    id: 'MAT-EXC-011',
    nome: 'Sacarose',
    categoria: 'Excipiente',
    unidade: 'kg',
    estoque: 2_320,
    coberturaDias: 5.8,
    consumoDia: 400,
    estoqueSeguranca: 800,
    leadTimeDias: 6,
    fornecedor: 'Excipientes do Brasil S.A.',
    loteAtual: 'SAC-250514-03',
    coa: 'Pendente',
    status: 'Bloqueado',
    prontidaoPercent: 55,
    pedidosAbertos: 0,
    variacaoEstoquePercent: 0,
    proximaAcao: 'Cobrar CoA do fornecedor — lote bloqueado para uso',
    linhasAfetadas: ['L05'],
  },
  {
    id: 'MAT-INS-015',
    nome: 'Álcool Isopropílico',
    categoria: 'Insumo',
    unidade: 'L',
    estoque: 890,
    coberturaDias: 6.4,
    consumoDia: 140,
    estoqueSeguranca: 300,
    leadTimeDias: 4,
    fornecedor: 'Quimitec Insumos Ltda.',
    coa: 'Recebido',
    status: 'Normal',
    prontidaoPercent: 99,
    pedidosAbertos: 300,
    variacaoEstoquePercent: -3,
    proximaAcao: 'Manter monitoramento semanal',
  },
  {
    id: 'MAT-EMB-020',
    nome: 'Cápsula Gelatina #1',
    categoria: 'Embalagem',
    unidade: 'mil un',
    estoque: 2_400,
    coberturaDias: 3.2,
    consumoDia: 750,
    estoqueSeguranca: 1_200,
    leadTimeDias: 8,
    fornecedor: 'CapsulTech Indústria S.A.',
    coa: 'Recebido',
    status: 'Atenção',
    prontidaoPercent: 92,
    pedidosAbertos: 1500,
    variacaoEstoquePercent: -8,
    proximaAcao: 'Antecipar pedido programado de 23/mai',
    linhasAfetadas: ['L03'],
    ordensAfetadas: ['OF-045680', 'OF-045683', 'OF-045684'],
  },
  {
    id: 'MAT-EMB-021',
    nome: 'Blister Alu/Alu 10cp',
    categoria: 'Embalagem',
    unidade: 'mil un',
    estoque: 510,
    coberturaDias: 1.7,
    consumoDia: 300,
    variacaoConsumoPercent: 8,
    estoqueSeguranca: 900,
    leadTimeDias: 15,
    fornecedor: 'Alumipack Embalagens Ltda.',
    coa: 'Recebido',
    status: 'Crítico',
    prontidaoPercent: 68,
    pedidosAbertos: 900,
    variacaoEstoquePercent: -22,
    proximaAcao: 'Liberar blister substituto homologado',
    linhasAfetadas: ['L15'],
    ordensAfetadas: ['OF-045682'],
  },
  {
    id: 'MAT-EMB-022',
    nome: 'Caixa Cartucho',
    categoria: 'Embalagem',
    unidade: 'mil un',
    estoque: 780,
    coberturaDias: 2.6,
    consumoDia: 300,
    estoqueSeguranca: 600,
    leadTimeDias: 5,
    fornecedor: 'GrafiBox Embalagens S.A.',
    coa: 'Recebido',
    status: 'Atenção',
    prontidaoPercent: 90,
    pedidosAbertos: 600,
    variacaoEstoquePercent: -10,
    proximaAcao: 'Antecipar entrega programada de 22/mai',
  },
  {
    id: 'MAT-EMB-023',
    nome: 'Frasco PEAD 30 mL',
    categoria: 'Embalagem',
    unidade: 'mil un',
    estoque: 1_880,
    coberturaDias: 9.4,
    consumoDia: 200,
    estoqueSeguranca: 500,
    leadTimeDias: 6,
    fornecedor: 'Plastfarma Indústria Ltda.',
    coa: 'Recebido',
    status: 'Normal',
    prontidaoPercent: 98,
    pedidosAbertos: 0,
    variacaoEstoquePercent: 2,
    proximaAcao: 'Manter monitoramento semanal',
    linhasAfetadas: ['L15'],
  },
]

export function materialPorId(id: string): Material | undefined {
  return materiais.find((material) => material.id === id)
}

// ── Dados da tela /materiais ─────────────────────────────────────────────────

import { serieHoraria } from '@/lib/series'
import type { EventoMaterial, OrdemImpactada, PontoTendenciaMaterial } from './types'

/** Timeline de eventos e alertas de materiais do turno. */
export const eventosMateriais: EventoMaterial[] = [
  { id: 'EVM-01', hora: '09:58', titulo: 'Consumo de Ibuprofeno API 15% acima do plano', severidade: 'Alta' },
  { id: 'EVM-02', hora: '09:12', titulo: 'CoA do lote IBP-250518-02 segue pendente no LIMS', severidade: 'Média' },
  { id: 'EVM-03', hora: '08:47', titulo: 'Pedido PO-88213 (Paracetamol API) confirmado para 21/mai', severidade: 'Baixa' },
  { id: 'EVM-04', hora: '08:05', titulo: 'Blister Alu/Alu 10cp abaixo do estoque de segurança', severidade: 'Alta' },
  { id: 'EVM-05', hora: '07:30', titulo: 'Transferência Goiânia → Anápolis de Ibuprofeno em cotação', severidade: 'Média' },
  { id: 'EVM-06', hora: '06:20', titulo: 'Recebimento de Lactose Monoidratada concluído (2.400 kg)', severidade: 'Baixa' },
]

/** Ordens-âncora impactadas por materiais críticos. */
export const ordensImpactadas: OrdemImpactada[] = [
  { ordemId: 'OF-045678', materialId: 'MAT-API-001', impacto: 'Atraso de 6 h', risco: 'Alto' },
  { ordemId: 'OF-045682', materialId: 'MAT-EMB-021', impacto: 'Atraso de 4 h', risco: 'Alto' },
  { ordemId: 'OF-045687', materialId: 'MAT-API-001', impacto: 'Sem impacto', risco: 'Médio' },
  { ordemId: 'OF-045685', materialId: 'MAT-API-002', impacto: 'Sem impacto', risco: 'Baixo' },
]

/** Checklist de prontidão de abastecimento. */
export const prontidaoAbastecimento = [
  { item: 'APIs', percent: 89 },
  { item: 'Embalagens', percent: 92 },
  { item: 'Qualidade Documental', percent: 94 },
  { item: 'Almoxarifado', percent: 90 },
  { item: 'Transporte Interno', percent: 88 },
]

export const PRONTIDAO_ABASTECIMENTO_SCORE = 91

/**
 * Tendência determinística das últimas 24 h do material: consumo acumulado,
 * estoque projetado e cobertura em dias.
 */
export function tendenciaMaterial24h(material: Material): PontoTendenciaMaterial[] {
  const consumoDia = material.consumoDia ?? Math.max(1, Math.round(material.estoque / Math.max(material.coberturaDias, 0.5)))
  const ritmo = serieHoraria(`tend-${material.id}`, new Date(2025, 4, 18, 11, 0), {
    horas: 24,
    base: consumoDia / 24,
    ruido: 0.12,
    decimais: 1,
    min: 0,
  })
  let consumoAcumulado = 0
  return ritmo.map((ponto) => {
    consumoAcumulado += ponto.valor
    const estoque = Math.max(0, Math.round((material.estoque + consumoDia - consumoAcumulado) * 10) / 10)
    return {
      label: ponto.label,
      consumo: Math.round(consumoAcumulado * 10) / 10,
      estoque,
      cobertura: Math.round((estoque / consumoDia) * 10) / 10,
    }
  })
}
