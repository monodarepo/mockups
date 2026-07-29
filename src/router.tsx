import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { VisaoGeralPage } from '@/features/visao-geral/VisaoGeralPage'
import { PlanejamentoPage } from '@/features/planejamento/PlanejamentoPage'
import { SequenciamentoPage } from '@/features/sequenciamento/SequenciamentoPage'
import { ExecucaoPage } from '@/features/execucao/ExecucaoPage'
import { GemeoPage } from '@/features/gemeo/GemeoPage'
import { QualidadePage } from '@/features/qualidade/QualidadePage'
import { ManutencaoPage } from '@/features/manutencao/ManutencaoPage'
import { MateriaisPage } from '@/features/materiais/MateriaisPage'
import { CustosPage } from '@/features/custos/CustosPage'
import { AlertasPage } from '@/features/alertas/AlertasPage'
import { RelatoriosPage } from '@/features/relatorios/RelatoriosPage'
import { AgentesPage } from '@/features/agentes/AgentesPage'
import { ConfiguracoesPage } from '@/features/configuracoes/ConfiguracoesPage'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <VisaoGeralPage /> },
        { path: 'planejamento', element: <PlanejamentoPage /> },
        { path: 'sequenciamento', element: <SequenciamentoPage /> },
        { path: 'execucao', element: <ExecucaoPage /> },
        { path: 'gemeo', element: <GemeoPage /> },
        { path: 'qualidade', element: <QualidadePage /> },
        { path: 'manutencao', element: <ManutencaoPage /> },
        { path: 'materiais', element: <MateriaisPage /> },
        { path: 'custos', element: <CustosPage /> },
        { path: 'alertas', element: <AlertasPage /> },
        { path: 'relatorios', element: <RelatoriosPage /> },
        { path: 'agentes', element: <AgentesPage /> },
        { path: 'configuracoes', element: <ConfiguracoesPage /> },
      ],
    },
  ],
  {
    // Silencia os avisos de migração do React Router v7 — o console fica limpo.
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
)
