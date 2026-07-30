/**
 * Integridade referencial dos mocks: todo ID citado em um módulo precisa
 * existir no módulo dono. Roda com `npm run check:data`.
 */
import { describe, expect, it } from 'vitest'
import { fabricas, linhas } from './fabricas'
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
import { materiais } from './materiais'
import { lotes } from './lotes'
import { equipamentos } from './equipamentos'
import { ordensManutencao } from './manutencao'
import {
  alertas,
  fluxoDecisao,
  matrizPrioridadeUrgencia,
  prontidaoDecisao,
  proximasAprovacoes,
  topRiscosCategorias,
} from './alertas'
import { acoesAgentes, agentes } from './agentes'
import { MELHOR_CENARIO_ID, cenarios, eventosSimulaveis } from './cenarios'
import { relatorios } from './relatorios'
import { FONTES_COPILOT, bancoQA, conteudoCopilot } from './copilot'
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
  it('tem 3 fábricas e 13 linhas com IDs únicos', () => {
    expect(fabricas).toHaveLength(3)
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
      operador: 'João Santos',
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
  it('tem 9 agentes e 4 ações pendentes referenciando agentes existentes', () => {
    expect(agentes).toHaveLength(9)
    expect(acoesAgentes).toHaveLength(4)
    for (const acao of acoesAgentes) expect(idsAgentes.has(acao.agenteId)).toBe(true)
  })

  it('inclui a ação obrigatória de antecipar a compra de Ibuprofeno API', () => {
    const acao = acoesAgentes.find((item) => item.titulo.includes('Antecipar compra de Ibuprofeno API'))
    expect(acao).toBeDefined()
    expect(acao?.status).toBe('Pendente')
    expect(acao?.impacto).toContain('R$ 780 mil')
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
      expect(conteudo.saudacao).toContain('{nome}')
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

describe('relatórios', () => {
  it('tem 8 relatórios com IDs únicos', () => {
    expect(relatorios).toHaveLength(8)
    semDuplicatas(relatorios.map((relatorio) => relatorio.id))
  })
})
