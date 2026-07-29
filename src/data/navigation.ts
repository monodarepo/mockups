import {
  AlertTriangle,
  Bot,
  Boxes,
  CalendarRange,
  Factory,
  FileBarChart,
  LayoutDashboard,
  ListOrdered,
  Package,
  Settings,
  ShieldCheck,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

export interface ItemNavegacao {
  path: string
  /** Rótulo do menu lateral e título da página. */
  label: string
  /** Subtítulo exibido no Header. */
  subtitulo: string
  icon: LucideIcon
  /** Prompt da série de construção que entrega a tela. */
  prompt: number
  /** Mostra o badge vermelho com store.pendencias. */
  badgePendencias?: boolean
}

/** Ordem canônica do menu lateral — definida no CLAUDE.md. */
export const navegacao: ItemNavegacao[] = [
  {
    path: '/',
    label: 'Visão Geral',
    subtitulo: 'Torre de controle da produção — Turno A, 19/mai/2025',
    icon: LayoutDashboard,
    prompt: 2,
  },
  {
    path: '/planejamento',
    label: 'Planejamento',
    subtitulo: 'Plano-mestre e capacidade da semana 20–26/mai/2025',
    icon: CalendarRange,
    prompt: 3,
  },
  {
    path: '/sequenciamento',
    label: 'Sequenciamento',
    subtitulo: 'Ordenação de ordens por linha, setup e limpeza',
    icon: ListOrdered,
    prompt: 4,
  },
  {
    path: '/execucao',
    label: 'Execução',
    subtitulo: 'Andamento das ordens em piso de fábrica',
    icon: Factory,
    prompt: 5,
  },
  {
    path: '/gemeo',
    label: 'Gêmeo da Fábrica',
    subtitulo: 'Simulação de cenários sobre a planta de Anápolis',
    icon: Boxes,
    prompt: 6,
  },
  {
    path: '/qualidade',
    label: 'Qualidade',
    subtitulo: 'Desvios, lotes em análise e liberação',
    icon: ShieldCheck,
    prompt: 7,
  },
  {
    path: '/manutencao',
    label: 'Manutenção',
    subtitulo: 'Saúde dos ativos e manutenção preditiva',
    icon: Wrench,
    prompt: 8,
  },
  {
    path: '/materiais',
    label: 'Materiais',
    subtitulo: 'Cobertura de insumos e prontidão de embalagem',
    icon: Package,
    prompt: 9,
  },
  {
    path: '/custos',
    label: 'Custos e Performance',
    subtitulo: 'OEE, custo por lote e perdas de produção',
    icon: TrendingUp,
    prompt: 10,
  },
  {
    path: '/alertas',
    label: 'Alertas e Decisões',
    subtitulo: 'Fila de decisões pendentes de aprovação',
    icon: AlertTriangle,
    prompt: 11,
    badgePendencias: true,
  },
  {
    path: '/relatorios',
    label: 'Relatórios',
    subtitulo: 'Relatórios operacionais e executivos',
    icon: FileBarChart,
    prompt: 12,
  },
  {
    path: '/agentes',
    label: 'Agentes IA',
    subtitulo: 'Agentes autônomos, escopo e histórico de atuação',
    icon: Bot,
    prompt: 13,
  },
  {
    path: '/configuracoes',
    label: 'Configurações',
    subtitulo: 'Personas, parâmetros do otimizador e integrações',
    icon: Settings,
    prompt: 14,
  },
]

export function itemPorRota(pathname: string): ItemNavegacao {
  return navegacao.find((item) => item.path === pathname) ?? navegacao[0]
}
