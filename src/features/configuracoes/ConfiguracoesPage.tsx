import { useMemo, useState } from 'react'
import {
  Bell,
  CheckCircle2,
  Database,
  FileClock,
  Gauge,
  LayoutDashboard,
  Plus,
  Settings2,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageFooter } from '@/components/shared/PageFooter'
import { SectionCard } from '@/components/shared/SectionCard'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { StatusPill } from '@/components/shared/StatusPill'
import { DataTable, type ColunaDataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { formatDataHora, formatNumero } from '@/lib/format'
import { useAppStore } from '@/store'
import {
  ULTIMA_VERIFICACAO_SISTEMA,
  agentes,
  ambiente,
  canaisNotificacao,
  configuracoesRapidas,
  conteudoCopilot,
  eventosAuditoria,
  integracoesConfig,
  parametrosSistema,
  perfisUsuarios,
  regrasNegocio,
  resumoConfiguracoes,
  statusSistema,
  type AgenteIA,
  type CanalNotificacao,
  type EventoAuditoria,
  type IntegracaoConfig,
  type PerfilUsuarios,
  type RegraNegocio,
} from '@/data'

const ABAS = [
  { id: 'visao-geral', rotulo: 'Visão Geral' },
  { id: 'sistema', rotulo: 'Sistema' },
  { id: 'integracoes', rotulo: 'Integrações' },
  { id: 'ia', rotulo: 'IA & Agentes' },
  { id: 'regras', rotulo: 'Regras de Negócio' },
  { id: 'usuarios', rotulo: 'Usuários & Permissões' },
  { id: 'notificacoes', rotulo: 'Notificações' },
  { id: 'auditoria', rotulo: 'Auditoria' },
]

const ICONES_RAPIDAS = {
  'cr-parametros': Settings2,
  'cr-dashboards': LayoutDashboard,
  'cr-kpis': Gauge,
  'cr-alertas': Bell,
  'cr-backup': Database,
  'cr-logs': FileClock,
} as const

/** Lista compacta com ação "Gerenciar" — blocos da aba Visão Geral. */
function BlocoLista({
  titulo,
  acaoRotulo,
  onAcao,
  children,
}: {
  titulo: string
  acaoRotulo: string
  onAcao: () => void
  children: React.ReactNode
}) {
  return (
    <SectionCard titulo={titulo} acao={{ rotulo: acaoRotulo, onClick: onAcao }}>
      {children}
    </SectionCard>
  )
}

export function ConfiguracoesPage() {
  const addToast = useAppStore((s) => s.addToast)

  const [aba, setAba] = useState('visao-geral')

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Revisar autonomia') setAba('ia')
    else if (rotulo === 'Testar integração SAP') {
      addToast({ titulo: 'Integração SAP testada', descricao: 'Round-trip de 240 ms — resposta OK às 10:18.', tone: 'success' })
    }
  }

  const colunasIntegracoes: ColunaDataTable<IntegracaoConfig>[] = useMemo(
    () => [
      { id: 'nome', titulo: 'Sistema', render: (i) => <span className="font-medium text-ink">{i.nome}</span>, valor: (i) => i.nome },
      { id: 'detalhe', titulo: 'Escopo', render: (i) => <span className="text-muted">{i.detalhe}</span>, valor: (i) => i.detalhe },
      { id: 'sync', titulo: 'Última sincronização', alinhar: 'direita', render: (i) => <span className="tabular-nums">{i.ultimaSincronizacao}</span>, valor: (i) => i.ultimaSincronizacao },
      { id: 'latencia', titulo: 'Latência', alinhar: 'direita', render: (i) => `${formatNumero(i.latenciaMs)} ms`, valor: (i) => i.latenciaMs },
      { id: 'status', titulo: 'Status', render: (i) => <StatusPill status={i.status} tone="success" />, valor: (i) => i.status },
    ],
    [],
  )

  const colunasAgentes: ColunaDataTable<AgenteIA>[] = useMemo(
    () => [
      { id: 'nome', titulo: 'Agente', render: (a) => <span className="font-medium text-ink">{a.nome}</span>, valor: (a) => a.nome },
      { id: 'dominio', titulo: 'Domínio', render: (a) => <span className="text-muted">{a.dominio}</span>, valor: (a) => a.dominio },
      { id: 'autonomia', titulo: 'Autonomia', render: (a) => <Badge tone="info">{a.autonomia}</Badge>, valor: (a) => a.autonomia },
      { id: 'sla', titulo: 'SLA', alinhar: 'direita', render: (a) => `${formatNumero(a.slaPercent, 1)}%`, valor: (a) => a.slaPercent },
      { id: 'status', titulo: 'Status', render: (a) => <StatusPill status={a.status} tone={a.status === 'Ativo' ? 'success' : a.status === 'Em treinamento' ? 'info' : 'warning'} />, valor: (a) => a.status },
    ],
    [],
  )

  const colunasRegras: ColunaDataTable<RegraNegocio>[] = useMemo(
    () => [
      { id: 'nome', titulo: 'Regra', render: (r) => <span className="font-medium text-ink">{r.nome}</span>, valor: (r) => r.nome },
      { id: 'criticidade', titulo: 'Criticidade', render: (r) => <StatusPill status={r.criticidade} />, valor: (r) => r.criticidade },
      { id: 'execucao', titulo: 'Última execução', alinhar: 'direita', render: (r) => <span className="tabular-nums">{r.ultimaExecucao}</span>, valor: (r) => r.ultimaExecucao },
      { id: 'status', titulo: 'Status', render: (r) => <StatusPill status={r.status} tone="success" />, valor: (r) => r.status },
    ],
    [],
  )

  const colunasPerfis: ColunaDataTable<PerfilUsuarios>[] = useMemo(
    () => [
      { id: 'perfil', titulo: 'Perfil', render: (p) => <span className="font-medium text-ink">{p.perfil}</span>, valor: (p) => p.perfil },
      { id: 'quantidade', titulo: 'Usuários', alinhar: 'direita', render: (p) => formatNumero(p.quantidade), valor: (p) => p.quantidade },
      { id: 'permissao', titulo: 'Permissões', render: (p) => <span className="text-muted">{p.permissao}</span>, valor: (p) => p.permissao },
    ],
    [],
  )

  const colunasNotificacoes: ColunaDataTable<CanalNotificacao>[] = useMemo(
    () => [
      { id: 'canal', titulo: 'Canal', render: (n) => <span className="font-medium text-ink">{n.canal}</span>, valor: (n) => n.canal },
      { id: 'evento', titulo: 'Evento', render: (n) => <span className="text-muted">{n.evento}</span>, valor: (n) => n.evento },
      { id: 'destinatarios', titulo: 'Destinatários', render: (n) => n.destinatarios, valor: (n) => n.destinatarios },
      { id: 'status', titulo: 'Status', render: (n) => <StatusPill status={n.status} tone={n.status === 'Ativo' ? 'success' : 'neutral'} />, valor: (n) => n.status },
    ],
    [],
  )

  const colunasAuditoria: ColunaDataTable<EventoAuditoria>[] = useMemo(
    () => [
      { id: 'quando', titulo: 'Quando', render: (e) => <span className="tabular-nums text-muted">{e.quando}</span>, valor: (e) => e.quando },
      { id: 'usuario', titulo: 'Usuário', render: (e) => <span className="font-medium text-ink">{e.usuario}</span>, valor: (e) => e.usuario },
      { id: 'acao', titulo: 'Ação', render: (e) => e.acao, valor: (e) => e.acao },
      { id: 'origem', titulo: 'Origem', render: (e) => <Badge tone="neutral">{e.origem}</Badge>, valor: (e) => e.origem },
    ],
    [],
  )

  const gerenciar = (destino: string) => () => setAba(destino)

  return (
    <>
      <PageHeader
        titulo="Configurações"
        descricao="Gerencie parâmetros do sistema, integrações, IA e permissões."
        acoes={
          <Button
            tamanho="sm"
            onClick={() => addToast({ titulo: 'Nova configuração', descricao: 'Assistente de criação disponível na demo completa.', tone: 'info' })}
          >
            <Plus size={14} aria-hidden="true" />
            Nova Configuração
          </Button>
        }
      />

      <div className="-mt-1">
        <Tabs abas={ABAS} ativa={aba} onChange={setAba} />
      </div>

      {aba === 'visao-geral' ? (
        <>
          <div className="grid grid-cols-4 gap-4">
            {resumoConfiguracoes.map((tile) => (
              <div key={tile.id} className="rounded-card border border-line bg-card px-4 py-3.5 shadow-card">
                <p className="text-kpi font-bold leading-9 tabular-nums text-ink">{formatNumero(tile.valor)}</p>
                <p className="text-body-sm font-medium text-ink">{tile.rotulo}</p>
                <p className="text-caption text-muted">{tile.sublabel}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 items-start gap-5">
            <div className="col-span-2 flex min-w-0 flex-col gap-5">
              <div className="grid grid-cols-2 items-start gap-5">
                <SectionCard titulo="Status do Sistema" info="Saúde dos serviços da plataforma.">
                  <ul className="flex flex-col gap-3">
                    {statusSistema.map((servico) => (
                      <li key={servico.servico} className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <CheckCircle2 size={15} className="shrink-0 text-success" aria-hidden="true" />
                          <span className="min-w-0 leading-tight">
                            <span className="block truncate text-body-sm text-ink" title={servico.servico}>
                              {servico.servico}
                            </span>
                            <span className="block truncate text-caption text-muted" title={servico.detalhe}>
                              {servico.detalhe}
                            </span>
                          </span>
                        </span>
                        <StatusPill status={servico.status} tone="success" />
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 border-t border-line pt-2.5 text-caption text-muted">
                    Última verificação: {formatDataHora(ULTIMA_VERIFICACAO_SISTEMA)}
                  </p>
                </SectionCard>

                <SectionCard
                  titulo="Ambiente"
                  acao={{
                    rotulo: 'Histórico de releases',
                    onClick: () => addToast({ titulo: 'Histórico de releases', descricao: 'Disponível na demo completa.', tone: 'info' }),
                  }}
                >
                  <dl className="flex flex-col gap-2.5 text-body-sm">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted">Ambiente Atual</dt>
                      <dd>
                        <Badge tone="success">{ambiente.atual}</Badge>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted">Versão</dt>
                      <dd className="font-semibold tabular-nums text-ink">{ambiente.versao}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted">Região</dt>
                      <dd className="font-semibold text-ink">{ambiente.regiao}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted">Último Deploy</dt>
                      <dd className="font-semibold tabular-nums text-ink">{formatDataHora(ambiente.ultimoDeploy)}</dd>
                    </div>
                  </dl>
                </SectionCard>

                <BlocoLista titulo="Integrações" acaoRotulo="Gerenciar integrações" onAcao={gerenciar('integracoes')}>
                  <ul className="flex flex-col gap-2.5">
                    {integracoesConfig.map((integracao) => (
                      <li key={integracao.id} className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-body-sm text-ink" title={integracao.nome}>
                          {integracao.nome}
                        </span>
                        <StatusPill status={integracao.status} tone="success" />
                      </li>
                    ))}
                  </ul>
                </BlocoLista>

                <BlocoLista titulo="IA & Agentes" acaoRotulo="Gerenciar agentes" onAcao={gerenciar('ia')}>
                  <ul className="flex flex-col gap-2.5">
                    {agentes.slice(0, 5).map((agente) => (
                      <li key={agente.id} className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-body-sm text-ink" title={agente.nome}>
                          {agente.nome}
                        </span>
                        <StatusPill
                          status={agente.status}
                          tone={agente.status === 'Ativo' ? 'success' : agente.status === 'Em treinamento' ? 'info' : 'warning'}
                        />
                      </li>
                    ))}
                  </ul>
                </BlocoLista>

                <BlocoLista titulo="Regras de Negócio" acaoRotulo="Gerenciar regras" onAcao={gerenciar('regras')}>
                  <ul className="flex flex-col gap-2.5">
                    {regrasNegocio.map((regra) => (
                      <li key={regra.id} className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-body-sm text-ink" title={regra.nome}>
                          {regra.nome}
                        </span>
                        <StatusPill status={regra.criticidade} />
                      </li>
                    ))}
                  </ul>
                </BlocoLista>

                <BlocoLista titulo="Usuários & Permissões" acaoRotulo="Gerenciar usuários" onAcao={gerenciar('usuarios')}>
                  <ul className="flex flex-col gap-2.5">
                    {perfisUsuarios.map((perfil) => (
                      <li key={perfil.perfil} className="flex items-center justify-between gap-2 text-body-sm">
                        <span className="text-ink">{perfil.perfil}</span>
                        <span className="font-semibold tabular-nums text-ink">{formatNumero(perfil.quantidade)}</span>
                      </li>
                    ))}
                  </ul>
                </BlocoLista>
              </div>

              <SectionCard titulo="Configurações Rápidas" info="Atalhos para os ajustes mais frequentes.">
                <div className="grid grid-cols-3 gap-3">
                  {configuracoesRapidas.map((config) => {
                    const Icone = ICONES_RAPIDAS[config.id as keyof typeof ICONES_RAPIDAS] ?? Settings2
                    return (
                      <button
                        key={config.id}
                        type="button"
                        onClick={() => addToast({ titulo: config.titulo, descricao: 'Disponível na demo completa.', tone: 'info' })}
                        className="flex flex-col gap-1.5 rounded-xl border border-line bg-app/40 px-3.5 py-3 text-left transition-shadow duration-150 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                          <Icone size={16} aria-hidden="true" />
                        </span>
                        <span className="text-body-sm font-semibold text-ink">{config.titulo}</span>
                        <span className="line-clamp-2 text-caption leading-snug text-muted">{config.descricao}</span>
                      </button>
                    )
                  })}
                </div>
              </SectionCard>
            </div>

            <CopilotPanel conteudo={conteudoCopilot['/configuracoes']} onAcao={aoAcaoCopilot} />
          </div>
        </>
      ) : null}

      {aba === 'sistema' ? (
        <SectionCard titulo="Parâmetros do Sistema" info="Parâmetros globais da plataforma." corpoSemPadding>
          <dl className="divide-y divide-line">
            {parametrosSistema.map((parametro) => (
              <div key={parametro.parametro} className="flex items-center justify-between gap-4 px-5 py-3 text-body-sm">
                <dt className="text-muted">{parametro.parametro}</dt>
                <dd className="text-right font-semibold text-ink">{parametro.valor}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>
      ) : null}

      {aba === 'integracoes' ? (
        <SectionCard titulo={`Integrações (${integracoesConfig.length})`} info="Sistemas conectados à plataforma." corpoSemPadding>
          <DataTable rotulo="Integrações ativas" colunas={colunasIntegracoes} linhas={integracoesConfig} chave={(i) => i.id} />
        </SectionCard>
      ) : null}

      {aba === 'ia' ? (
        <SectionCard titulo={`IA & Agentes (${agentes.length})`} info="Agentes de Anápolis com nível de autonomia e SLA." corpoSemPadding>
          <DataTable rotulo="Agentes de IA configurados" colunas={colunasAgentes} linhas={agentes} chave={(a) => a.id} />
        </SectionCard>
      ) : null}

      {aba === 'regras' ? (
        <SectionCard titulo={`Regras de Negócio (${regrasNegocio.length} de 32)`} info="Regras principais — 32 ativas na rede." corpoSemPadding>
          <DataTable rotulo="Regras de negócio ativas" colunas={colunasRegras} linhas={regrasNegocio} chave={(r) => r.id} />
        </SectionCard>
      ) : null}

      {aba === 'usuarios' ? (
        <SectionCard titulo="Usuários & Permissões (128)" info="Perfis de acesso e contagem de usuários." corpoSemPadding>
          <DataTable rotulo="Perfis de usuários" colunas={colunasPerfis} linhas={perfisUsuarios} chave={(p) => p.perfil} />
        </SectionCard>
      ) : null}

      {aba === 'notificacoes' ? (
        <SectionCard titulo={`Notificações (${canaisNotificacao.length})`} info="Canais e eventos que disparam avisos." corpoSemPadding>
          <DataTable rotulo="Canais de notificação" colunas={colunasNotificacoes} linhas={canaisNotificacao} chave={(n) => n.id} />
        </SectionCard>
      ) : null}

      {aba === 'auditoria' ? (
        <SectionCard titulo={`Auditoria (${eventosAuditoria.length})`} info="Trilha de auditoria — eventos mais recentes." corpoSemPadding>
          <DataTable rotulo="Trilha de auditoria" colunas={colunasAuditoria} linhas={eventosAuditoria} chave={(e) => e.id} />
        </SectionCard>
      ) : null}

      <PageFooter />
    </>
  )
}
