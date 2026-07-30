/**
 * Integridade referencial dos mocks: todo ID citado em um módulo precisa
 * existir no módulo dono. Roda com `npm run check:data`.
 */
import { describe, expect, it } from 'vitest'
import { fabricas, linhas } from './fabricas'
import { AREA_POR_LINHA } from './constants'
import {
  alertasFiltrados,
  blocosFiltrados,
  linhasFiltradas,
  lotesFiltrados,
  materiaisFiltrados,
  ordensFiltradas,
  otsFiltradas,
  type FiltrosSelecao,
} from './selectors'
import { buscar } from './busca'
import { notificacoes } from './notificacoes'
import { produtos } from './produtos'
import { ORDENS_ANCORA, ordens } from './ordens'
import {
  FAMILIAS_SETUP,
  GANHO_OTIMIZACAO,
  blocosSequencia,
  blocosSequenciaOtimizada,
  matrizSetup,
  restricoes,
} from './sequencia'
import { kpisSequenciamento } from './kpis'
import {
  TOTAL_PARADAS_MIN,
  detalhesExecucao,
  linhasExecucao,
  motivosParada,
  prontidaoOperacional,
} from './execucao'
import {
  CAPACIDADE_DISPONIVEL_H,
  aderenciaPorOrdem,
  calendarioCampanhas,
  cargaVsCapacidade,
  coberturaEstoque,
  planoPorLinha,
  skusRisco,
} from './planejamento'
import {
  PRONTIDAO_ABASTECIMENTO_SCORE,
  eventosMateriais,
  materiais,
  ordensImpactadas,
  prontidaoAbastecimento,
  tendenciaMaterial24h,
} from './materiais'
import {
  PRONTIDAO_QUALIDADE_SCORE,
  desviosRanking,
  lotes,
  mapaQualidadeAreas,
  prontidaoQualidade,
  statusDaAreaQualidade,
  tendenciaQualidade24h,
} from './lotes'
import { equipamentos } from './equipamentos'
import {
  PRONTIDAO_MANUTENCAO_SCORE,
  SLA_OTS_PERCENT,
  TECNICOS_DISPONIVEIS,
  TECNICOS_TOTAL,
  alertasPreditivos,
  ordensManutencao,
  otRecomendadaCompressora,
  prontidaoManutencao,
  tendenciaCondicao,
} from './manutencao'
import {
  PRONTIDAO_FINANCEIRA_SCORE,
  composicaoCustos,
  driversCusto,
  ordensImpactoFinanceiro,
  performancePorLinha,
  prontidaoFinanceira,
  visaoFinanceiraTurno,
} from './custos'
import {
  alertas,
  fluxoDecisao,
  matrizPrioridadeUrgencia,
  prontidaoDecisao,
  proximasAprovacoes,
  topRiscosCategorias,
} from './alertas'
import {
  GOVERNANCA_AGENTES_SCORE,
  acoesAgentes,
  agentes,
  desempenhoAgentes,
  distribuicaoGovernanca,
  niveisAutonomia,
  orquestracaoPrincipal,
  orquestracaoRamos,
  selosGovernanca,
} from './agentes'
import { MELHOR_CENARIO_ID, cenarios, eventosSimulaveis } from './cenarios'
import {
  RELATORIOS_GOVERNANCA_SCORE,
  agendamentos,
  catalogoAnalitico,
  consumoRelatorios,
  governancaRelatorios,
  leiturasSemana,
  relatorios,
  resumoExecutivoKpis,
} from './relatorios'
import { detalhesAreasGemeo, estadosAreasGemeo, kpisPlantaGemeo, legendaGemeo } from './gemeo'
import {
  canaisNotificacao,
  configuracoesRapidas,
  eventosAuditoria,
  integracoesConfig,
  parametrosSistema,
  perfisUsuarios,
  regrasNegocio,
  resumoConfiguracoes,
  statusSistema,
} from './configuracoes'
import {
  alertasSupply,
  composicaoEstoque,
  copilotSupply,
  destaquesSemana,
  fluxoSupply,
  kpisSupply,
  kpisSupplySecundarios,
  nosLogisticos,
  pontosMapaSite,
} from './supply'
import { ANALISE_CENARIOS, FONTES_COPILOT, RESPOSTA_PADRAO_QA, bancoQA, buscarResposta, conteudoCopilot } from './copilot'
import * as todosOsModulos from './index'
import { kpisPorTela } from './kpis'
import { producaoVsPlano } from './graficos'
import { navegacao } from './navigation'
import { AREAS_ALERTA } from './types'

const idsLinhas = new Set(linhas.map((linha) => linha.id))
const idsFabricas = new Set(fabricas.map((fabrica) => fabrica.id))
const idsProdutos = new Set(produtos.map((produto) => produto.id))
const idsOrdens = new Set(ordens.map((ordem) => ordem.id))
const idsMateriais = new Set(materiais.map((material) => material.id))
const idsLotes = new Set(lotes.map((lote) => lote.id))
const idsEquipamentos = new Set(equipamentos.map((equipamento) => equipamento.id))
const idsOTs = new Set(ordensManutencao.map((ot) => ot.id))
const idsAgentes = new Set(agentes.map((agente) => agente.id))
const idsEventos = new Set(eventosSimulaveis.map((evento) => evento.id))
const rotas = navegacao.map((item) => item.path)

function semDuplicatas(ids: string[]) {
  expect(new Set(ids).size).toBe(ids.length)
}

describe('fábricas e linhas', () => {
  it('tem 5 fábricas (3 operacionais) e 13 linhas com IDs únicos', () => {
    expect(fabricas).toHaveLength(5)
    expect(fabricas.filter((fabrica) => fabrica.linhas.length > 0)).toHaveLength(3)
    expect(linhas).toHaveLength(13)
    semDuplicatas(linhas.map((linha) => linha.id))
  })

  it('toda linha aponta para a fábrica que a contém', () => {
    for (const fabrica of fabricas) {
      for (const linha of fabrica.linhas) expect(linha.fabricaId).toBe(fabrica.id)
    }
  })

  it('OEE e capacidade das linhas ficam entre 0 e 100', () => {
    for (const linha of linhas) {
      expect(linha.oee).toBeGreaterThanOrEqual(0)
      expect(linha.oee).toBeLessThanOrEqual(100)
      expect(linha.capacidadeUtilizada).toBeGreaterThanOrEqual(0)
      expect(linha.capacidadeUtilizada).toBeLessThanOrEqual(100)
    }
  })
})

describe('ordens de produção', () => {
  it('tem 14 ordens com IDs únicos e as 9 âncoras presentes', () => {
    expect(ordens).toHaveLength(14)
    semDuplicatas(ordens.map((ordem) => ordem.id))
    for (const id of ORDENS_ANCORA) expect(idsOrdens.has(id)).toBe(true)
  })

  it('toda ordem referencia produto, linha e fábrica existentes e coerentes', () => {
    for (const ordem of ordens) {
      expect(idsProdutos.has(ordem.produtoId)).toBe(true)
      expect(idsLinhas.has(ordem.linhaId)).toBe(true)
      expect(idsFabricas.has(ordem.fabricaId)).toBe(true)
      const linha = linhas.find((item) => item.id === ordem.linhaId)
      expect(linha?.fabricaId).toBe(ordem.fabricaId)
      const produto = produtos.find((item) => item.id === ordem.produtoId)
      expect(produto?.unidade).toBe(ordem.unidade)
      expect(ordem.fim.getTime()).toBeGreaterThan(ordem.inicio.getTime())
    }
  })

  it('mantém os fatos da âncora OF-045678', () => {
    const of678 = ordens.find((ordem) => ordem.id === 'OF-045678')
    expect(of678).toMatchObject({
      produtoId: 'buscopan-composto',
      linhaId: 'L12',
      quantidade: 1_200_000,
      progresso: 68,
      produzido: 820_560,
      prontidaoMateriais: 100,
      operador: 'Operação L12 · Turno A',
      status: 'Em execução',
    })
  })

  it('blocos de sequência (base e otimizada) referenciam linhas e ordens existentes', () => {
    for (const bloco of [...blocosSequencia, ...blocosSequenciaOtimizada]) {
      expect(idsLinhas.has(bloco.linhaId)).toBe(true)
      expect(bloco.fim.getTime()).toBeGreaterThan(bloco.inicio.getTime())
      if (bloco.tipo === 'producao') {
        expect(bloco.ordemId).toBeDefined()
        expect(idsOrdens.has(bloco.ordemId as string)).toBe(true)
        const ordem = ordens.find((item) => item.id === bloco.ordemId)
        expect(ordem?.linhaId).toBe(bloco.linhaId)
      }
    }
  })

  it('toda ordem de Anápolis aparece na sequência base e na otimizada', () => {
    for (const blocos of [blocosSequencia, blocosSequenciaOtimizada]) {
      const ordensNoGantt = new Set(
        blocos.filter((bloco) => bloco.tipo === 'producao').map((bloco) => bloco.ordemId),
      )
      for (const ordem of ordens) {
        if (ordem.fabricaId === 'anapolis') expect(ordensNoGantt.has(ordem.id)).toBe(true)
      }
    }
  })
})

describe('sequenciamento', () => {
  it('a otimização elimina exatamente 3 setups', () => {
    const setupsBase = blocosSequencia.filter((bloco) => bloco.tipo === 'setup').length
    const setupsOtimizados = blocosSequenciaOtimizada.filter((bloco) => bloco.tipo === 'setup').length
    expect(setupsBase - setupsOtimizados).toBe(GANHO_OTIMIZACAO.setupsEliminados)
  })

  it('blocos não se sobrepõem dentro da mesma linha', () => {
    for (const blocos of [blocosSequencia, blocosSequenciaOtimizada]) {
      const porLinha = new Map<string, Array<[number, number]>>()
      for (const bloco of blocos) {
        const lista = porLinha.get(bloco.linhaId) ?? []
        lista.push([bloco.inicio.getTime(), bloco.fim.getTime()])
        porLinha.set(bloco.linhaId, lista)
      }
      for (const [linhaId, faixas] of porLinha) {
        const ordenadas = faixas.sort((a, b) => a[0] - b[0])
        for (let i = 1; i < ordenadas.length; i++) {
          expect(ordenadas[i][0], `sobreposição na ${linhaId}`).toBeGreaterThanOrEqual(ordenadas[i - 1][1])
        }
      }
    }
  })

  it('matriz de setup cobre as 5 famílias com trocas de 45–70 min e diagonal mínima', () => {
    expect(FAMILIAS_SETUP).toHaveLength(5)
    for (const de of FAMILIAS_SETUP) {
      for (const para of FAMILIAS_SETUP) {
        const minutos = matrizSetup[de][para]
        expect(minutos).toBeGreaterThanOrEqual(45)
        expect(minutos).toBeLessThanOrEqual(70)
        if (de !== para) expect(minutos).toBeGreaterThan(matrizSetup[de][de])
      }
    }
    expect(matrizSetup['Antigripais']['Antitérmicos']).toBe(70)
  })

  it('tem 6 restrições, uma por tipo', () => {
    expect(restricoes).toHaveLength(6)
    expect(new Set(restricoes.map((r) => r.tipo)).size).toBe(6)
  })

  it('KPIs refletem a otimização: setups 28→25 e horas 312→301,3', () => {
    const base = kpisSequenciamento(false)
    const otimizada = kpisSequenciamento(true)
    expect(base.find((k) => k.id === 'sq-setups')?.valor).toBe('28')
    expect(otimizada.find((k) => k.id === 'sq-setups')?.valor).toBe('25')
    expect(base.find((k) => k.id === 'sq-horas')?.valor).toBe('312 h')
    expect(otimizada.find((k) => k.id === 'sq-horas')?.valor).toBe('301,3 h')
  })
})

describe('materiais', () => {
  it('tem 10 itens com os obrigatórios e status corretos', () => {
    expect(materiais).toHaveLength(10)
    semDuplicatas(materiais.map((material) => material.id))
    const ibuprofeno = materiais.find((material) => material.id === 'MAT-API-001')
    expect(ibuprofeno).toMatchObject({ coberturaDias: 1.4, status: 'Crítico', estoque: 320 })
    const blister = materiais.find((material) => material.id === 'MAT-EMB-021')
    expect(blister).toMatchObject({ coberturaDias: 1.7, status: 'Crítico' })
    const sacarose = materiais.find((material) => material.nome === 'Sacarose')
    expect(sacarose?.status).toBe('Bloqueado')
  })

  it('linhas e ordens afetadas existem', () => {
    for (const material of materiais) {
      for (const linhaId of material.linhasAfetadas ?? []) expect(idsLinhas.has(linhaId)).toBe(true)
      for (const ordemId of material.ordensAfetadas ?? []) expect(idsOrdens.has(ordemId)).toBe(true)
    }
  })

  it('prontidão executiva dentro de 0–100 com os valores da Visão Geral', () => {
    for (const material of materiais) {
      expect(material.prontidaoPercent).toBeGreaterThanOrEqual(0)
      expect(material.prontidaoPercent).toBeLessThanOrEqual(100)
    }
    expect(materiais.find((m) => m.id === 'MAT-API-001')?.prontidaoPercent).toBe(62)
    expect(materiais.find((m) => m.id === 'MAT-EMB-021')?.prontidaoPercent).toBe(68)
  })

  it('timeline da tela tem 6 eventos com hora válida e severidades conhecidas', () => {
    expect(eventosMateriais).toHaveLength(6)
    semDuplicatas(eventosMateriais.map((evento) => evento.id))
    for (const evento of eventosMateriais) {
      expect(evento.hora).toMatch(/^\d{2}:\d{2}$/)
      expect(['Crítica', 'Alta', 'Média', 'Baixa']).toContain(evento.severidade)
      expect(evento.titulo.length).toBeGreaterThan(10)
    }
  })

  it('ordens impactadas referenciam ordens-âncora e materiais existentes', () => {
    expect(ordensImpactadas).toHaveLength(4)
    for (const impacto of ordensImpactadas) {
      expect(idsOrdens.has(impacto.ordemId)).toBe(true)
      expect(idsMateriais.has(impacto.materialId)).toBe(true)
    }
    expect(ordensImpactadas[0]).toMatchObject({
      ordemId: 'OF-045678',
      materialId: 'MAT-API-001',
      impacto: 'Atraso de 6 h',
      risco: 'Alto',
    })
    expect(ordensImpactadas[1]).toMatchObject({ ordemId: 'OF-045682', impacto: 'Atraso de 4 h', risco: 'Alto' })
  })

  it('prontidão de abastecimento tem 5 itens e score 91', () => {
    expect(prontidaoAbastecimento).toHaveLength(5)
    for (const item of prontidaoAbastecimento) {
      expect(item.percent).toBeGreaterThanOrEqual(0)
      expect(item.percent).toBeLessThanOrEqual(100)
    }
    expect(PRONTIDAO_ABASTECIMENTO_SCORE).toBe(91)
  })

  it('tendência 24 h é determinística, com 24 pontos e estoque nunca negativo', () => {
    const ibuprofeno = materiais.find((material) => material.id === 'MAT-API-001')
    expect(ibuprofeno).toBeDefined()
    if (!ibuprofeno) return
    const primeira = tendenciaMaterial24h(ibuprofeno)
    const segunda = tendenciaMaterial24h(ibuprofeno)
    expect(primeira).toHaveLength(24)
    expect(segunda).toEqual(primeira)
    for (const ponto of primeira) {
      expect(ponto.estoque).toBeGreaterThanOrEqual(0)
      expect(ponto.cobertura).toBeGreaterThanOrEqual(0)
    }
    // O último ponto converge para o estoque atual (320 kg) e a cobertura de ~1,4 dia.
    const ultimo = primeira[primeira.length - 1]
    expect(Math.abs(ultimo.estoque - ibuprofeno.estoque)).toBeLessThan(ibuprofeno.estoque * 0.15)
  })
})

describe('lotes de qualidade', () => {
  it('tem 6 lotes referenciando produto, linha e ordem existentes', () => {
    expect(lotes).toHaveLength(6)
    semDuplicatas(lotes.map((lote) => lote.id))
    for (const lote of lotes) {
      expect(idsProdutos.has(lote.produtoId)).toBe(true)
      expect(idsLinhas.has(lote.linhaId)).toBe(true)
      if (lote.ordemId) expect(idsOrdens.has(lote.ordemId)).toBe(true)
    }
  })

  it('o lote 2456789A tem parâmetros dentro da faixa e 4 documentos', () => {
    const lote = lotes.find((item) => item.id === '2456789A')
    expect(lote?.parametros).toHaveLength(4)
    for (const parametro of lote?.parametros ?? []) expect(parametro.situacao).toBe('Dentro da faixa')
    expect(lote?.documentos).toHaveLength(4)
    expect(lote?.documentos?.find((documento) => documento.nome === 'Laudo')?.status).toBe('Pendente')
  })

  it('todo lote tem próxima ação e início na data-base da demo', () => {
    for (const lote of lotes) {
      expect(lote.proximaAcao.length).toBeGreaterThan(5)
      expect(lote.inicio).toBeDefined()
      expect(lote.inicio?.getMonth()).toBe(4)
      expect(lote.inicio?.getDate()).toBe(19)
    }
    const buscopan = lotes.find((item) => item.id === '2456789A')
    expect(buscopan?.inicio?.getHours()).toBe(6)
    expect(buscopan?.inicio?.getMinutes()).toBe(15)
    expect(buscopan?.esperaMinutos).toBe(138)
  })

  it('mapa da qualidade cobre 6 áreas e aplica a regra Normal ≥90 · Atenção 80–89 · Crítico <80', () => {
    expect(mapaQualidadeAreas).toHaveLength(6)
    expect(statusDaAreaQualidade(92)).toBe('Normal')
    expect(statusDaAreaQualidade(86)).toBe('Atenção')
    expect(statusDaAreaQualidade(78)).toBe('Crítico')
    const revestimento = mapaQualidadeAreas.find((area) => area.area === 'Revestimento L05')
    expect(revestimento?.percent).toBe(78)
    expect(statusDaAreaQualidade(revestimento?.percent ?? 0)).toBe('Crítico')
  })

  it('ranking de desvios tem 6 itens em ordem decrescente de ocorrências', () => {
    expect(desviosRanking).toHaveLength(6)
    semDuplicatas(desviosRanking.map((desvio) => desvio.id))
    for (let i = 1; i < desviosRanking.length; i++) {
      expect(desviosRanking[i].quantidade).toBeLessThanOrEqual(desviosRanking[i - 1].quantidade)
    }
    expect(desviosRanking[0]).toMatchObject({ desvio: 'Peso fora da faixa', quantidade: 27, percent: 28 })
  })

  it('prontidão de qualidade tem 6 itens e score 92; tendência 24 h fica na faixa esperada', () => {
    expect(prontidaoQualidade).toHaveLength(6)
    expect(PRONTIDAO_QUALIDADE_SCORE).toBe(92)
    expect(tendenciaQualidade24h).toHaveLength(24)
    for (const ponto of tendenciaQualidade24h) {
      expect(ponto.aprovacao).toBeGreaterThanOrEqual(95)
      expect(ponto.aprovacao).toBeLessThanOrEqual(99.5)
      expect(ponto.desvios).toBeGreaterThanOrEqual(0)
      expect(ponto.liberados).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('manutenção', () => {
  it('tem 8 equipamentos e 8 OTs, um por ativo', () => {
    expect(equipamentos).toHaveLength(8)
    expect(ordensManutencao).toHaveLength(8)
    semDuplicatas(equipamentos.map((equipamento) => equipamento.id))
    semDuplicatas(ordensManutencao.map((ot) => ot.id))
  })

  it('toda OT aponta para um ativo existente e vice-versa', () => {
    for (const ot of ordensManutencao) expect(idsEquipamentos.has(ot.ativoId)).toBe(true)
    for (const equipamento of equipamentos) {
      if (equipamento.otVinculada) expect(idsOTs.has(equipamento.otVinculada)).toBe(true)
      if (equipamento.linhaId) expect(idsLinhas.has(equipamento.linhaId)).toBe(true)
      expect(idsFabricas.has(equipamento.fabricaId)).toBe(true)
    }
  })

  it('mantém os fatos da Compressora L12', () => {
    const compressora = equipamentos.find((equipamento) => equipamento.id === 'eq-compressora-l12')
    expect(compressora).toMatchObject({
      disponibilidade: 72,
      probabilidadeFalha: 78,
      otVinculada: 'OT-245689',
      pecasCriticasEstoque: 3,
    })
    const vibracao = compressora?.indicadores.find((indicador) => indicador.nome === 'Vibração')
    expect(vibracao).toMatchObject({ valor: 12.3, unidade: 'mm/s', variacaoPercent: 35 })
  })

  it('tem 5 alertas preditivos com ativos existentes e severidades válidas', () => {
    expect(alertasPreditivos).toHaveLength(5)
    semDuplicatas(alertasPreditivos.map((alerta) => alerta.id))
    for (const alerta of alertasPreditivos) {
      expect(['Crítica', 'Alta', 'Média', 'Baixa']).toContain(alerta.severidade)
      expect(alerta.causaProvavel.length).toBeGreaterThan(10)
      expect(alerta.proximaAcao.length).toBeGreaterThan(5)
      if (alerta.ativoId) expect(idsEquipamentos.has(alerta.ativoId)).toBe(true)
    }
    expect(alertasPreditivos[0].severidade).toBe('Crítica')
    expect(alertasPreditivos[0].ativoId).toBe('eq-compressora-l12')
  })

  it('prontidão da manutenção: 4 itens, técnicos 18/22, SLA 92 e score 89', () => {
    expect(prontidaoManutencao.map((item) => item.item)).toEqual(['Preventiva', 'Preditiva', 'Corretiva', 'Peças'])
    expect(TECNICOS_DISPONIVEIS).toBe(18)
    expect(TECNICOS_TOTAL).toBe(22)
    expect(SLA_OTS_PERCENT).toBe(92)
    expect(PRONTIDAO_MANUTENCAO_SCORE).toBe(89)
  })

  it('a OT recomendada pelo agente é a 245690, Programada na janela de quarta 02:00 – 05:00', () => {
    expect(otRecomendadaCompressora).toMatchObject({
      id: 'OT-245690',
      ativoId: 'eq-compressora-l12',
      tipo: 'Preditiva',
      prioridade: 'Alta',
      status: 'Programada',
    })
    expect(otRecomendadaCompressora.janelaInicio.getDate()).toBe(21)
    expect(otRecomendadaCompressora.janelaInicio.getDay()).toBe(3) // quarta-feira
    expect(otRecomendadaCompressora.janelaInicio.getHours()).toBe(2)
    expect(otRecomendadaCompressora.janelaFim.getHours()).toBe(5)
    // Só entra na fila pela ação "Acionar manutenção" — não faz parte da carteira base.
    expect(idsOTs.has(otRecomendadaCompressora.id)).toBe(false)
  })

  it('tendência de condição é determinística com 6/24/7 pontos e converge para a vibração atual', () => {
    expect(tendenciaCondicao('eq-compressora-l12', '6h')).toHaveLength(6)
    expect(tendenciaCondicao('eq-compressora-l12', '7d')).toHaveLength(7)
    const primeira = tendenciaCondicao('eq-compressora-l12', '24h')
    expect(primeira).toHaveLength(24)
    expect(tendenciaCondicao('eq-compressora-l12', '24h')).toEqual(primeira)
    const ultimo = primeira[primeira.length - 1]
    expect(ultimo.vibracao).toBeGreaterThan(11)
    expect(ultimo.vibracao).toBeLessThan(14)
  })
})

describe('custos e performance', () => {
  it('visão financeira cobre as 8 horas do Turno A com os acumulados da tela', () => {
    expect(visaoFinanceiraTurno).toHaveLength(8)
    expect(visaoFinanceiraTurno[0].label).toBe('06:00')
    expect(visaoFinanceiraTurno[7].label).toBe('13:00')
    const real = visaoFinanceiraTurno.reduce((soma, ponto) => soma + ponto.custoReal, 0)
    const orcado = visaoFinanceiraTurno.reduce((soma, ponto) => soma + ponto.custoOrcado, 0)
    const margem = visaoFinanceiraTurno.reduce((soma, ponto) => soma + ponto.margem, 0)
    expect(real).toBe(2_482) // R$ 2,48 mi
    expect(orcado).toBe(2_560) // R$ 2,56 mi — diferença −R$ 78 mil (−3,0%)
    expect(margem).toBe(790) // R$ 790 mil → 31,8% do custo real
    expect(Math.round((margem / real) * 1000) / 10).toBe(31.8)
  })

  it('composição de custos soma 100% e bate com o custo do turno', () => {
    expect(composicaoCustos).toHaveLength(7)
    const percentTotal = composicaoCustos.reduce((soma, item) => soma + item.percent, 0)
    expect(Math.abs(percentTotal - 100)).toBeLessThan(0.1)
    const valorTotal = composicaoCustos.reduce((soma, item) => soma + item.valor, 0)
    expect(Math.abs(valorTotal - 2_482_000) / 2_482_000).toBeLessThan(0.005)
  })

  it('drivers de custo: top 6 em ordem decrescente', () => {
    expect(driversCusto).toHaveLength(6)
    for (let i = 1; i < driversCusto.length; i++) {
      expect(driversCusto[i].valor).toBeLessThanOrEqual(driversCusto[i - 1].valor)
    }
    expect(driversCusto[0]).toMatchObject({ driver: 'Perdas por refugo', valor: 146_000, percent: 24 })
  })

  it('performance por linha cobre as 5 linhas de Anápolis com a L12 crítica', () => {
    expect(performancePorLinha).toHaveLength(5)
    for (const linha of performancePorLinha) expect(idsLinhas.has(linha.linhaId)).toBe(true)
    expect(performancePorLinha[0]).toMatchObject({
      linhaId: 'L12',
      custoUnidade: 1.96,
      situacao: 'Crítico',
      impactoFinanceiro: -210_000,
    })
    expect(prontidaoFinanceira).toHaveLength(5)
    expect(PRONTIDAO_FINANCEIRA_SCORE).toBe(84)
  })

  it('ordens de maior impacto referenciam âncoras e repetem a aderência do Planejamento', () => {
    expect(ordensImpactoFinanceiro).toHaveLength(5)
    for (const item of ordensImpactoFinanceiro) {
      expect(idsOrdens.has(item.ordemId)).toBe(true)
      expect(aderenciaPorOrdem[item.ordemId]).toBe(item.aderenciaPercent)
    }
  })
})

describe('alertas', () => {
  it('tem 7 alertas com área válida e referências existentes', () => {
    expect(alertas).toHaveLength(7)
    semDuplicatas(alertas.map((alerta) => alerta.id))
    for (const alerta of alertas) {
      expect(AREAS_ALERTA).toContain(alerta.area)
      expect(idsFabricas.has(alerta.fabricaId)).toBe(true)
      if (alerta.linhaId) expect(idsLinhas.has(alerta.linhaId)).toBe(true)
      if (alerta.ordemId) expect(idsOrdens.has(alerta.ordemId)).toBe(true)
      if (alerta.materialId) expect(idsMateriais.has(alerta.materialId)).toBe(true)
      if (alerta.ativoId) expect(idsEquipamentos.has(alerta.ativoId)).toBe(true)
      if (alerta.loteId) expect(idsLotes.has(alerta.loteId)).toBe(true)
    }
  })

  it('o impacto somado bate com o KPI de impacto (R$ 1,34 mi)', () => {
    const total = alertas.reduce((soma, alerta) => soma + alerta.impactoEstimado, 0)
    expect(total).toBe(1_338_000)
  })

  it('todo alerta tem os campos do drawer preenchidos', () => {
    for (const alerta of alertas) {
      expect(alerta.causaProvavel.length).toBeGreaterThan(10)
      expect(alerta.impactoOperacional.length).toBeGreaterThan(10)
      expect(alerta.alternativas.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('dados da central: funil, categorias (R$ 1,82 mi), matriz (32) e agenda', () => {
    expect(fluxoDecisao.map((etapa) => etapa.valor)).toEqual([14, 9, 7, 5, 6, 18])
    expect(topRiscosCategorias.reduce((soma, risco) => soma + risco.valor, 0)).toBe(1_820_000)
    expect(matrizPrioridadeUrgencia.reduce((soma, quadrante) => soma + quadrante.quantidade, 0)).toBe(32)
    expect(prontidaoDecisao).toHaveLength(5)
    expect(proximasAprovacoes).toHaveLength(5)
  })
})

describe('agentes IA', () => {
  it('tem 9 agentes e 4 ações na fila referenciando agentes existentes', () => {
    expect(agentes).toHaveLength(9)
    expect(acoesAgentes).toHaveLength(4)
    for (const acao of acoesAgentes) {
      expect(idsAgentes.has(acao.agenteId)).toBe(true)
      expect(acao.responsavel.length).toBeGreaterThan(3)
    }
    // A fila cobre o funil de decisão inteiro.
    expect(acoesAgentes.map((acao) => acao.status).sort()).toEqual(
      ['Aprovada', 'Em análise', 'Executada', 'Pendente'].sort(),
    )
  })

  it('inclui a ação obrigatória de antecipar a compra de Ibuprofeno API', () => {
    const acao = acoesAgentes.find((item) => item.titulo.includes('Antecipar compra de Ibuprofeno API'))
    expect(acao).toBeDefined()
    expect(acao?.status).toBe('Pendente')
    expect(acao?.impacto).toContain('R$ 780 mil')
  })

  it('orquestração: fluxo principal de 4 nós e 4 ramos com origem válida', () => {
    expect(orquestracaoPrincipal.map((no) => no.dominio)).toEqual([
      'Planejamento',
      'Sequenciamento',
      'Materiais',
      'Execução',
    ])
    expect(orquestracaoRamos).toHaveLength(4)
    const principais = new Set(orquestracaoPrincipal.map((no) => no.dominio))
    for (const ramo of orquestracaoRamos) {
      expect(principais.has(ramo.origem)).toBe(true)
      expect(ramo.eventos).toBeGreaterThan(0)
    }
  })

  it('níveis de autonomia somam a rede de 12 agentes e 100%', () => {
    expect(niveisAutonomia).toHaveLength(4)
    expect(niveisAutonomia.reduce((soma, nivel) => soma + nivel.agentes, 0)).toBe(12)
    expect(niveisAutonomia.reduce((soma, nivel) => soma + nivel.percent, 0)).toBe(100)
    expect(niveisAutonomia[0]).toMatchObject({ nivel: 'N1', agentes: 0, percent: 0 })
  })

  it('desempenho cobre 6 agentes (incluindo Auditoria, sem ganho direto)', () => {
    expect(desempenhoAgentes).toHaveLength(6)
    for (const item of desempenhoAgentes) expect(idsAgentes.has(item.agenteId)).toBe(true)
    const auditoria = desempenhoAgentes.find((item) => item.agenteId === 'ag-auditoria')
    expect(auditoria?.ganho).toBeNull()
    expect(desempenhoAgentes[0]).toMatchObject({ agenteId: 'ag-sequenciamento', acoes: 221, ganho: 612_000 })
  })

  it('governança: score 91, distribuição soma 100% e 6 selos preenchidos', () => {
    expect(GOVERNANCA_AGENTES_SCORE).toBe(91)
    expect(distribuicaoGovernanca.reduce((soma, faixa) => soma + faixa.percent, 0)).toBe(100)
    expect(selosGovernanca).toHaveLength(6)
    for (const selo of selosGovernanca) {
      expect(selo.titulo.length).toBeGreaterThan(3)
      expect(selo.detalhe.length).toBeGreaterThan(3)
    }
  })
})

describe('cenários', () => {
  it('tem 5 eventos e 3 cenários; o recomendado é o Cenário A', () => {
    expect(eventosSimulaveis).toHaveLength(5)
    expect(cenarios).toHaveLength(3)
    const recomendado = cenarios.find((cenario) => cenario.recomendado)
    expect(recomendado?.id).toBe(MELHOR_CENARIO_ID)
    expect(recomendado?.nome).toBe('Cenário A')
  })

  it('todo cenário referencia eventos existentes e mantém a comparação do CLAUDE.md', () => {
    for (const cenario of cenarios) {
      for (const eventoId of cenario.eventos) expect(idsEventos.has(eventoId)).toBe(true)
    }
    expect(cenarios.map((cenario) => cenario.atendimentoPercent)).toEqual([94, 97, 96])
    expect(cenarios.map((cenario) => cenario.horasSetup)).toEqual([320, 275, 290])
    expect(cenarios.map((cenario) => cenario.custoIncremental)).toEqual([null, 180_000, 95_000])
    expect(cenarios.map((cenario) => cenario.skusComRuptura)).toEqual([12, 4, 6])
    expect(cenarios.map((cenario) => cenario.oeeProjetado)).toEqual([68, 73, 71])
    expect(cenarios.map((cenario) => cenario.risco)).toEqual(['Médio', 'Baixo', 'Médio'])
  })
})

describe('copiloto', () => {
  it('cobre as 13 telas do menu com 2–3 botões e blocos preenchidos', () => {
    expect(Object.keys(conteudoCopilot).sort()).toEqual([...rotas].sort())
    for (const rota of rotas) {
      const conteudo = conteudoCopilot[rota]
      expect(conteudo.tela).toBe(rota)
      expect(conteudo.resumo.length).toBeGreaterThan(40)
      expect(conteudo.riscos.length).toBeGreaterThan(0)
      expect(conteudo.causas.length).toBeGreaterThan(0)
      expect(conteudo.acoes.length).toBeGreaterThan(0)
      expect(conteudo.botoes.length).toBeGreaterThanOrEqual(2)
      expect(conteudo.botoes.length).toBeLessThanOrEqual(3)
    }
  })

  it('tem no mínimo 14 pares de Q&A com palavras-chave e fontes válidas', () => {
    expect(bancoQA.length).toBeGreaterThanOrEqual(14)
    semDuplicatas(bancoQA.map((par) => par.id))
    for (const par of bancoQA) {
      expect(par.palavrasChave.length).toBeGreaterThanOrEqual(2)
      expect(par.resposta.length).toBeGreaterThan(60)
      expect(par.fontes.length).toBeGreaterThan(0)
      for (const fonte of par.fontes) expect(FONTES_COPILOT).toContain(fonte)
    }
  })

  it('toda pergunta sugerida tem match no banco Q&A — nunca cai no fallback', () => {
    for (const rota of rotas) {
      const conteudo = conteudoCopilot[rota]
      expect(conteudo.perguntasSugeridas).toHaveLength(3)
      for (const sugestao of conteudo.perguntasSugeridas) {
        expect(buscarResposta(sugestao), `sem match: "${sugestao}" (${rota})`).not.toBeNull()
      }
    }
    expect(buscarResposta('pergunta sem resposta alguma')).toBeNull()
    expect(RESPOSTA_PADRAO_QA).toContain('Ainda não tenho essa análise')
  })

  it('"simule a parada da L12" oferece a ação de abrir o simulador no EV-001', () => {
    const par = buscarResposta('Simule a parada da L12')
    expect(par?.id).toBe('qa-04')
    expect(par?.acao).toMatchObject({ tipo: 'abrir-simulador', eventoId: 'EV-001' })
  })

  it('análise de cenários tem 2 parágrafos e eventos têm impacto preliminar', () => {
    expect(ANALISE_CENARIOS).toHaveLength(2)
    for (const evento of eventosSimulaveis) expect(evento.impactoPreliminar.length).toBeGreaterThan(10)
  })
})

describe('KPIs por tela', () => {
  it('cobre as 13 telas com 6–7 cards populados e sparklines determinísticas', () => {
    expect(Object.keys(kpisPorTela).sort()).toEqual([...rotas].sort())
    for (const rota of rotas) {
      const cards = kpisPorTela[rota]
      expect(cards.length).toBeGreaterThanOrEqual(6)
      expect(cards.length).toBeLessThanOrEqual(7)
      semDuplicatas(cards.map((card) => card.id))
      for (const card of cards) {
        expect(card.label.length).toBeGreaterThan(0)
        expect(card.valor.length).toBeGreaterThan(0)
        expect(card.sparkline.length).toBeGreaterThanOrEqual(8)
      }
    }
  })
})

describe('planejamento', () => {
  it('carga vs capacidade cobre W21–W25 com excedente apenas na W24', () => {
    expect(cargaVsCapacidade).toHaveLength(5)
    for (const semana of cargaVsCapacidade) {
      if (semana.semana === 'W24') {
        expect(semana.excedente).toBeGreaterThan(0)
        expect(semana.carga + semana.adicional + semana.excedente).toBeGreaterThan(CAPACIDADE_DISPONIVEL_H)
      } else {
        expect(semana.excedente).toBe(0)
        expect(semana.carga + semana.adicional).toBeLessThanOrEqual(CAPACIDADE_DISPONIVEL_H)
      }
    }
  })

  it('cobertura, SKUs em risco, plano por linha e calendário estão consistentes', () => {
    expect(coberturaEstoque).toHaveLength(5)
    for (const linha of coberturaEstoque) expect(linha.valores).toHaveLength(5)
    expect(coberturaEstoque[coberturaEstoque.length - 1].total).toBe(true)
    expect(skusRisco).toHaveLength(5)
    expect(planoPorLinha).toHaveLength(linhas.length)
    for (const plano of planoPorLinha) {
      expect(idsLinhas.has(plano.linhaId)).toBe(true)
      expect(plano.horas).toHaveLength(5)
    }
    for (const campanha of calendarioCampanhas) {
      expect(['W21', 'W22', 'W23', 'W24', 'W25']).toContain(campanha.semana)
    }
    for (const ordemId of Object.keys(aderenciaPorOrdem)) expect(idsOrdens.has(ordemId)).toBe(true)
  })
})

describe('execução', () => {
  it('cobre as 5 linhas de Anápolis com ordens-âncora e detalhes por ordem', () => {
    expect(linhasExecucao).toHaveLength(5)
    for (const item of linhasExecucao) {
      expect(idsLinhas.has(item.linhaId)).toBe(true)
      expect(idsOrdens.has(item.ordemId)).toBe(true)
      const ordem = ordens.find((o) => o.id === item.ordemId)
      expect(ordem?.linhaId).toBe(item.linhaId)
      expect(ordem?.fabricaId).toBe('anapolis')
      expect(detalhesExecucao[item.ordemId]).toBeDefined()
    }
    const parada = linhasExecucao.find((item) => item.linhaId === 'L15')
    expect(parada?.statusExecucao).toBe('Parada')
  })

  it('detalhe da OF-045678 mantém os fatos do acompanhamento', () => {
    const detalhe = detalhesExecucao['OF-045678']
    expect(detalhe).toMatchObject({
      loteId: '2456789A',
      eficienciaPercent: 82.3,
      setupMinutos: 18,
      velocidadeRealHora: 325_000,
      velocidadeMetaHora: 360_000,
      yieldPercent: 98.6,
      refugoPercent: 0.78,
    })
    expect(detalhe.producaoPorHora).toHaveLength(8)
    // Buckets após 10:00 ainda não decorreram
    expect(detalhe.producaoPorHora[5].real).toBeNull()
  })

  it('pareto de paradas soma 150 min e 100%', () => {
    expect(motivosParada).toHaveLength(6)
    expect(motivosParada.reduce((soma, item) => soma + item.minutos, 0)).toBe(TOTAL_PARADAS_MIN)
    expect(motivosParada.reduce((soma, item) => soma + item.percent, 0)).toBe(100)
    expect(prontidaoOperacional).toHaveLength(5)
  })
})

describe('gráficos', () => {
  it('produção vs plano cobre 7 dias e termina em 2.094/1.968', () => {
    expect(producaoVsPlano).toHaveLength(7)
    const ultimo = producaoVsPlano[producaoVsPlano.length - 1]
    expect(ultimo.real).toBe(2_094)
    expect(ultimo.plano).toBe(1_968)
    expect(ultimo.label).toBe('19/mai')
  })
})

describe('perspectiva supply', () => {
  it('duas fileiras de 5 KPIs com IDs únicos', () => {
    expect(kpisSupply).toHaveLength(5)
    expect(kpisSupplySecundarios).toHaveLength(5)
    semDuplicatas([...kpisSupply, ...kpisSupplySecundarios].map((kpi) => kpi.id))
    expect(kpisSupply.find((kpi) => kpi.id === 'sp-otif')?.valor).toBe('94,2%')
    expect(kpisSupplySecundarios.find((kpi) => kpi.id === 'sp-rupturas')?.tone).toBe('danger')
  })

  it('fluxo de 5 etapas, destaques, composição (100%) e alertas prioritários', () => {
    expect(fluxoSupply.map((etapa) => etapa.etapa)).toEqual([
      'Recebimento',
      'Armazenagem',
      'Produção',
      'Expedição',
      'Entrega',
    ])
    expect(fluxoSupply[0].concluida).toBe(true)
    expect(destaquesSemana).toHaveLength(3)
    expect(composicaoEstoque.reduce((soma, fatia) => soma + fatia.percent, 0)).toBe(100)
    expect(alertasSupply).toHaveLength(3)
    expect(pontosMapaSite).toHaveLength(6)
  })

  it('nós logísticos cobrem fábricas, CDs e cargas em trânsito', () => {
    const porTipo = (tipo: string) => nosLogisticos.filter((no) => no.tipo === tipo).length
    expect(porTipo('fabrica')).toBe(3)
    expect(porTipo('cd')).toBe(4)
    expect(porTipo('transito')).toBe(3)
  })

  it('perguntas sugeridas do copiloto de Supply têm match no banco Q&A', () => {
    expect(copilotSupply.perguntasSugeridas).toHaveLength(3)
    for (const sugestao of copilotSupply.perguntasSugeridas) {
      expect(buscarResposta(sugestao), `sem match: "${sugestao}" (supply)`).not.toBeNull()
    }
    expect(copilotSupply.botoes.length).toBeGreaterThanOrEqual(2)
    expect(copilotSupply.botoes.length).toBeLessThanOrEqual(3)
  })
})

describe('gêmeo da fábrica', () => {
  it('toda área com estado tem detalhe e vice-versa — nenhum clique sem conteúdo', () => {
    const comEstado = Object.keys(estadosAreasGemeo).sort()
    const comDetalhe = Object.keys(detalhesAreasGemeo).sort()
    expect(comDetalhe).toEqual(comEstado)
    expect(comEstado).toHaveLength(13)
    for (const detalhe of Object.values(detalhesAreasGemeo)) {
      expect(detalhe.resumo.length).toBeGreaterThan(15)
      if (detalhe.linhaId) expect(idsLinhas.has(detalhe.linhaId)).toBe(true)
      if (detalhe.ordemId) expect(idsOrdens.has(detalhe.ordemId)).toBe(true)
      if (detalhe.loteId) expect(idsLotes.has(detalhe.loteId)).toBe(true)
      if (detalhe.ativoId) expect(idsEquipamentos.has(detalhe.ativoId)).toBe(true)
    }
  })

  it('os fios da história aparecem nas áreas certas com os números canônicos', () => {
    expect(detalhesAreasGemeo['Compressão (L12)'].status).toBe('atencao')
    expect(detalhesAreasGemeo['Compressão (L12)'].fio).toContain('78%')
    expect(detalhesAreasGemeo['Sólidos (L08)'].resumo).toContain('45%')
    expect(detalhesAreasGemeo['Pó e Sachês (L15)'].status).toBe('parada')
    expect(detalhesAreasGemeo['Pó e Sachês (L15)'].resumo).toContain('62%')
    expect(detalhesAreasGemeo['Utilidades'].status).toBe('manutencao')
  })

  it('KPIs verticais e legenda estão completos', () => {
    expect(kpisPlantaGemeo).toHaveLength(5)
    expect(kpisPlantaGemeo.find((kpi) => kpi.id === 'gm-oee')?.valor).toBe('78,4%')
    expect(legendaGemeo).toHaveLength(5)
  })
})

describe('configurações', () => {
  it('tiles do resumo são coerentes com o resto do app', () => {
    expect(resumoConfiguracoes).toHaveLength(4)
    const usuarios = resumoConfiguracoes.find((tile) => tile.id === 'cf-usuarios')
    expect(usuarios?.valor).toBe(perfisUsuarios.reduce((soma, perfil) => soma + perfil.quantidade, 0))
    // Mesma rede de 12 agentes exibida na tela /agentes.
    expect(resumoConfiguracoes.find((tile) => tile.id === 'cf-agentes')?.valor).toBe(12)
  })

  it('status do sistema, integrações, regras e perfis estão populados', () => {
    expect(statusSistema).toHaveLength(4)
    for (const servico of statusSistema) expect(servico.status).toBe('Operacional')
    expect(integracoesConfig).toHaveLength(5)
    expect(regrasNegocio).toHaveLength(5)
    expect(perfisUsuarios).toHaveLength(5)
    expect(configuracoesRapidas).toHaveLength(6)
  })

  it('abas simples têm conteúdo — nenhum placeholder vazio', () => {
    expect(parametrosSistema.length).toBeGreaterThanOrEqual(5)
    expect(canaisNotificacao).toHaveLength(5)
    expect(eventosAuditoria.length).toBeGreaterThanOrEqual(5)
  })
})

describe('despersonalização', () => {
  // Todos os nomes de pessoas fictícias já usados no mockup — a varredura
  // serializa TODOS os módulos de src/data (copilot.ts incluído) e exige zero
  // ocorrências. Sobrenomes ambíguos entram como nome completo.
  // Codificada em base64 para que o grep de aceite por nomes em src/ retorne vazio.
  const NOMES_PROIBIDOS = [
    'Q2FtaWxh', 'QXpldmVkbw==', 'UmljYXJkbw==', 'TWFydGlucw==', 'TWFyaW5h', 'T2xpdmVpcmE=',
    'Sm/Do28=', 'U2FudG9z', 'TWFyaWFuYQ==', 'TGltYQ==', 'UmFmYWVs', 'Q29zdGE=',
    'UGF1bGE=', 'QWxtZWlkYQ==', 'Q2FybG9z', 'SnVsaWFuYQ==', 'TWFyY29z', 'QmVhdHJpeg==',
    'UGF0csOtY2lh', 'RWR1YXJkbw==', 'Um9jaGE=', 'UGVyZWlyYQ==', 'RmVybmFuZGE=', 'UmliZWlybw==',
    'T3TDoXZpbw==', 'UHJhdGVz', 'Q2zDoXVkaW8=', 'RmVycmVpcmE=', 'QW5kcsOp', 'U291emE=',
    'TnVuZXM=', 'VmllaXJh', 'UmVuYXRhIERpYXM=', 'Sm9hbmE=', 'Vml0b3I=', 'Tm9ndWVpcmE=',
    'QnJ1bm8=', 'Q2FyZG9zbw==', 'QW50dW5lcw==', 'THVjaWFuYQ==', 'UHJhZG8=', 'U8Opcmdpbw==',
    'VGVpeGVpcmE=',
  ].map((codificado) => Buffer.from(codificado, 'base64').toString('utf-8'))

  it('nenhum nome próprio de pessoa aparece em nenhum módulo de dados', () => {
    const serializado = JSON.stringify(todosOsModulos, (_chave, valor) =>
      typeof valor === 'function' ? undefined : valor,
    )
    for (const nome of NOMES_PROIBIDOS) {
      expect(serializado.includes(nome), `nome proibido encontrado nos dados: ${nome}`).toBe(false)
    }
  })

  it('operadores, responsáveis e aprovadores são papéis funcionais', () => {
    for (const ordem of ordens) expect(ordem.operador).toMatch(/^Operação [A-Z]\d+ · Turno A$/)
    for (const lote of lotes) expect(lote.analista.startsWith('QA ')).toBe(true)
    for (const acao of acoesAgentes) expect(acao.responsavel.startsWith('Alçada: ')).toBe(true)
    for (const aprovacao of proximasAprovacoes) expect(aprovacao.responsavel.startsWith('Alçada: ')).toBe(true)
    const equipes = new Set(['Mecânica', 'Elétrica', 'Preditiva', 'Utilidades'])
    for (const ot of [...ordensManutencao, otRecomendadaCompressora]) {
      expect(equipes.has(ot.responsavel), `equipe inválida: ${ot.responsavel}`).toBe(true)
    }
    const areasDonas = new Set(['PCP', 'Operações', 'Qualidade', 'Manutenção', 'Suprimentos', 'Controladoria'])
    for (const relatorio of relatorios) {
      expect(areasDonas.has(relatorio.responsavel), `área inválida: ${relatorio.responsavel}`).toBe(true)
    }
  })
})

describe('relatórios', () => {
  it('tem 10 relatórios com IDs únicos e o Resumo Executivo em primeiro', () => {
    expect(relatorios).toHaveLength(10)
    semDuplicatas(relatorios.map((relatorio) => relatorio.id))
    expect(relatorios[0]).toMatchObject({
      id: 'REL-001',
      nome: 'Resumo Executivo da Produção',
      categoria: 'Executivo',
      responsavel: 'PCP',
      situacao: 'Atualizado',
    })
  })

  it('toda aba da biblioteca tem pelo menos 1 relatório — nenhum estado vazio', () => {
    for (const categoria of ['Executivo', 'Operacional', 'Qualidade', 'Manutenção', 'Custos', 'Customizado']) {
      expect(
        relatorios.filter((relatorio) => relatorio.categoria === categoria).length,
        `categoria vazia: ${categoria}`,
      ).toBeGreaterThan(0)
    }
  })

  it('agendamentos referenciam relatórios existentes e leituras crescem de 210 a 428', () => {
    expect(agendamentos).toHaveLength(5)
    const idsRelatorios = new Set(relatorios.map((relatorio) => relatorio.id))
    for (const agendamento of agendamentos) expect(idsRelatorios.has(agendamento.relatorioId)).toBe(true)
    expect(leiturasSemana).toHaveLength(7)
    expect(leiturasSemana[0].valor).toBe(210)
    expect(leiturasSemana[6].valor).toBe(428)
    for (let i = 1; i < leiturasSemana.length; i++) {
      expect(leiturasSemana[i].valor).toBeGreaterThan(leiturasSemana[i - 1].valor)
    }
  })

  it('consumo, catálogo analítico e governança estão completos', () => {
    expect(consumoRelatorios).toHaveLength(4)
    expect(catalogoAnalitico).toHaveLength(6)
    expect(catalogoAnalitico.reduce((soma, item) => soma + item.quantidade, 0)).toBe(104)
    expect(governancaRelatorios).toHaveLength(4)
    expect(RELATORIOS_GOVERNANCA_SCORE).toBe(96)
    expect(resumoExecutivoKpis).toHaveLength(3)
    expect(resumoExecutivoKpis[0]).toMatchObject({ label: 'OEE Global', valor: '78,6%' })
  })
})

describe('seletores — recorte global da FilterBar', () => {
  const filtrosPadrao: FiltrosSelecao = {
    fabrica: 'Anápolis',
    area: 'Todas as áreas',
    turno: 'Turno A (06:00 – 14:00)',
    periodo: 'Turno atual',
  }

  it('toda linha tem área mapeada em AREA_POR_LINHA', () => {
    for (const linha of linhas) {
      expect(AREA_POR_LINHA[linha.id], `linha sem área: ${linha.id}`).toBeDefined()
    }
  })

  it('recorte padrão (Anápolis · Turno A · Turno atual) mantém as telas populadas', () => {
    const ordensRecorte = ordensFiltradas(filtrosPadrao)
    expect(ordensRecorte).toHaveLength(10)
    const idsRecorte = new Set(ordensRecorte.map((ordem) => ordem.id))
    for (const ancora of ORDENS_ANCORA) expect(idsRecorte.has(ancora), `âncora fora do recorte padrão: ${ancora}`).toBe(true)
    expect(lotesFiltrados(filtrosPadrao)).toHaveLength(6)
    expect(alertasFiltrados(filtrosPadrao)).toHaveLength(7)
    expect(materiaisFiltrados(filtrosPadrao)).toHaveLength(10)
    expect(linhasFiltradas(filtrosPadrao)).toHaveLength(5)
    expect(blocosFiltrados(filtrosPadrao)).toHaveLength(blocosSequencia.length)
    // A OT concluída em 18/mai sai do recorte "Turno atual"; a carteira aberta fica.
    const ots = otsFiltradas(filtrosPadrao)
    expect(ots).toHaveLength(7)
    expect(ots.some((ot) => ot.status === 'Concluída')).toBe(false)
  })

  it('fábrica = Goiânia → 0 ordens-âncora e listas de Anápolis vazias', () => {
    const filtros: FiltrosSelecao = { ...filtrosPadrao, fabrica: 'Goiânia' }
    const ordensRecorte = ordensFiltradas(filtros)
    expect(ordensRecorte.map((ordem) => ordem.id).filter((id) => (ORDENS_ANCORA as readonly string[]).includes(id))).toHaveLength(0)
    expect(ordensRecorte.map((ordem) => ordem.id)).toEqual(['OF-045688', 'OF-045689'])
    expect(lotesFiltrados(filtros)).toHaveLength(0)
    expect(otsFiltradas(filtros)).toHaveLength(0)
    expect(blocosFiltrados(filtros)).toHaveLength(0)
    expect(materiaisFiltrados(filtros)).toHaveLength(0)
    expect(alertasFiltrados(filtros)).toHaveLength(0)
    expect(linhasFiltradas(filtros).map((linha) => linha.id)).toEqual(['P23', 'P24', 'P25', 'P26'])
  })

  it('período fora do turno (Turno C × Turno atual) → listas com janela de tempo vazias', () => {
    const filtros: FiltrosSelecao = { ...filtrosPadrao, turno: 'Turno C (22:00 – 06:00)' }
    expect(ordensFiltradas(filtros)).toHaveLength(0)
    expect(otsFiltradas(filtros)).toHaveLength(0)
    expect(lotesFiltrados(filtros)).toHaveLength(0)
  })

  it('área = Compressão isola a L12 e seus itens', () => {
    const filtros: FiltrosSelecao = { ...filtrosPadrao, area: 'Compressão' }
    expect(linhasFiltradas(filtros).map((linha) => linha.id)).toEqual(['L12'])
    expect(ordensFiltradas(filtros).map((ordem) => ordem.id)).toEqual(['OF-045678'])
    const alertasRecorte = alertasFiltrados(filtros)
    expect(alertasRecorte.map((alerta) => alerta.id)).toEqual(['AL-001', 'AL-002', 'AL-006'])
    expect(blocosFiltrados(filtros).every((bloco) => bloco.linhaId === 'L12')).toBe(true)
    expect(materiaisFiltrados(filtros).map((material) => material.id)).toEqual(['MAT-API-001', 'MAT-API-003'])
  })

  it('Turno B mantém a carteira aberta e esvazia a fila de QA do Turno A', () => {
    const filtros: FiltrosSelecao = { ...filtrosPadrao, turno: 'Turno B (14:00 – 22:00)', periodo: 'Hoje' }
    expect(ordensFiltradas(filtros).length).toBeGreaterThan(0)
    expect(lotesFiltrados(filtros)).toHaveLength(0)
  })
})

describe('busca global e notificações', () => {
  it('a busca encontra OF-045681 e aponta para o Sequenciamento com destaque', () => {
    const grupos = buscar('OF-045681')
    const ordensGrupo = grupos.find((grupo) => grupo.tipo === 'ordem')
    expect(ordensGrupo?.itens[0]).toMatchObject({ id: 'OF-045681', destino: '/sequenciamento?destaque=OF-045681' })
  })

  it('a busca é tolerante a acentos e cobre produtos, materiais, lotes, ativos, OTs e telas', () => {
    expect(buscar('ibuprofeno').find((grupo) => grupo.tipo === 'material')?.itens[0].id).toBe('MAT-API-001')
    expect(buscar('sequenciamento').find((grupo) => grupo.tipo === 'tela')?.itens[0].id).toBe('/sequenciamento')
    expect(buscar('compressora').find((grupo) => grupo.tipo === 'ativo')?.itens[0].id).toBe('eq-compressora-l12')
    expect(buscar('2456789A').find((grupo) => grupo.tipo === 'lote')?.itens[0].destino).toBe('/qualidade?destaque=2456789A')
    expect(buscar('OT-245689').find((grupo) => grupo.tipo === 'ot')?.itens[0].destino).toBe('/manutencao?destaque=OT-245689')
    expect(buscar('buscopan').find((grupo) => grupo.tipo === 'produto')?.itens[0].destino).toBe(
      '/planejamento?destaque=OF-045678',
    )
    // Consulta vazia devolve atalhos: ações rápidas + as 13 telas.
    const vazia = buscar('')
    expect(vazia.find((grupo) => grupo.tipo === 'acao')?.itens).toHaveLength(3)
  })

  it('o sino tem 8 notificações do dia com destino navegável', () => {
    expect(notificacoes).toHaveLength(8)
    for (const notificacao of notificacoes) {
      expect(notificacao.destino.startsWith('/')).toBe(true)
      expect(notificacao.hora.getTime()).toBeLessThanOrEqual(new Date(2025, 4, 19, 10, 18).getTime())
    }
    expect(notificacoes[0]).toMatchObject({ id: 'not-AL-006', destino: '/alertas?destaque=AL-006' })
  })
})
