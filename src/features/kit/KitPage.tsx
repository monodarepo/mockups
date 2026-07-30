import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageFooter } from '@/components/shared/PageFooter'
import { FilterBar } from '@/components/shared/FilterBar'
import { KpiRow } from '@/components/shared/KpiCard'
import { StatusPill } from '@/components/shared/StatusPill'
import { TrendDelta } from '@/components/shared/TrendDelta'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { ScoreDonut } from '@/components/shared/ScoreDonut'
import { MiniBarList, type MiniBarItem } from '@/components/shared/MiniBarList'
import { DataTable, IdLink, type ColunaDataTable } from '@/components/shared/DataTable'
import { SectionCard } from '@/components/shared/SectionCard'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { Modal } from '@/components/ui/Modal'
import { Drawer } from '@/components/ui/Drawer'
import { Badge } from '@/components/ui/Badge'
import { useAppStore } from '@/store'
import {
  agentes,
  alertas,
  conteudoCopilot,
  equipamentoPorId,
  kpisPorTela,
  linhas,
  lotePorId,
  lotes,
  materiais,
  materialPorId,
  ordens,
  ordensManutencao,
  produtoPorId,
  type Lote,
  type Material,
  type OrdemManutencao,
  type OrdemProducao,
} from '@/data'
import { formatData, formatDuracao, formatHora, formatMoedaCompacta, formatNumero, formatPercent } from '@/lib/format'

const colunasOrdens: ColunaDataTable<OrdemProducao>[] = [
  { id: 'id', titulo: 'Ordem', render: (o) => <IdLink id={o.id} />, valor: (o) => o.id },
  {
    id: 'produto',
    titulo: 'Produto',
    render: (o) => produtoPorId(o.produtoId)?.nome ?? o.produtoId,
    valor: (o) => produtoPorId(o.produtoId)?.nome ?? o.produtoId,
  },
  { id: 'linha', titulo: 'Linha', render: (o) => o.linhaId, valor: (o) => o.linhaId },
  {
    id: 'quantidade',
    titulo: 'Quantidade',
    alinhar: 'direita',
    render: (o) => `${formatNumero(o.quantidade)} ${o.unidade}`,
    valor: (o) => o.quantidade,
  },
  {
    id: 'inicio',
    titulo: 'Início',
    render: (o) => `${formatData(o.inicio)} ${formatHora(o.inicio)}`,
    valor: (o) => o.inicio,
  },
  {
    id: 'progresso',
    titulo: 'Progresso',
    largura: 'w-40',
    render: (o) => <ProgressBar valor={o.progresso} tone={o.situacao === 'Em risco' ? 'danger' : 'primary'} />,
    valor: (o) => o.progresso,
  },
  { id: 'situacao', titulo: 'Situação', render: (o) => <StatusPill status={o.situacao} /> },
]

const colunasLotes: ColunaDataTable<Lote>[] = [
  { id: 'id', titulo: 'Lote', render: (l) => <IdLink id={l.id} />, valor: (l) => l.id },
  {
    id: 'produto',
    titulo: 'Produto',
    render: (l) => produtoPorId(l.produtoId)?.nome ?? l.produtoId,
    valor: (l) => produtoPorId(l.produtoId)?.nome ?? l.produtoId,
  },
  { id: 'linha', titulo: 'Linha', render: (l) => l.linhaId, valor: (l) => l.linhaId },
  { id: 'prioridade', titulo: 'Prioridade', render: (l) => <StatusPill status={l.prioridade} /> },
  {
    id: 'espera',
    titulo: 'Na fila há',
    alinhar: 'direita',
    render: (l) => (l.esperaMinutos !== undefined ? formatDuracao(l.esperaMinutos) : '—'),
    valor: (l) => l.esperaMinutos ?? 0,
  },
  { id: 'analista', titulo: 'Analista', render: (l) => l.analista, valor: (l) => l.analista },
  { id: 'status', titulo: 'Status', render: (l) => <StatusPill status={l.status} /> },
]

const colunasMateriais: ColunaDataTable<Material>[] = [
  { id: 'id', titulo: 'Código', render: (m) => <IdLink id={m.id} />, valor: (m) => m.id },
  { id: 'nome', titulo: 'Material', render: (m) => m.nome, valor: (m) => m.nome },
  { id: 'categoria', titulo: 'Categoria', render: (m) => m.categoria, valor: (m) => m.categoria },
  {
    id: 'cobertura',
    titulo: 'Cobertura',
    alinhar: 'direita',
    render: (m) => `${formatNumero(m.coberturaDias, 1)} ${m.coberturaDias === 1 ? 'dia' : 'dias'}`,
    valor: (m) => m.coberturaDias,
  },
  { id: 'status', titulo: 'Status', render: (m) => <StatusPill status={m.status} /> },
  { id: 'acao', titulo: 'Próxima ação', render: (m) => m.proximaAcao },
]

const colunasOTs: ColunaDataTable<OrdemManutencao>[] = [
  { id: 'id', titulo: 'OT', render: (ot) => <IdLink id={ot.id} />, valor: (ot) => ot.id },
  {
    id: 'ativo',
    titulo: 'Ativo',
    render: (ot) => equipamentoPorId(ot.ativoId)?.nome ?? ot.ativoId,
    valor: (ot) => equipamentoPorId(ot.ativoId)?.nome ?? ot.ativoId,
  },
  { id: 'tipo', titulo: 'Tipo', render: (ot) => ot.tipo, valor: (ot) => ot.tipo },
  { id: 'prioridade', titulo: 'Prioridade', render: (ot) => <StatusPill status={ot.prioridade} /> },
  {
    id: 'janela',
    titulo: 'Janela',
    render: (ot) => `${formatData(ot.janelaInicio)} ${formatHora(ot.janelaInicio)} – ${formatHora(ot.janelaFim)}`,
    valor: (ot) => ot.janelaInicio,
  },
  { id: 'responsavel', titulo: 'Responsável', render: (ot) => ot.responsavel, valor: (ot) => ot.responsavel },
  { id: 'status', titulo: 'Status', render: (ot) => <StatusPill status={ot.status} /> },
]

/**
 * Galeria temporária de validação visual dos componentes compartilhados.
 * Rota /_kit — fora do menu lateral; todos os dados vêm de src/data.
 */
export function KitPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [abaAtiva, setAbaAtiva] = useState('lotes')
  const [modalAberto, setModalAberto] = useState(false)
  const [drawerAberto, setDrawerAberto] = useState(false)

  const impactoTotal = useMemo(() => alertas.reduce((soma, a) => soma + a.impactoEstimado, 0), [])
  const rankingAlertas: MiniBarItem[] = useMemo(
    () =>
      [...alertas]
        .sort((a, b) => b.impactoEstimado - a.impactoEstimado)
        .slice(0, 6)
        .map((alerta) => ({
          id: alerta.id,
          label: alerta.titulo,
          valor: formatMoedaCompacta(alerta.impactoEstimado),
          percent: (alerta.impactoEstimado / impactoTotal) * 100,
        })),
    [impactoTotal],
  )

  const slaMedioAgentes = useMemo(
    () => agentes.reduce((soma, a) => soma + a.slaPercent, 0) / agentes.length,
    [],
  )
  const linhasAnapolis = useMemo(() => linhas.filter((l) => l.fabricaId === 'anapolis'), [])
  const utilizacaoMedia = useMemo(
    () => linhasAnapolis.reduce((soma, l) => soma + l.capacidadeUtilizada, 0) / linhasAnapolis.length,
    [linhasAnapolis],
  )
  const aderenciaL08 = 45

  const loteDetalhe = lotePorId('2456789A')
  const materialDetalhe = materialPorId('MAT-API-001')

  const acionar = (rotulo: string) =>
    addToast({ titulo: rotulo, descricao: 'Ação de demonstração acionada na galeria.', tone: 'info' })

  return (
    <>
      <PageHeader
        titulo="Kit de componentes"
        descricao="Galeria temporária de validação visual — todos os componentes populados com dados de src/data"
        acoes={
          <>
            <Button variante="outline" tamanho="sm" onClick={() => setDrawerAberto(true)}>
              Abrir drawer
            </Button>
            <Button tamanho="sm" onClick={() => setModalAberto(true)}>
              Abrir modal
            </Button>
          </>
        }
      />

      <FilterBar />

      <KpiRow kpis={kpisPorTela['/']} />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 flex min-w-0 flex-col gap-5">
          <SectionCard
            titulo="Ordens da semana"
            info="DataTable genérica: ordenação por clique, IDs como link, StatusPill e scroll interno com header fixo."
            acao={{ onClick: () => acionar('Ver todas as ordens') }}
            corpoSemPadding
          >
            <DataTable
              rotulo="Ordens de produção da semana"
              colunas={colunasOrdens}
              linhas={ordens}
              chave={(o) => o.id}
              alturaMax={320}
              acao={{ rotulo: 'Abrir', onClick: (o) => acionar(`Abrir ${o.id}`) }}
              ordenacaoInicial={{ coluna: 'inicio', direcao: 'asc' }}
            />
          </SectionCard>

          <SectionCard
            titulo="Tabelas por contexto"
            info="Tabs primitivo alternando três DataTables com dados reais."
            corpoSemPadding
          >
            <div className="px-5">
              <Tabs
                abas={[
                  { id: 'lotes', rotulo: 'Fila de QA', badge: lotes.length },
                  { id: 'materiais', rotulo: 'Materiais', badge: materiais.length },
                  { id: 'ots', rotulo: 'OTs de manutenção', badge: ordensManutencao.length },
                ]}
                ativa={abaAtiva}
                onChange={setAbaAtiva}
              />
            </div>
            {abaAtiva === 'lotes' ? (
              <DataTable rotulo="Fila de liberação QA" colunas={colunasLotes} linhas={lotes} chave={(l) => l.id} />
            ) : null}
            {abaAtiva === 'materiais' ? (
              <DataTable rotulo="Materiais monitorados" colunas={colunasMateriais} linhas={materiais} chave={(m) => m.id} />
            ) : null}
            {abaAtiva === 'ots' ? (
              <DataTable rotulo="Ordens de manutenção" colunas={colunasOTs} linhas={ordensManutencao} chave={(ot) => ot.id} />
            ) : null}
          </SectionCard>

          <div className="grid grid-cols-2 gap-5">
            <SectionCard
              titulo="Alertas por impacto"
              info="MiniBarList: ranking 1–6 com barra proporcional, valor e participação à direita."
              acao={{ rotulo: 'Ver central', onClick: () => acionar('Ver central de alertas') }}
            >
              <MiniBarList itens={rankingAlertas} />
            </SectionCard>

            <SectionCard titulo="Scores" info="ScoreDonut com qualificador automático por faixa de valor.">
              <div className="flex flex-wrap items-start justify-around gap-4 pt-1">
                <ScoreDonut valor={slaMedioAgentes} rotulo="SLA dos agentes" />
                <ScoreDonut valor={utilizacaoMedia} rotulo="Utilização Anápolis" />
                <ScoreDonut valor={aderenciaL08} rotulo="Aderência L08" />
              </div>
            </SectionCard>
          </div>

          <SectionCard titulo="Pílulas, deltas e progresso" info="StatusPill, TrendDelta e ProgressBar lado a lado.">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {ordens.slice(0, 5).map((ordem) => (
                  <StatusPill key={ordem.id} status={ordem.situacao} pulsar={ordem.situacao === 'Em risco'} />
                ))}
                {materiais.slice(0, 2).map((material) => (
                  <StatusPill key={material.id} status={material.status} />
                ))}
                <StatusPill status={lotes[4].status} />
              </div>
              <div className="flex flex-wrap items-center gap-5">
                {kpisPorTela['/']
                  .filter((kpi) => kpi.delta)
                  .map((kpi) => (
                    <span key={kpi.id} className="flex items-center gap-1.5 text-body-sm text-muted">
                      {kpi.label}
                      <TrendDelta delta={kpi.delta as string} deltaGoodWhen={kpi.deltaGoodWhen} />
                    </span>
                  ))}
              </div>
              <div className="flex flex-col gap-2.5">
                {ordens
                  .filter((ordem) => ordem.status === 'Em execução')
                  .map((ordem) => (
                    <div key={ordem.id} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-body-sm font-medium text-ink">{ordem.id}</span>
                      <ProgressBar
                        valor={ordem.progresso}
                        tone={ordem.situacao === 'Em risco' ? 'danger' : ordem.situacao === 'Atenção' ? 'warning' : 'primary'}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard titulo="Toasts" info="Provider global com autodismiss em 4 s, canto inferior direito.">
            <div className="flex flex-wrap gap-2">
              <Button
                tamanho="sm"
                onClick={() => addToast({ titulo: 'Aprovado', descricao: 'Decisão registrada com sucesso.', tone: 'success' })}
              >
                Toast de sucesso
              </Button>
              <Button
                variante="danger"
                tamanho="sm"
                onClick={() => addToast({ titulo: 'Falha na sincronização', descricao: 'O SAP não respondeu. Tente novamente.', tone: 'danger' })}
              >
                Toast de erro
              </Button>
              <Button
                variante="outline"
                tamanho="sm"
                onClick={() => addToast({ titulo: 'Sincronização concluída', descricao: 'Dados do MES atualizados às 10:18.', tone: 'info' })}
              >
                Toast de info
              </Button>
            </div>
          </SectionCard>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <CopilotPanel conteudo={conteudoCopilot['/']} onAcao={acionar} />
        </div>
      </div>

      <Modal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        titulo={`Lote ${loteDetalhe?.id ?? ''} — parâmetros de qualidade`}
        descricao={`${produtoPorId(loteDetalhe?.produtoId ?? '')?.nome ?? ''} · linha ${loteDetalhe?.linhaId ?? ''} · analista ${loteDetalhe?.analista ?? ''}`}
        rodape={
          <>
            <Button variante="outline" tamanho="sm" onClick={() => setModalAberto(false)}>
              Fechar
            </Button>
            <Button
              tamanho="sm"
              onClick={() => {
                setModalAberto(false)
                addToast({ titulo: 'Aprovado', descricao: `Lote ${loteDetalhe?.id} priorizado para liberação.`, tone: 'success' })
              }}
            >
              Priorizar lote
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          {loteDetalhe?.parametros?.map((parametro) => (
            <div key={parametro.nome} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2">
              <span className="text-body-sm text-muted">{parametro.nome}</span>
              <span className="flex items-center gap-3">
                <span className="text-body-sm font-semibold text-ink">{parametro.valor}</span>
                <span className="text-caption text-muted">{parametro.faixa}</span>
                <StatusPill status={parametro.situacao} tone="success" />
              </span>
            </div>
          ))}
          <p className="mt-2 text-caption font-semibold uppercase tracking-[0.06em] text-muted">Documentação</p>
          <div className="flex flex-wrap gap-2">
            {loteDetalhe?.documentos?.map((documento) => (
              <Badge key={documento.nome} tone={documento.status === 'Recebido' ? 'success' : 'warning'}>
                {documento.nome}: {documento.status}
              </Badge>
            ))}
          </div>
        </div>
      </Modal>

      <Drawer
        aberto={drawerAberto}
        onFechar={() => setDrawerAberto(false)}
        titulo={materialDetalhe?.nome ?? ''}
        descricao={`${materialDetalhe?.id ?? ''} · ${materialDetalhe?.categoria ?? ''} · fornecedor ${materialDetalhe?.fornecedor ?? ''}`}
        rodape={
          <>
            <Button variante="outline" tamanho="sm" onClick={() => setDrawerAberto(false)}>
              Fechar
            </Button>
            <Button
              tamanho="sm"
              onClick={() => {
                setDrawerAberto(false)
                addToast({ titulo: 'Transferência priorizada', descricao: 'Solicitação enviada ao planejamento de Goiânia.', tone: 'success' })
              }}
            >
              Priorizar transferência
            </Button>
          </>
        }
      >
        {materialDetalhe ? (
          <dl className="flex flex-col gap-2.5 text-body-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Status</dt>
              <dd>
                <StatusPill status={materialDetalhe.status} pulsar />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Estoque atual</dt>
              <dd className="font-semibold text-ink">
                {formatNumero(materialDetalhe.estoque)} {materialDetalhe.unidade}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Cobertura</dt>
              <dd className="font-semibold text-danger">{formatNumero(materialDetalhe.coberturaDias, 1)} dia</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Consumo diário</dt>
              <dd className="font-semibold text-ink">
                {formatNumero(materialDetalhe.consumoDia ?? 0)} {materialDetalhe.unidade}/dia{' '}
                {materialDetalhe.variacaoConsumoPercent ? (
                  <TrendDelta delta={`+${formatNumero(materialDetalhe.variacaoConsumoPercent)}%`} deltaGoodWhen="down" />
                ) : null}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Estoque de segurança</dt>
              <dd className="font-semibold text-ink">
                {formatNumero(materialDetalhe.estoqueSeguranca ?? 0)} {materialDetalhe.unidade}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Lead time</dt>
              <dd className="font-semibold text-ink">{formatNumero(materialDetalhe.leadTimeDias)} dias</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Lote atual</dt>
              <dd className="font-semibold text-ink">{materialDetalhe.loteAtual}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Validade</dt>
              <dd className="font-semibold text-ink">
                {materialDetalhe.validadeLote ? formatData(materialDetalhe.validadeLote) : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">CoA</dt>
              <dd>
                <Badge tone={materialDetalhe.coa === 'Recebido' ? 'success' : 'warning'}>{materialDetalhe.coa}</Badge>
              </dd>
            </div>
            <div className="mt-2 rounded-lg bg-warning-soft px-3 py-2.5 text-body-sm text-warning-strong">
              Próxima ação: {materialDetalhe.proximaAcao}. Cobertura equivale a{' '}
              {formatPercent((materialDetalhe.estoque / (materialDetalhe.estoqueSeguranca ?? 1)) * 100, 0)} do estoque de
              segurança.
            </div>
          </dl>
        ) : null}
      </Drawer>

      <PageFooter />
    </>
  )
}
