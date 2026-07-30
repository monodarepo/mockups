import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageFooter } from '@/components/shared/PageFooter'
import { FilterBar } from '@/components/shared/FilterBar'
import { SectionCard } from '@/components/shared/SectionCard'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { StatusPill } from '@/components/shared/StatusPill'
import { FactoryMap, type PinFabrica, type StatusPin } from '@/components/shared/FactoryMap'
import { DataTable, IdLink, type ColunaDataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { toneHex, type Tone } from '@/lib/colors'
import { formatHora, formatNumero, formatPercent } from '@/lib/format'
import { useAppStore } from '@/store'
import {
  MELHOR_CENARIO_ID,
  conteudoCopilot,
  detalhesAreasGemeo,
  estadosAreasGemeo,
  detalhesExecucao,
  kpisPlantaGemeo,
  legendaGemeo,
  linhasExecucao,
  ordemPorId,
  produtoPorId,
  type DetalheAreaGemeo,
} from '@/data'

/** Rótulo e tom de cada status de área — mesma régua da legenda. */
const rotuloDoStatus: Record<string, string> = {
  normal: 'Operação normal',
  atencao: 'Tendência de desvio',
  critico: 'Parada ou restrição',
  parada: 'Parada ou restrição',
  manutencao: 'Manutenção programada',
  'sem-dados': 'Indisponível',
}

const toneDoStatus: Record<string, Tone> = {
  normal: 'success',
  atencao: 'warning',
  critico: 'danger',
  parada: 'danger',
  manutencao: 'info',
  'sem-dados': 'neutral',
}

const toneDaCondicao: Record<'Normal' | 'Atenção' | 'Crítico', Tone> = {
  Normal: 'success',
  Atenção: 'warning',
  Crítico: 'danger',
}

/** Bloco da planta correspondente a cada linha (para abrir o drawer pelo pin). */
const AREA_DA_LINHA: Record<string, string> = {
  L12: 'Compressão (L12)',
  L08: 'Sólidos (L08)',
  L03: 'Cápsulas (L03)',
  L05: 'Drágeas (L05)',
  L15: 'Pó e Sachês (L15)',
}

const POSICAO_DA_LINHA: Record<string, [number, number]> = {
  L12: [13.3, 51],
  L08: [31.8, 51],
  L03: [50.3, 51],
  L05: [68.8, 51],
  L15: [87, 51],
}

function CampoDrawer({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-caption text-muted">{rotulo}</dt>
      <dd className="font-semibold text-ink">{children}</dd>
    </div>
  )
}

export function GemeoPage() {
  const navigate = useNavigate()
  const setPersona = useAppStore((s) => s.setPersona)
  const abrirSimulador = useAppStore((s) => s.abrirSimulador)
  const aplicarCenario = useAppStore((s) => s.aplicarCenario)

  const [areaSelecionada, setAreaSelecionada] = useState<string | null>(null)

  // Persona desta tela: Camila Azevedo.
  useEffect(() => {
    setPersona('camila')
  }, [setPersona])

  const detalhe: DetalheAreaGemeo | undefined = areaSelecionada
    ? detalhesAreasGemeo[areaSelecionada]
    : undefined
  const ordemDetalhe = detalhe?.ordemId ? ordemPorId(detalhe.ordemId) : undefined
  const produtoDetalhe = ordemDetalhe ? produtoPorId(ordemDetalhe.produtoId) : undefined
  const execucaoDetalhe = detalhe?.ordemId ? detalhesExecucao[detalhe.ordemId] : undefined

  // Pins das 5 linhas: produto atual + OEE do turno; status espelha o bloco.
  const pins: PinFabrica[] = useMemo(
    () =>
      linhasExecucao.map((execucao) => {
        const produto = produtoPorId(ordemPorId(execucao.ordemId)?.produtoId ?? '')
        const area = AREA_DA_LINHA[execucao.linhaId]
        return {
          id: `pin-${execucao.linhaId}`,
          label: `${execucao.linhaId} · ${produto?.nome.split(' ')[0] ?? '—'}`,
          valorPercent: execucao.oeeTurno,
          status: (estadosAreasGemeo[area] ?? 'normal') as StatusPin,
          posicao: POSICAO_DA_LINHA[execucao.linhaId],
        }
      }),
    [],
  )

  const colunasAreas: ColunaDataTable<DetalheAreaGemeo>[] = useMemo(
    () => [
      {
        id: 'area',
        titulo: 'Área',
        render: (item) => <span className="font-medium text-ink">{item.area}</span>,
        valor: (item) => item.area,
      },
      {
        id: 'status',
        titulo: 'Status',
        render: (item) => (
          <StatusPill
            status={rotuloDoStatus[item.status]}
            tone={toneDoStatus[item.status]}
            pulsar={item.status === 'parada' || item.status === 'critico'}
          />
        ),
        valor: (item) => rotuloDoStatus[item.status],
      },
      {
        id: 'resumo',
        titulo: 'Situação atual',
        render: (item) => (
          <span className="block max-w-[380px] truncate text-muted" title={item.resumo}>
            {item.resumo}
          </span>
        ),
        valor: (item) => item.resumo,
      },
    ],
    [],
  )

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Simular parada da L12') abrirSimulador('EV-001')
    else if (rotulo === 'Aplicar Cenário A') aplicarCenario(MELHOR_CENARIO_ID)
  }

  const listaAreas = useMemo(() => Object.values(detalhesAreasGemeo), [])

  return (
    <>
      <PageHeader
        titulo="Gêmeo da Fábrica"
        descricao="Navegue pela planta, acompanhe o status de cada área e aprofunde na operação em tempo real."
      />

      <FilterBar />

      <div className="grid grid-cols-4 items-start gap-5">
        <div className="flex min-w-0 flex-col gap-5">
          <SectionCard titulo="Planta de Anápolis" info="Indicadores consolidados do Turno A.">
            <dl className="flex flex-col">
              {kpisPlantaGemeo.map((kpi, indice) => (
                <div
                  key={kpi.id}
                  className={indice > 0 ? 'border-t border-line pt-3 mt-3' : undefined}
                >
                  <dt className="text-caption text-muted">{kpi.rotulo}</dt>
                  <dd className="text-[24px] font-bold leading-8 tabular-nums text-ink">{kpi.valor}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <SectionCard titulo="Legenda" info="Status possíveis de cada área da planta.">
            <ul className="flex flex-col gap-2.5">
              {legendaGemeo.map((item) => (
                <li key={item.status} className="flex items-center gap-2 text-body-sm text-ink">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: toneHex[toneDoStatus[item.status]] }}
                    aria-hidden="true"
                  />
                  {item.rotulo}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <SectionCard
          className="col-span-3"
          titulo="Planta Interativa"
          info="Clique em uma área ou em um pin para abrir o detalhe da operação."
          corpoSemPadding
        >
          <div className="p-4">
            <FactoryMap
              pins={pins}
              estadosBlocos={estadosAreasGemeo as Record<string, StatusPin>}
              onSelecionarBloco={(nome) => setAreaSelecionada(nome)}
              onSelecionarPin={(pin) => {
                const linhaId = pin.id.replace('pin-', '')
                setAreaSelecionada(AREA_DA_LINHA[linhaId] ?? null)
              }}
            />
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-3 items-start gap-5">
        <SectionCard
          className="col-span-2"
          titulo={`Áreas da Planta (${listaAreas.length})`}
          info="Mesmo conteúdo do mapa em formato de lista — clique para abrir o detalhe."
          corpoSemPadding
        >
          <DataTable
            rotulo="Áreas da planta de Anápolis"
            colunas={colunasAreas}
            linhas={listaAreas}
            chave={(item) => item.area}
            alturaMax={430}
            onLinhaClick={(item) => setAreaSelecionada(item.area)}
            linhaSelecionada={areaSelecionada ?? undefined}
          />
        </SectionCard>

        <CopilotPanel conteudo={conteudoCopilot['/gemeo']} onAcao={aoAcaoCopilot} />
      </div>

      <Drawer
        aberto={detalhe !== undefined}
        onFechar={() => setAreaSelecionada(null)}
        titulo={detalhe?.area ?? ''}
        descricao={detalhe ? rotuloDoStatus[detalhe.status] : undefined}
        rodape={
          detalhe ? (
            <>
              {detalhe.tipo === 'linha' ? (
                <Button
                  variante="outline"
                  tamanho="sm"
                  onClick={() => navigate('/sequenciamento')}
                >
                  Ver no Sequenciamento
                </Button>
              ) : null}
              {detalhe.ativoId ? (
                <Button
                  tamanho="sm"
                  onClick={() => navigate(`/manutencao?ativo=${detalhe.ativoId}`)}
                >
                  Ver Manutenção
                </Button>
              ) : null}
            </>
          ) : undefined
        }
      >
        {detalhe ? (
          <div className="flex flex-col gap-4">
            <p className="text-body leading-relaxed text-ink">{detalhe.resumo}</p>

            {detalhe.fio ? (
              <p className="rounded-xl border border-warning/40 bg-warning-soft px-3 py-2.5 text-body-sm leading-snug text-warning-strong">
                {detalhe.fio}
              </p>
            ) : null}

            {detalhe.tipo === 'linha' ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-line py-3 text-body-sm">
                <CampoDrawer rotulo="Produto atual">
                  {produtoDetalhe ? `${produtoDetalhe.nome}` : '—'}
                </CampoDrawer>
                <CampoDrawer rotulo="Lote em execução">
                  {detalhe.loteId ? <IdLink id={detalhe.loteId} /> : '—'}
                </CampoDrawer>
                <CampoDrawer rotulo="Ordem">
                  {detalhe.ordemId ? <IdLink id={detalhe.ordemId} /> : '—'}
                </CampoDrawer>
                <CampoDrawer rotulo="Velocidade">
                  {execucaoDetalhe ? `${formatNumero(execucaoDetalhe.velocidadeRealHora)} un/h` : '—'}
                </CampoDrawer>
                <CampoDrawer rotulo="Quantidade produzida">
                  {ordemDetalhe ? formatNumero(ordemDetalhe.produzido) : '—'}
                </CampoDrawer>
                <CampoDrawer rotulo="Perda acumulada">
                  {detalhe.perdaAcumuladaPercent !== undefined
                    ? formatPercent(detalhe.perdaAcumuladaPercent, 2)
                    : '—'}
                </CampoDrawer>
                <CampoDrawer rotulo="Próxima ordem">{detalhe.proximaOrdem ?? '—'}</CampoDrawer>
                <CampoDrawer rotulo="Previsão de término">
                  {detalhe.previsaoTermino ? formatHora(detalhe.previsaoTermino) : '—'}
                </CampoDrawer>
                {ordemDetalhe ? (
                  <CampoDrawer rotulo="Situação da ordem">
                    <StatusPill status={ordemDetalhe.situacao} pulsar={ordemDetalhe.situacao === 'Em risco'} />
                  </CampoDrawer>
                ) : null}
              </dl>
            ) : (
              <dl className="flex flex-col gap-2.5 border-y border-line py-3 text-body-sm">
                {(detalhe.indicadores ?? []).map((indicador) => (
                  <div key={indicador.nome} className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted">{indicador.nome}</dt>
                    <dd className="text-right font-semibold text-ink">{indicador.valor}</dd>
                  </div>
                ))}
              </dl>
            )}

            {detalhe.parametros?.length ? (
              <div>
                <p className="text-caption font-semibold uppercase tracking-wide text-muted">
                  Parâmetros críticos
                </p>
                <ul className="mt-2 flex flex-col gap-2">
                  {detalhe.parametros.map((parametro) => (
                    <li
                      key={parametro.nome}
                      className="flex items-center justify-between gap-2 rounded-xl border border-line bg-app/50 px-3 py-2"
                    >
                      <span className="min-w-0">
                        <span className="block text-caption text-muted">{parametro.nome}</span>
                        <span className="block text-body-sm font-semibold text-ink">{parametro.valor}</span>
                      </span>
                      <StatusPill
                        status={parametro.situacao}
                        tone={toneDaCondicao[parametro.situacao]}
                        pulsar={parametro.situacao === 'Crítico'}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {detalhe.equipamentos?.length ? (
              <div>
                <p className="text-caption font-semibold uppercase tracking-wide text-muted">
                  Condição dos equipamentos
                </p>
                <ul className="mt-2 flex flex-col gap-2">
                  {detalhe.equipamentos.map((equipamento) => (
                    <li key={equipamento.nome} className="flex items-center justify-between gap-2">
                      <span className="text-body-sm text-ink">{equipamento.nome}</span>
                      <StatusPill status={equipamento.condicao} tone={toneDaCondicao[equipamento.condicao]} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>

      <PageFooter />
    </>
  )
}
