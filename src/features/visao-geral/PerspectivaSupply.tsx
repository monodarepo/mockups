import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts'
import { TooltipHpo } from '@/components/charts'
import { KpiRow } from '@/components/shared/KpiCard'
import { SectionCard } from '@/components/shared/SectionCard'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { StatusPill } from '@/components/shared/StatusPill'
import { TrendDelta } from '@/components/shared/TrendDelta'
import { cn } from '@/lib/cn'
import { colors, toneHex } from '@/lib/colors'
import { formatPercent } from '@/lib/format'
import { useAppStore } from '@/store'
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
} from '@/data'

const CORES_COMPOSICAO = [colors.primary, colors.info, colors.success]

const COR_NO_LOGISTICO = { fabrica: colors.primary, cd: colors.success, transito: colors.warning } as const

/** Prédio do mapa do site — vista superior com leve relevo. */
function Predio({ x, y, w, h, rotulo }: { x: number; y: number; w: number; h: number; rotulo?: string }) {
  return (
    <g>
      <rect x={x + 2} y={y + 4} width={w} height={h} rx="6" fill="#B9C9DD" />
      <rect x={x} y={y} width={w} height={h} rx="6" fill="#FFFFFF" stroke="#CBD9EA" strokeWidth="1.2" />
      {/* Recortes de telhado — dão a leitura industrial na vista superior */}
      <line x1={x + w * 0.33} y1={y + 4} x2={x + w * 0.33} y2={y + h - 4} stroke="#E3EBF4" strokeWidth="2" />
      <line x1={x + w * 0.66} y1={y + 4} x2={x + w * 0.66} y2={y + h - 4} stroke="#E3EBF4" strokeWidth="2" />
      {rotulo ? (
        <text x={x + w / 2} y={y + h / 2 + 3} textAnchor="middle" fontSize="10" fontWeight={600} fill={colors.muted}>
          {rotulo}
        </text>
      ) : null}
    </g>
  )
}

/** Vista superior estilizada do complexo industrial, com pins e linhas de fluxo. */
function MapaSite() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-line">
      <svg viewBox="0 0 800 340" className="block h-auto w-full" aria-hidden="true">
        {/* Terreno e vias */}
        <rect width="800" height="340" fill="#EEF4EC" />
        <rect x="0" y="150" width="800" height="26" fill="#DDE5EE" />
        <rect x="376" y="0" width="26" height="340" fill="#DDE5EE" />
        <line x1="0" y1="163" x2="800" y2="163" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="14 12" />
        <line x1="389" y1="0" x2="389" y2="340" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="14 12" />
        {/* Áreas verdes */}
        <circle cx="330" cy="60" r="16" fill="#DCEBD8" />
        <circle cx="452" cy="292" r="20" fill="#DCEBD8" />
        <circle cx="742" cy="30" r="14" fill="#DCEBD8" />

        {/* Prédios */}
        <Predio x={40} y={44} w={140} h={72} />
        <Predio x={48} y={210} w={150} h={84} />
        <Predio x={250} y={62} w={280} h={130} rotulo="" />
        <Predio x={500} y={44} w={130} h={64} />
        <Predio x={580} y={180} w={180} h={96} />
        {/* Pátio de transportes com carretas */}
        <rect x={300} y={252} width={180} height={64} rx="8" fill="#E5EAF1" stroke="#CBD9EA" strokeWidth="1.2" />
        {[312, 344, 376, 408, 440].map((x) => (
          <rect key={x} x={x} y={264} width={22} height={40} rx="3" fill="#FFFFFF" stroke="#B9C9DD" strokeWidth="1.1" />
        ))}

        {/* Linhas de fluxo: recebimento → armazém → produção → expedição → CD → transportes */}
        <path
          d="M110 116 L110 210 M198 252 L250 192 M530 127 L565 108 M565 108 L580 108 M530 160 L580 200 M480 284 L580 250"
          stroke={colors.primary}
          strokeOpacity="0.45"
          strokeWidth="2"
          strokeDasharray="6 6"
          fill="none"
          className="animate-flow motion-reduce:animate-none"
        />
      </svg>

      {/* Pins do site */}
      {pontosMapaSite.map((ponto) => (
        <span
          key={ponto.id}
          className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-pill border border-line bg-card px-2 py-0.5 text-[10px] shadow-card"
          style={{ left: `${ponto.posicao[0]}%`, top: `${ponto.posicao[1]}%` }}
        >
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: toneHex[ponto.tone] }} aria-hidden="true" />
          <span className="font-semibold text-ink">{ponto.nome}</span>
          <span className="text-muted">{ponto.detalhe}</span>
        </span>
      ))}
    </div>
  )
}

/** Silhueta simplificada do Brasil com os nós logísticos. */
function MiniMapaBrasil() {
  return (
    <div className="rounded-xl border border-line bg-app/60 p-3">
      <svg viewBox="0 0 200 210" className="mx-auto block h-auto w-full max-w-[240px]" role="img" aria-label="Nós logísticos no mapa do Brasil">
        <path
          d="M70 12 L92 20 L110 28 L128 38 L152 44 L158 58 L150 78 L140 96 L128 116 L112 130 L98 146 L88 166 L76 186 L66 178 L72 158 L60 140 L48 120 L36 104 L28 84 L16 76 L24 60 L36 48 L30 32 L44 20 L56 24 Z"
          fill="#E2ECF8"
          stroke="#B9CDE4"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {nosLogisticos.map((no) => (
          <g key={no.id}>
            {no.tipo === 'transito' ? (
              <circle cx={no.posicao[0]} cy={no.posicao[1]} r="6" fill={COR_NO_LOGISTICO.transito} fillOpacity="0.25" className="animate-pulse-live motion-reduce:animate-none" />
            ) : null}
            <circle cx={no.posicao[0]} cy={no.posicao[1]} r={no.tipo === 'transito' ? 3 : 4} fill={COR_NO_LOGISTICO[no.tipo]} stroke="#FFFFFF" strokeWidth="1.2">
              <title>{no.nome}</title>
            </circle>
          </g>
        ))}
      </svg>
      <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {(
          [
            ['fabrica', 'Fábrica'],
            ['cd', 'CD'],
            ['transito', 'Em trânsito'],
          ] as const
        ).map(([tipo, rotulo]) => (
          <li key={tipo} className="flex items-center gap-1.5 text-caption text-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COR_NO_LOGISTICO[tipo] }} aria-hidden="true" />
            {rotulo}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PerspectivaSupply() {
  const navigate = useNavigate()
  const addToast = useAppStore((s) => s.addToast)
  const abrirSimulador = useAppStore((s) => s.abrirSimulador)

  const dadosComposicao = useMemo(
    () => composicaoEstoque.map((fatia) => ({ name: fatia.rotulo, value: fatia.percent })),
    [],
  )

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Simular impacto') abrirSimulador('EV-002')
    else if (rotulo === 'Priorizar reposição') {
      addToast({
        titulo: 'Reposição priorizada',
        descricao: 'Ibuprofeno API no topo da fila de suprimentos — janela de 48 h.',
        tone: 'success',
      })
    } else if (rotulo === 'Ver materiais críticos') navigate('/materiais')
  }

  return (
    <>
      <KpiRow kpis={kpisSupply} />

      <div className="grid grid-cols-3 items-start gap-5">
        <div className="col-span-2 flex min-w-0 flex-col gap-5">
          <SectionCard
            titulo="Mapa do Site"
            info="Vista superior do complexo de Anápolis — recebimento, produção, expedição e distribuição."
            corpoSemPadding
          >
            <div className="p-4">
              <MapaSite />
            </div>
          </SectionCard>

          <KpiRow kpis={kpisSupplySecundarios} />

          <SectionCard titulo="Fluxo de Supply" info="Do recebimento de MP à entrega no cliente — status de cada etapa.">
            <ol className="flex items-start gap-2">
              {fluxoSupply.map((etapa, indice) => (
                <li key={etapa.etapa} className="flex min-w-0 flex-1 items-start gap-2">
                  <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                    <span
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-caption font-bold',
                        etapa.concluida ? 'bg-success text-white' : 'border-2 border-line bg-card text-muted',
                      )}
                      aria-hidden="true"
                    >
                      {indice + 1}
                    </span>
                    <span className="text-body-sm font-semibold leading-tight text-ink">{etapa.etapa}</span>
                    <StatusPill status={etapa.status} tone={etapa.tone} />
                  </div>
                  {indice < fluxoSupply.length - 1 ? (
                    <span
                      className={cn('mt-3.5 h-0.5 w-8 shrink-0 rounded', etapa.concluida ? 'bg-success' : 'bg-line')}
                      aria-hidden="true"
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard titulo="Destaques da Semana" info="Volumes da semana 20 – 26/mai e composição do estoque total.">
            <div className="grid grid-cols-2 items-center gap-5">
              <dl className="flex flex-col gap-4">
                {destaquesSemana.map((destaque) => (
                  <div key={destaque.id} className="border-b border-line pb-3 last:border-b-0 last:pb-0">
                    <dt className="text-caption text-muted">{destaque.rotulo}</dt>
                    <dd className="flex items-baseline gap-2">
                      <span className="text-[22px] font-bold tabular-nums text-ink">{destaque.valor}</span>
                      <TrendDelta delta={destaque.delta} deltaGoodWhen={destaque.deltaGoodWhen} />
                    </dd>
                  </div>
                ))}
              </dl>
              <div>
                <p className="mb-1 text-caption font-semibold text-ink">Composição do estoque · R$ 128,4 mi</p>
                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip
                        content={<TooltipHpo />}
                        formatter={(valor: number, nome: string) => [formatPercent(valor, 0), nome]}
                      />
                      <Pie
                        data={dadosComposicao}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={42}
                        outerRadius={64}
                        paddingAngle={2}
                        isAnimationActive={false}
                      >
                        {dadosComposicao.map((fatia, indice) => (
                          <Cell key={fatia.name} fill={CORES_COMPOSICAO[indice % CORES_COMPOSICAO.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                  {composicaoEstoque.map((fatia, indice) => (
                    <li key={fatia.id} className="flex items-center gap-1.5 text-caption text-muted">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: CORES_COMPOSICAO[indice % CORES_COMPOSICAO.length] }}
                        aria-hidden="true"
                      />
                      {fatia.rotulo} <strong className="text-ink">{formatPercent(fatia.percent, 0)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <CopilotPanel conteudo={copilotSupply} onAcao={aoAcaoCopilot} />

          <SectionCard
            titulo={`Alertas Prioritários (${alertasSupply.length})`}
            info="Riscos de abastecimento com decisão pendente."
            acao={{ rotulo: 'Ver central', onClick: () => navigate('/alertas') }}
          >
            <ul className="flex flex-col gap-2.5">
              {alertasSupply.map((alerta) => (
                <li key={alerta.id} className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-body-sm font-medium text-ink" title={alerta.titulo}>
                    {alerta.titulo}
                  </p>
                  <StatusPill status={alerta.severidade} tone={alerta.tone} pulsar={alerta.severidade === 'Crítico'} />
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard titulo="Visão de Nós Logísticos" info="Fábricas, centros de distribuição e cargas em trânsito.">
            <MiniMapaBrasil />
          </SectionCard>
        </div>
      </div>
    </>
  )
}
