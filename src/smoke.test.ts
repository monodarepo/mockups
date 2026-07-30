/**
 * Smoke test: os módulos principais do app importam e expõem o esperado.
 * Pega erros de import, dados quebrados e regressões do store sem navegador.
 * Roda com `npm run check:smoke`.
 */
import { describe, expect, it } from 'vitest'

describe('smoke', () => {
  it('todas as 13 páginas (e o kit) importam e exportam um componente', async () => {
    const paginas = await Promise.all([
      import('@/features/visao-geral/VisaoGeralPage'),
      import('@/features/planejamento/PlanejamentoPage'),
      import('@/features/sequenciamento/SequenciamentoPage'),
      import('@/features/execucao/ExecucaoPage'),
      import('@/features/gemeo/GemeoPage'),
      import('@/features/qualidade/QualidadePage'),
      import('@/features/manutencao/ManutencaoPage'),
      import('@/features/materiais/MateriaisPage'),
      import('@/features/custos/CustosPage'),
      import('@/features/alertas/AlertasPage'),
      import('@/features/relatorios/RelatoriosPage'),
      import('@/features/agentes/AgentesPage'),
      import('@/features/configuracoes/ConfiguracoesPage'),
      import('@/features/kit/KitPage'),
    ])
    for (const modulo of paginas) {
      expect(Object.values(modulo).some((exportado) => typeof exportado === 'function')).toBe(true)
    }
  })

  it('shell e componentes compartilhados importam sem erro', async () => {
    const modulos = await Promise.all([
      import('@/components/layout/AppShell'),
      import('@/components/layout/Header'),
      import('@/components/layout/Sidebar'),
      import('@/components/shared/CopilotPanel'),
      import('@/components/shared/FactoryMap'),
      import('@/components/shared/SimuladorCenarios'),
    ])
    for (const modulo of modulos) {
      expect(Object.values(modulo).some((exportado) => typeof exportado === 'function')).toBe(true)
    }
  })

  it('store inicia na Visão PCP com 12 pendências e simulador fechado', async () => {
    const { useAppStore } = await import('@/store')
    const estado = useAppStore.getState()
    expect(estado.visao.id).toBe('pcp')
    expect(estado.visao.nome).toBe('Visão PCP')
    expect(estado.visoes).toHaveLength(4)
    expect(estado.pendencias).toBe(12)
    expect(estado.simuladorAberto).toBe(false)
    // O seletor troca a visão ativa.
    estado.setVisao('executiva')
    expect(useAppStore.getState().visao.nome).toBe('Visão Executiva')
    estado.setVisao('pcp')
  })
})
