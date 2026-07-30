import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarClock, Download, Eye, FileSpreadsheet, FileText, Plus, RefreshCw, Search, Send } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'
import { DOT_HOVER, EIXO, GRID, TooltipHpo } from '@/components/charts'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageFooter } from '@/components/shared/PageFooter'
import { KpiRow } from '@/components/shared/KpiCard'
import { SectionCard } from '@/components/shared/SectionCard'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { StatusPill } from '@/components/shared/StatusPill'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { ScoreDonut } from '@/components/shared/ScoreDonut'
import { TrendDelta } from '@/components/shared/TrendDelta'
import { DataTable, type ColunaDataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Tabs } from '@/components/ui/Tabs'
import { Tooltip } from '@/components/ui/Tooltip'
import { colors } from '@/lib/colors'
import { formatDiaMes, formatHora, formatNumero } from '@/lib/format'
import { useAppStore } from '@/store'
import {
  ATUALIZADO_EM,
  RELATORIOS_GOVERNANCA_SCORE,
  agendamentos,
  catalogoAnalitico,
  consumoRelatorios,
  conteudoCopilot,
  governancaRelatorios,
  kpisPorTela,
  leiturasSemana,
  producaoVsPlano,
  relatorios,
  resumoExecutivoKpis,
  visoes,
  type AgendamentoRelatorio,
  type CategoriaRelatorio,
  type Relatorio,
} from '@/data'

/** Áreas donas de relatório — mesmas responsáveis da biblioteca base. */
const AREAS_RESPONSAVEIS = ['PCP', 'Operações', 'Qualidade', 'Manutenção', 'Suprimentos', 'Controladoria']

const CATEGORIAS_FORM: CategoriaRelatorio[] = ['Executivo', 'Operacional', 'Qualidade', 'Manutenção', 'Custos', 'Customizado']

/** Janelas de envio determinísticas do formulário de agendamento. */
const JANELAS_ENVIO: Array<{ rotulo: string; data: Date }> = [
  { rotulo: 'Hoje 18:00', data: new Date(2025, 4, 19, 18, 0) },
  { rotulo: 'Amanhã 07:00', data: new Date(2025, 4, 20, 7, 0) },
  { rotulo: 'Sexta 17:00', data: new Date(2025, 4, 23, 17, 0) },
  { rotulo: 'Segunda 06:30', data: new Date(2025, 4, 26, 6, 30) },
]

const ABAS_CATEGORIA = [
  { id: 'Todos', rotulo: 'Todos' },
  { id: 'Executivo', rotulo: 'Executivo' },
  { id: 'Operacional', rotulo: 'Operacional' },
  { id: 'Qualidade', rotulo: 'Qualidade' },
  { id: 'Manutenção', rotulo: 'Manutenção' },
  { id: 'Custos', rotulo: 'Custos' },
  { id: 'Customizado', rotulo: 'Customizados' },
]

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function BadgeFormato({ formato }: { formato: Relatorio['formato'] }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-line bg-app px-1.5 py-0.5 text-[11px] font-semibold text-muted">
      {formato === 'PDF' ? (
        <FileText size={11} aria-hidden="true" />
      ) : (
        <FileSpreadsheet size={11} aria-hidden="true" />
      )}
      {formato}
    </span>
  )
}

export function RelatoriosPage() {
  const addToast = useAppStore((s) => s.addToast)
  const relatoriosCriados = useAppStore((s) => s.relatoriosCriados)
  const criarRelatorio = useAppStore((s) => s.criarRelatorio)
  const agendamentosCriados = useAppStore((s) => s.agendamentosCriados)
  const agendarEnvio = useAppStore((s) => s.agendarEnvio)
  const relatoriosAtualizados = useAppStore((s) => s.relatoriosAtualizados)
  const marcarRelatorioAtualizado = useAppStore((s) => s.marcarRelatorioAtualizado)

  const [abaCategoria, setAbaCategoria] = useState('Todos')
  const [busca, setBusca] = useState('')
  const [modalResumo, setModalResumo] = useState(false)
  /** Geração em andamento: relatório + progresso (~2 s até 100). */
  const [geracao, setGeracao] = useState<{ relatorio: Relatorio; progresso: number } | null>(null)
  const [modalEnvio, setModalEnvio] = useState<Relatorio | null>(null)
  const [visoesEnvio, setVisoesEnvio] = useState<string[]>(['executiva'])
  const [modalCriar, setModalCriar] = useState(false)
  const [formCriar, setFormCriar] = useState({ nome: '', categoria: 'Operacional' as CategoriaRelatorio, formato: 'PDF' as Relatorio['formato'], responsavel: 'PCP' })
  const [modalAgendar, setModalAgendar] = useState(false)
  const [formAgendar, setFormAgendar] = useState({ relatorioId: 'REL-001', visaoId: 'executiva', canal: 'E-mail' as AgendamentoRelatorio['canal'], janela: 0 })
  const timerRef = useRef<number | null>(null)
  const bibliotecaRef = useRef<HTMLDivElement | null>(null)
  const [parametrosBusca, setParametrosBusca] = useSearchParams()

  // Biblioteca combinada: dados base + relatórios criados na sessão.
  const todosRelatorios = useMemo(() => [...relatorios, ...relatoriosCriados], [relatoriosCriados])
  const todosAgendamentos = useMemo(() => [...agendamentos, ...agendamentosCriados], [agendamentosCriados])

  /** Situação viva: "Gerar agora" promove o relatório a Atualizado (10:18). */
  const situacaoDe = (relatorio: Relatorio) =>
    relatoriosAtualizados.includes(relatorio.id) ? 'Atualizado' : relatorio.situacao
  const geracaoDe = (relatorio: Relatorio) =>
    relatoriosAtualizados.includes(relatorio.id) ? ATUALIZADO_EM : relatorio.ultimaGeracao

  const gerarAgora = (relatorio: Relatorio) => {
    if (geracao) return
    setGeracao({ relatorio, progresso: 6 })
  }

  // ?acao=gerar-resumo (ação rápida da busca global) dispara o fluxo real.
  useEffect(() => {
    if (parametrosBusca.get('acao') !== 'gerar-resumo') return
    setGeracao((atual) => atual ?? { relatorio: relatorios[0], progresso: 6 })
    setParametrosBusca(
      (params) => {
        params.delete('acao')
        return params
      },
      { replace: true },
    )
  }, [parametrosBusca, setParametrosBusca])

  // Barra de progresso de ~2 s; ao concluir marca Atualizado (e abre o preview do resumo).
  useEffect(() => {
    if (geracao === null) return
    if (geracao.progresso >= 100) {
      const { relatorio } = geracao
      setGeracao(null)
      marcarRelatorioAtualizado(relatorio.id)
      if (relatorio.id === 'REL-001') setModalResumo(true)
      else addToast({ titulo: 'Relatório atualizado', descricao: `${relatorio.nome} gerado às 10:18.`, tone: 'success' })
      return
    }
    timerRef.current = window.setTimeout(
      () => setGeracao((atual) => (atual ? { ...atual, progresso: atual.progresso + 6 } : atual)),
      110,
    )
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [geracao, addToast, marcarRelatorioAtualizado])

  const relatoriosFiltrados = useMemo(() => {
    const termo = normalizar(busca.trim())
    return todosRelatorios.filter((relatorio) => {
      if (abaCategoria !== 'Todos' && relatorio.categoria !== abaCategoria) return false
      if (termo && !normalizar(`${relatorio.nome} ${relatorio.responsavel}`).includes(termo)) return false
      return true
    })
  }, [todosRelatorios, abaCategoria, busca])

  const visualizar = (relatorio: Relatorio) => {
    if (relatorio.id === 'REL-001') setModalResumo(true)
    else gerarAgora(relatorio)
  }

  const enviar = (relatorio: Relatorio) => {
    setVisoesEnvio(['executiva'])
    setModalEnvio(relatorio)
  }

  const confirmarEnvio = () => {
    if (!modalEnvio || visoesEnvio.length === 0) return
    const nomes = visoes.filter((visao) => visoesEnvio.includes(visao.id)).map((visao) => visao.nome)
    addToast({
      titulo: 'Relatório enviado',
      descricao: `${modalEnvio.nome} distribuído para ${nomes.join(', ')}.`,
      tone: 'success',
    })
    setModalEnvio(null)
  }

  const confirmarCriacao = () => {
    if (!formCriar.nome.trim()) return
    criarRelatorio({ ...formCriar, nome: formCriar.nome.trim() })
    setModalCriar(false)
    setFormCriar({ nome: '', categoria: 'Operacional', formato: 'PDF', responsavel: 'PCP' })
    setAbaCategoria('Todos')
  }

  const confirmarAgendamento = () => {
    const visao = visoes.find((item) => item.id === formAgendar.visaoId)
    agendarEnvio({
      relatorioId: formAgendar.relatorioId,
      destinatarios: visao?.nome ?? 'Visão Executiva',
      proximoEnvio: JANELAS_ENVIO[formAgendar.janela].data,
      canal: formAgendar.canal,
    })
    setModalAgendar(false)
  }

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Gerar resumo executivo') {
      if (geracao === null) setGeracao({ relatorio: relatorios[0], progresso: 6 })
    } else if (rotulo === 'Montar board pack') {
      addToast({ titulo: 'Board pack montado', descricao: '5 relatórios consolidados para a reunião de diretoria.', tone: 'success' })
    } else if (rotulo === 'Enviar relatório') {
      enviar(relatorios[0])
    }
  }

  const colunasBiblioteca: ColunaDataTable<Relatorio>[] = useMemo(
    () => [
      {
        id: 'nome',
        titulo: 'Relatório',
        render: (item) => (
          <span className="leading-tight">
            <span className="block max-w-[190px] truncate font-medium text-ink" title={item.nome}>
              {item.nome}
            </span>
            <span className="block max-w-[190px] truncate text-caption text-muted" title={item.descricao}>
              {item.descricao}
            </span>
          </span>
        ),
        valor: (item) => item.nome,
      },
      {
        id: 'categoria',
        titulo: 'Categoria',
        render: (item) => <span className="text-muted">{item.categoria}</span>,
        valor: (item) => item.categoria,
      },
      {
        id: 'periodicidade',
        titulo: 'Período',
        render: (item) => item.periodicidade,
        valor: (item) => item.periodicidade,
        filtravel: true,
      },
      {
        id: 'geracao',
        titulo: 'Última geração',
        render: (item) => (
          <span className="tabular-nums text-ink">
            {formatDiaMes(geracaoDe(item))} {formatHora(geracaoDe(item))}
          </span>
        ),
        valor: (item) => geracaoDe(item),
      },
      {
        id: 'formato',
        titulo: 'Formato',
        render: (item) => <BadgeFormato formato={item.formato} />,
      },
      {
        id: 'responsavel',
        titulo: 'Responsável',
        render: (item) => item.responsavel,
        valor: (item) => item.responsavel,
      },
      {
        id: 'situacao',
        titulo: 'Situação',
        render: (item) => <StatusPill status={situacaoDe(item)} />,
      },
      {
        id: 'acoes',
        titulo: 'Ações',
        render: (item) => (
          <span className="flex items-center gap-0.5">
            {(
              [
                ['Visualizar', Eye, () => visualizar(item)],
                ['Enviar', Send, () => enviar(item)],
                ['Gerar agora', RefreshCw, () => gerarAgora(item)],
              ] as const
            ).map(([rotulo, Icone, onClick]) => (
              <Tooltip key={rotulo} conteudo={rotulo}>
                <button
                  type="button"
                  aria-label={`${rotulo} — ${item.nome}`}
                  onClick={(evento) => {
                    evento.stopPropagation()
                    onClick()
                  }}
                  className="rounded-lg p-1 text-muted transition-colors duration-150 hover:bg-app hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Icone size={15} aria-hidden="true" />
                </button>
              </Tooltip>
            ))}
          </span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [relatoriosAtualizados],
  )

  const colunasAgendamentos: ColunaDataTable<AgendamentoRelatorio>[] = useMemo(
    () => [
      {
        id: 'relatorio',
        titulo: 'Relatório',
        render: (item) => (
          <span className="font-medium text-ink">
            {todosRelatorios.find((relatorio) => relatorio.id === item.relatorioId)?.nome ?? '—'}
          </span>
        ),
        valor: (item) => todosRelatorios.find((relatorio) => relatorio.id === item.relatorioId)?.nome ?? '',
      },
      {
        id: 'destinatarios',
        titulo: 'Destinatários',
        render: (item) => <span className="text-muted">{item.destinatarios}</span>,
        valor: (item) => item.destinatarios,
      },
      {
        id: 'envio',
        titulo: 'Próximo envio',
        render: (item) => (
          <span className="tabular-nums text-ink">
            {formatDiaMes(item.proximoEnvio)} {formatHora(item.proximoEnvio)}
          </span>
        ),
        valor: (item) => item.proximoEnvio,
      },
      {
        id: 'canal',
        titulo: 'Canal',
        render: (item) => <Badge tone={item.canal === 'E-mail' ? 'info' : 'clean'}>{item.canal}</Badge>,
        valor: (item) => item.canal,
      },
      {
        id: 'status',
        titulo: 'Status',
        render: (item) => <StatusPill status={item.status} />,
        valor: (item) => item.status,
      },
    ],
    [todosRelatorios],
  )

  const recentes = useMemo(
    () => [...todosRelatorios].sort((a, b) => geracaoDe(b).getTime() - geracaoDe(a).getTime()).slice(0, 5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todosRelatorios, relatoriosAtualizados],
  )

  const copiloto = conteudoCopilot['/relatorios']

  return (
    <>
      <PageHeader
        titulo="Relatórios"
        descricao="Gere, acompanhe e distribua relatórios operacionais, táticos e executivos."
        acoes={
          <>
            <Button tamanho="sm" onClick={() => setModalCriar(true)}>
              <Plus size={14} aria-hidden="true" />
              Criar relatório
            </Button>
            <Button variante="outline" tamanho="sm" onClick={() => setModalAgendar(true)}>
              <CalendarClock size={14} aria-hidden="true" />
              Agendar envio
            </Button>
            <Button
              variante="outline"
              tamanho="sm"
              onClick={() =>
                addToast({
                  titulo: 'Biblioteca exportada',
                  descricao: `${todosRelatorios.length} relatórios exportados em XLSX.`,
                  tone: 'success',
                })
              }
            >
              <Download size={14} aria-hidden="true" />
              Exportar biblioteca
            </Button>
          </>
        }
      />

      <KpiRow kpis={kpisPorTela['/relatorios']} />

      <div ref={bibliotecaRef} className="scroll-mt-4">
      <SectionCard
        titulo={`Biblioteca de Relatórios (${relatoriosFiltrados.length})`}
        info="Catálogo por categoria — Visualizar abre o preview do Resumo Executivo."
        corpoSemPadding
        direita={
          <label className="flex items-center gap-2 rounded-lg border border-line bg-app px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-primary">
            <Search size={14} className="shrink-0 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar relatório…"
              aria-label="Buscar relatório por nome ou responsável"
              className="w-44 bg-transparent text-body-sm text-ink placeholder:text-muted focus:outline-none"
            />
          </label>
        }
      >
        <Tabs abas={ABAS_CATEGORIA} ativa={abaCategoria} onChange={setAbaCategoria} className="px-5" />
        {relatoriosFiltrados.length > 0 ? (
          <DataTable
            rotulo="Biblioteca de relatórios"
            colunas={colunasBiblioteca}
            linhas={relatoriosFiltrados}
            chave={(item) => item.id}
            ordenacaoInicial={{ coluna: 'geracao', direcao: 'desc' }}
          />
        ) : (
          <p className="px-5 py-6 text-body-sm text-muted">
            Nenhum relatório corresponde a “{busca}”. Limpe a busca ou troque de categoria para ver o catálogo.
          </p>
        )}
      </SectionCard>
      </div>

      <div className="grid grid-cols-3 items-start gap-5">
        <div className="col-span-2 flex min-w-0 flex-col gap-5">
          <SectionCard
            titulo="Distribuição e Consumo"
            info="Leituras dos últimos 7 dias e indicadores de consumo da biblioteca."
          >
            <p className="mb-1 flex items-center justify-between gap-3 text-caption text-muted">
              <span className="font-semibold text-ink">Leituras por dia</span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-primary" aria-hidden="true" />
                13 – 19/mai
              </span>
            </p>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leiturasSemana} margin={{ top: 6, right: 14, bottom: 0, left: 14 }}>
                  <CartesianGrid {...GRID} />
                  <XAxis
                    dataKey="label"
                    tick={EIXO.tick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide domain={[0, 'dataMax + 60']} />
                  <ChartTooltip
                    cursor={{ stroke: colors.line }}
                    content={<TooltipHpo />}
                    formatter={(valor: number) => [`${formatNumero(valor)} leituras`, 'Leituras']}
                  />
                  <Line type="monotone" dataKey="valor" stroke={colors.primary} strokeWidth={2} dot={false} activeDot={DOT_HOVER} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3 border-t border-line pt-3">
              {consumoRelatorios.map((indicador) => (
                <div key={indicador.id} className="min-w-0">
                  <p className="truncate text-caption text-muted" title={indicador.label}>
                    {indicador.label}
                  </p>
                  <p className="text-[17px] font-bold leading-6 text-ink">{indicador.valor}</p>
                  <TrendDelta delta={indicador.delta} deltaGoodWhen={indicador.deltaGoodWhen} />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            titulo={`Agendamentos (${todosAgendamentos.length})`}
            info="Envios programados por e-mail e Teams — destinatários por visão."
            corpoSemPadding
            acao={{ rotulo: 'Agendar envio', onClick: () => setModalAgendar(true) }}
          >
            <DataTable
              rotulo="Envios programados"
              colunas={colunasAgendamentos}
              linhas={todosAgendamentos}
              chave={(item) => item.id}
            />
          </SectionCard>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <CopilotPanel conteudo={copiloto} onAcao={aoAcaoCopilot} />

          <SectionCard titulo="Relatórios Recentes" info="Últimas gerações da biblioteca, mais novas primeiro.">
            <ul className="flex flex-col gap-2.5">
              {recentes.map((relatorio) => (
                <li key={relatorio.id} className="flex items-center justify-between gap-2 border-b border-line pb-2.5 last:border-b-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-body-sm font-medium text-ink" title={relatorio.nome}>
                      {relatorio.nome}
                    </p>
                    <p className="flex items-center gap-1.5 text-caption text-muted">
                      <span className="tabular-nums">
                        {formatDiaMes(relatorio.ultimaGeracao)} {formatHora(relatorio.ultimaGeracao)}
                      </span>
                      <BadgeFormato formato={relatorio.formato} />
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => visualizar(relatorio)}
                      aria-label={`Visualizar ${relatorio.nome}`}
                      className="rounded-lg p-1.5 text-muted transition-colors duration-150 hover:bg-app hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <FileText size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => enviar(relatorio)}
                      aria-label={`Enviar ${relatorio.nome}`}
                      className="rounded-lg p-1.5 text-muted transition-colors duration-150 hover:bg-app hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Send size={15} aria-hidden="true" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-3 items-start gap-5">
        <SectionCard
          className="col-span-2"
          titulo="Catálogo Analítico"
          info="Relatórios disponíveis por área na rede Hypera — a biblioteca acima exibe os modelados."
          acao={{
            rotulo: 'Ver biblioteca modelada',
            onClick: () => {
              setAbaCategoria('Todos')
              setBusca('')
              bibliotecaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            },
          }}
        >
          <div className="grid grid-cols-3 gap-3">
            {catalogoAnalitico.map((categoria) => (
              <div key={categoria.area} className="rounded-xl border border-line bg-app/40 px-3.5 py-3">
                <p className="text-body-sm font-medium text-ink">{categoria.area}</p>
                <p className="mt-1 text-[22px] font-bold leading-none tabular-nums text-primary">
                  {formatNumero(categoria.quantidade)}
                </p>
                <p className="mt-1 text-caption text-muted">relatórios</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard titulo="Governança e Confiabilidade" info="Saúde do pipeline de dados e distribuição.">
          <div className="flex justify-center border-b border-line pb-4">
            <ScoreDonut valor={RELATORIOS_GOVERNANCA_SCORE} rotulo="Confiabilidade da biblioteca" />
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {governancaRelatorios.map((item) => (
              <li key={item.item} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-body-sm text-ink" title={item.item}>
                  {item.item}
                </span>
                {item.valorRotulo ? (
                  <>
                    <ProgressBar valor={item.percent} mostrarRotulo={false} />
                    <span className="w-10 shrink-0 text-right text-caption font-semibold tabular-nums text-ink">
                      {item.valorRotulo}
                    </span>
                  </>
                ) : (
                  <ProgressBar valor={item.percent} />
                )}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Progresso da geração (~2 s) — vale para qualquer relatório da biblioteca */}
      {geracao !== null ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 w-80 animate-toast-in rounded-card border border-line bg-card p-4 shadow-pop motion-reduce:animate-none"
        >
          <p className="flex items-center gap-2 text-body-sm font-semibold text-ink">
            <FileText size={15} className="text-primary" aria-hidden="true" />
            Gerando {geracao.relatorio.nome}…
          </p>
          <ProgressBar valor={geracao.progresso} className="mt-2.5" />
          <p className="mt-1.5 text-caption text-muted">Consolidando dados do MES, SAP PP e LIMS.</p>
        </div>
      ) : null}

      <Modal
        aberto={modalResumo}
        onFechar={() => setModalResumo(false)}
        titulo="Resumo Executivo da Produção"
        descricao="HPO — Hypera Production Optimizer · 19/mai/2025 · Turno A"
        largura="lg"
        rodape={
          <>
            <Button variante="outline" tamanho="sm" onClick={() => setModalResumo(false)}>
              Fechar
            </Button>
            <Button variante="outline" tamanho="sm" onClick={() => window.print()}>
              <Download size={14} aria-hidden="true" />
              Exportar PDF
            </Button>
            <Button
              tamanho="sm"
              onClick={() => addToast({ titulo: 'Enviado para 8 destinatários', descricao: 'Diretoria Industrial · por e-mail.', tone: 'success' })}
            >
              <Send size={14} aria-hidden="true" />
              Enviar para diretoria
            </Button>
          </>
        }
      >
        <div className="area-impressao flex flex-col gap-4">
          {/* Cabeçalho HPO — visível apenas na impressão (Exportar PDF) */}
          <div className="apenas-impressao border-b border-line pb-3">
            <p className="text-[18px] font-bold text-ink">HPO — Hypera Production Optimizer</p>
            <p className="text-caption text-muted">
              Resumo Executivo da Produção · 19/mai/2025 · Turno A (06:00 – 14:00) · dados fictícios e determinísticos
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {resumoExecutivoKpis.map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-line bg-app/50 px-3 py-2.5">
                <p className="truncate text-caption text-muted" title={kpi.label}>
                  {kpi.label}
                </p>
                <p className="mt-0.5 text-[20px] font-bold leading-7 text-ink">{kpi.valor}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-1 flex items-center justify-between gap-3 text-caption text-muted">
              <span className="font-semibold text-ink">Produção vs Plano · últimos 7 dias · mil un</span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded bg-primary" aria-hidden="true" />
                  Real
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0 w-4 border-t-2 border-dashed border-neutral" aria-hidden="true" />
                  Plano
                </span>
              </span>
            </p>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={producaoVsPlano} margin={{ top: 6, right: 14, bottom: 0, left: 14 }}>
                  <CartesianGrid {...GRID} />
                  <XAxis
                    dataKey="label"
                    tick={EIXO.tick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide domain={['dataMin - 120', 'dataMax + 80']} />
                  <ChartTooltip
                    cursor={{ stroke: colors.line }}
                    content={<TooltipHpo />}
                    formatter={(valor: number, nome: string) => [`${formatNumero(valor)} mil un`, nome === 'real' ? 'Real' : 'Plano']}
                  />
                  <Line type="monotone" dataKey="plano" stroke="#94A3B8" strokeWidth={1.6} strokeDasharray="5 4" dot={false} activeDot={DOT_HOVER} isAnimationActive={false} />
                  <Line type="monotone" dataKey="real" stroke={colors.primary} strokeWidth={2} dot={false} activeDot={DOT_HOVER} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-caption font-semibold uppercase tracking-wide text-danger">Riscos da semana</p>
              <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-4 text-body-sm text-ink">
                {conteudoCopilot['/'].riscos.map((risco) => (
                  <li key={risco}>{risco}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-caption font-semibold uppercase tracking-wide text-success">Recomendações</p>
              <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-4 text-body-sm text-ink">
                {conteudoCopilot['/'].acoes.map((acao) => (
                  <li key={acao}>{acao}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="border-t border-line pt-2.5 text-caption text-muted">
            Gerado pelo Copiloto Gemini às 10:18 · fontes: MES, SAP PP e LIMS · distribuição controlada.
          </p>
        </div>
      </Modal>

      {/* Enviar — destinatários por visão (papéis funcionais, nunca pessoas) */}
      <Modal
        aberto={modalEnvio !== null}
        onFechar={() => setModalEnvio(null)}
        titulo={`Enviar ${modalEnvio?.nome ?? ''}`}
        descricao="Os destinatários são as visões da plataforma — cada visão recebe no canal configurado."
        rodape={
          <>
            <Button variante="outline" tamanho="sm" onClick={() => setModalEnvio(null)}>
              Cancelar
            </Button>
            <Button tamanho="sm" disabled={visoesEnvio.length === 0} onClick={confirmarEnvio}>
              <Send size={14} aria-hidden="true" />
              Enviar para {visoesEnvio.length} {visoesEnvio.length === 1 ? 'visão' : 'visões'}
            </Button>
          </>
        }
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-caption font-semibold uppercase tracking-wide text-muted">Destinatários</legend>
          {visoes.map((visao) => {
            const marcada = visoesEnvio.includes(visao.id)
            return (
              <label
                key={visao.id}
                className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line px-3 py-2.5 transition-colors duration-150 hover:bg-app has-[:checked]:border-primary/40 has-[:checked]:bg-primary-soft/40"
              >
                <input
                  type="checkbox"
                  checked={marcada}
                  onChange={() =>
                    setVisoesEnvio((atual) =>
                      marcada ? atual.filter((id) => id !== visao.id) : [...atual, visao.id],
                    )
                  }
                  className="mt-0.5 h-4 w-4 accent-[#2563EB]"
                />
                <span className="min-w-0 leading-tight">
                  <span className="block text-body-sm font-medium text-ink">{visao.nome}</span>
                  <span className="block text-caption text-muted">{visao.descricao}</span>
                </span>
              </label>
            )
          })}
        </fieldset>
      </Modal>

      {/* + Criar relatório — insere na biblioteca via store */}
      <Modal
        aberto={modalCriar}
        onFechar={() => setModalCriar(false)}
        titulo="Criar relatório"
        descricao="O relatório entra na biblioteca como Atualizado, sob demanda."
        rodape={
          <>
            <Button variante="outline" tamanho="sm" onClick={() => setModalCriar(false)}>
              Cancelar
            </Button>
            <Button tamanho="sm" disabled={!formCriar.nome.trim()} onClick={confirmarCriacao}>
              <Plus size={14} aria-hidden="true" />
              Criar relatório
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-caption font-medium text-muted">Nome do relatório</span>
            <input
              type="text"
              value={formCriar.nome}
              onChange={(evento) => setFormCriar((atual) => ({ ...atual, nome: evento.target.value }))}
              placeholder="Ex.: Aderência por linha — semana 21"
              className="h-9 rounded-lg border border-line bg-card px-3 text-body-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-caption font-medium text-muted">Categoria</span>
              <select
                value={formCriar.categoria}
                onChange={(evento) =>
                  setFormCriar((atual) => ({ ...atual, categoria: evento.target.value as CategoriaRelatorio }))
                }
                className="h-9 rounded-lg border border-line bg-card px-2 text-body-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {CATEGORIAS_FORM.map((categoria) => (
                  <option key={categoria}>{categoria}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-caption font-medium text-muted">Formato</span>
              <select
                value={formCriar.formato}
                onChange={(evento) =>
                  setFormCriar((atual) => ({ ...atual, formato: evento.target.value as Relatorio['formato'] }))
                }
                className="h-9 rounded-lg border border-line bg-card px-2 text-body-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option>PDF</option>
                <option>XLSX</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-caption font-medium text-muted">Área responsável</span>
              <select
                value={formCriar.responsavel}
                onChange={(evento) => setFormCriar((atual) => ({ ...atual, responsavel: evento.target.value }))}
                className="h-9 rounded-lg border border-line bg-card px-2 text-body-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {AREAS_RESPONSAVEIS.map((area) => (
                  <option key={area}>{area}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </Modal>

      {/* Agendar envio — insere nos agendamentos via store */}
      <Modal
        aberto={modalAgendar}
        onFechar={() => setModalAgendar(false)}
        titulo="Agendar envio"
        descricao="O envio entra na lista de agendamentos como Programado."
        rodape={
          <>
            <Button variante="outline" tamanho="sm" onClick={() => setModalAgendar(false)}>
              Cancelar
            </Button>
            <Button tamanho="sm" onClick={confirmarAgendamento}>
              <CalendarClock size={14} aria-hidden="true" />
              Agendar envio
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-caption font-medium text-muted">Relatório</span>
            <select
              value={formAgendar.relatorioId}
              onChange={(evento) => setFormAgendar((atual) => ({ ...atual, relatorioId: evento.target.value }))}
              className="h-9 rounded-lg border border-line bg-card px-2 text-body-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {todosRelatorios.map((relatorio) => (
                <option key={relatorio.id} value={relatorio.id}>
                  {relatorio.nome}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-caption font-medium text-muted">Destinatário (visão)</span>
              <select
                value={formAgendar.visaoId}
                onChange={(evento) => setFormAgendar((atual) => ({ ...atual, visaoId: evento.target.value }))}
                className="h-9 rounded-lg border border-line bg-card px-2 text-body-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {visoes.map((visao) => (
                  <option key={visao.id} value={visao.id}>
                    {visao.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-caption font-medium text-muted">Canal</span>
              <select
                value={formAgendar.canal}
                onChange={(evento) =>
                  setFormAgendar((atual) => ({ ...atual, canal: evento.target.value as AgendamentoRelatorio['canal'] }))
                }
                className="h-9 rounded-lg border border-line bg-card px-2 text-body-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option>E-mail</option>
                <option>Teams</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-caption font-medium text-muted">Próximo envio</span>
              <select
                value={formAgendar.janela}
                onChange={(evento) => setFormAgendar((atual) => ({ ...atual, janela: Number(evento.target.value) }))}
                className="h-9 rounded-lg border border-line bg-card px-2 text-body-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {JANELAS_ENVIO.map((janela, indice) => (
                  <option key={janela.rotulo} value={indice}>
                    {janela.rotulo}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </Modal>

      <PageFooter />
    </>
  )
}
