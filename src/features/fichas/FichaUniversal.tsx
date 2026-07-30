import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { StatusPill } from '@/components/shared/StatusPill'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { cn } from '@/lib/cn'
import {
  formatData,
  formatDiaMes,
  formatDiaSemana,
  formatDuracao,
  formatFaixaHoraria,
  formatHora,
  formatNumero,
  formatPercent,
  formatPercentAssinado,
  formatPontosPercentuais,
} from '@/lib/format'
import { useAppStore } from '@/store'
import {
  alertas,
  equipamentoPorId,
  fabricaPorId,
  linhaPorId,
  lotes,
  materiais,
  materialPorId,
  ordemPorId,
  otPorId,
  produtoPorId,
  type Lote,
  type Material,
  type OrdemManutencao,
  type OrdemProducao,
} from '@/data'

// ── Blocos comuns das fichas ─────────────────────────────────────────────────

function GradeCampos({ children }: { children: ReactNode }) {
  return <dl className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
}

function Campo({ rotulo, children, largo }: { rotulo: string; children: ReactNode; largo?: boolean }) {
  return (
    <div className={cn('min-w-0', largo && 'col-span-2')}>
      <dt className="text-caption text-muted">{rotulo}</dt>
      <dd className="mt-0.5 text-body-sm font-semibold text-ink">{children}</dd>
    </div>
  )
}

function TituloSecao({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 mt-5 border-t border-line pt-4 text-caption font-semibold uppercase tracking-wide text-muted">
      {children}
    </p>
  )
}

/**
 * Item do bloco "Relacionados": clique abre outra ficha (id) ou navega
 * com contexto (onClick).
 */
function ItemRelacionado({
  titulo,
  subtitulo,
  id,
  onClick,
}: {
  titulo: string
  subtitulo: string
  id?: string
  onClick?: () => void
}) {
  const abrirFicha = useAppStore((s) => s.abrirFicha)
  return (
    <button
      type="button"
      onClick={() => (onClick ? onClick() : id ? abrirFicha(id) : undefined)}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-xl border border-line bg-app/50 px-3 py-2 text-left',
        'transition-colors duration-150 hover:border-primary/40 hover:bg-primary-soft/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      )}
    >
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-body-sm font-medium text-primary">{titulo}</span>
        <span className="block truncate text-caption text-muted">{subtitulo}</span>
      </span>
      <ChevronRight size={14} className="shrink-0 text-muted" aria-hidden="true" />
    </button>
  )
}

/** Navegação cruzada: fecha a ficha e vai para a tela com contexto. */
function useIrPara() {
  const navigate = useNavigate()
  const fecharFicha = useAppStore((s) => s.fecharFicha)
  return (rota: string) => {
    fecharFicha()
    navigate(rota)
  }
}

// ── Ficha de Ordem ───────────────────────────────────────────────────────────

function CorpoOrdem({ ordem }: { ordem: OrdemProducao }) {
  const irPara = useIrPara()
  const produto = produtoPorId(ordem.produtoId)
  const materiaisDaOrdem = materiais.filter((material) => material.ordensAfetadas?.includes(ordem.id))
  const loteDaOrdem = lotes.find((lote) => lote.ordemId === ordem.id)
  const alertasDaOrdem = alertas.filter((alerta) => alerta.ordemId === ordem.id)

  return (
    <>
      <GradeCampos>
        <Campo rotulo="Produto" largo>
          {produto?.nome} <span className="font-normal text-muted">· {produto?.apresentacao}</span>
        </Campo>
        <Campo rotulo="Linha">{linhaPorId(ordem.linhaId)?.nome ?? ordem.linhaId}</Campo>
        <Campo rotulo="Fábrica">{fabricaPorId(ordem.fabricaId)?.nome ?? ordem.fabricaId}</Campo>
        <Campo rotulo="Início">
          {formatDiaMes(ordem.inicio)} {formatHora(ordem.inicio)}
        </Campo>
        <Campo rotulo="Término">
          {formatDiaMes(ordem.fim)} {formatHora(ordem.fim)}
        </Campo>
        <Campo rotulo="Quantidade">
          {formatNumero(ordem.quantidade)} {ordem.unidade}
        </Campo>
        <Campo rotulo="Produzido">
          {formatNumero(ordem.produzido)} {ordem.unidade}
        </Campo>
        <Campo rotulo="Prioridade">
          <StatusPill status={ordem.prioridade} />
        </Campo>
        <Campo rotulo="Situação">
          <StatusPill status={ordem.situacao} pulsar={ordem.situacao === 'Em risco'} />
        </Campo>
        <Campo rotulo="Progresso">
          <ProgressBar valor={ordem.progresso} tone={ordem.situacao === 'Em risco' ? 'danger' : 'primary'} />
        </Campo>
        <Campo rotulo="Prontidão de materiais">
          <ProgressBar
            valor={ordem.prontidaoMateriais}
            tone={ordem.prontidaoMateriais < 65 ? 'danger' : ordem.prontidaoMateriais < 80 ? 'warning' : 'success'}
          />
        </Campo>
        <Campo rotulo="Operação" largo>
          {ordem.operador}
        </Campo>
        {ordem.observacao ? (
          <Campo rotulo="Observação" largo>
            <span className="font-normal">{ordem.observacao}</span>
          </Campo>
        ) : null}
      </GradeCampos>

      {materiaisDaOrdem.length > 0 || loteDaOrdem || alertasDaOrdem.length > 0 ? (
        <>
          <TituloSecao>Relacionados</TituloSecao>
          <div className="flex flex-col gap-2">
            {materiaisDaOrdem.map((material) => (
              <ItemRelacionado
                key={material.id}
                id={material.id}
                titulo={material.nome}
                subtitulo={`${material.id} · cobertura ${formatNumero(material.coberturaDias, 1)} dias · ${material.status}`}
              />
            ))}
            {loteDaOrdem ? (
              <ItemRelacionado
                id={loteDaOrdem.id}
                titulo={`Lote ${loteDaOrdem.id}`}
                subtitulo={`${loteDaOrdem.status} · fila de QA da ${loteDaOrdem.linhaId}`}
              />
            ) : null}
            {alertasDaOrdem.map((alerta) => (
              <ItemRelacionado
                key={alerta.id}
                titulo={alerta.titulo}
                subtitulo={`${alerta.id} · ${alerta.severidade} · abrir na central de alertas`}
                onClick={() => irPara(`/alertas?destaque=${alerta.id}`)}
              />
            ))}
          </div>
        </>
      ) : null}
    </>
  )
}

// ── Ficha de Material ────────────────────────────────────────────────────────

function CorpoMaterial({ material }: { material: Material }) {
  const irPara = useIrPara()
  const alertasDoMaterial = alertas.filter((alerta) => alerta.materialId === material.id)

  return (
    <>
      <GradeCampos>
        <Campo rotulo="Categoria">{material.categoria}</Campo>
        <Campo rotulo="Fornecedor">{material.fornecedor}</Campo>
        <Campo rotulo="Estoque atual">
          {formatNumero(material.estoque)} {material.unidade}
        </Campo>
        <Campo rotulo="Cobertura">
          <span className={material.coberturaDias < 2 ? 'text-danger' : undefined}>
            {formatNumero(material.coberturaDias, 1)} {material.coberturaDias < 2 ? 'dia' : 'dias'}
          </span>
        </Campo>
        <Campo rotulo="Consumo">
          {material.consumoDia !== undefined ? `${formatNumero(material.consumoDia)} ${material.unidade}/dia` : '—'}
        </Campo>
        <Campo rotulo="Estoque de segurança">
          {material.estoqueSeguranca !== undefined
            ? `${formatNumero(material.estoqueSeguranca)} ${material.unidade}`
            : '—'}
        </Campo>
        <Campo rotulo="Lead time">{formatNumero(material.leadTimeDias)} dias</Campo>
        <Campo rotulo="Pedidos em aberto">
          {formatNumero(material.pedidosAbertos)} {material.unidade}
        </Campo>
        <Campo rotulo="Lote atual">{material.loteAtual ?? '—'}</Campo>
        <Campo rotulo="Validade do lote">
          {material.validadeLote ? formatData(material.validadeLote) : '—'}
        </Campo>
        <Campo rotulo="CoA">
          <StatusPill status={material.coa ?? 'Pendente'} tone={material.coa === 'Recebido' ? 'success' : 'warning'} />
        </Campo>
        <Campo rotulo="Prontidão">
          <ProgressBar
            valor={material.prontidaoPercent}
            tone={material.prontidaoPercent < 65 ? 'danger' : material.prontidaoPercent < 80 ? 'warning' : 'success'}
          />
        </Campo>
        <Campo rotulo="Variação de estoque">
          {formatPercentAssinado(material.variacaoEstoquePercent, 0)}{' '}
          <span className="font-normal text-muted">vs última semana</span>
        </Campo>
        <Campo rotulo="Próxima ação" largo>
          <span className="font-normal">{material.proximaAcao}</span>
        </Campo>
        {material.linhasAfetadas?.length ? (
          <Campo rotulo="Linhas afetadas" largo>
            {material.linhasAfetadas.join(' · ')}
          </Campo>
        ) : null}
      </GradeCampos>

      {(material.ordensAfetadas?.length ?? 0) > 0 || alertasDoMaterial.length > 0 ? (
        <>
          <TituloSecao>Relacionados</TituloSecao>
          <div className="flex flex-col gap-2">
            {material.ordensAfetadas?.map((ordemId) => {
              const ordem = ordemPorId(ordemId)
              const produto = ordem ? produtoPorId(ordem.produtoId) : undefined
              return (
                <ItemRelacionado
                  key={ordemId}
                  id={ordemId}
                  titulo={ordemId}
                  subtitulo={`${produto?.nome ?? '—'} · ${ordem?.linhaId ?? ''} · ${ordem?.status ?? ''}`}
                />
              )
            })}
            {alertasDoMaterial.map((alerta) => (
              <ItemRelacionado
                key={alerta.id}
                titulo={alerta.titulo}
                subtitulo={`${alerta.id} · ${alerta.severidade} · abrir na central de alertas`}
                onClick={() => irPara(`/alertas?destaque=${alerta.id}`)}
              />
            ))}
          </div>
        </>
      ) : null}
    </>
  )
}

// ── Ficha de Lote ────────────────────────────────────────────────────────────

function CorpoLote({ lote }: { lote: Lote }) {
  const produto = produtoPorId(lote.produtoId)

  return (
    <>
      <GradeCampos>
        <Campo rotulo="Produto" largo>
          {produto?.nome} <span className="font-normal text-muted">· {produto?.apresentacao}</span>
        </Campo>
        <Campo rotulo="Linha">{linhaPorId(lote.linhaId)?.nome ?? lote.linhaId}</Campo>
        <Campo rotulo="Prioridade">
          <StatusPill status={lote.prioridade} />
        </Campo>
        <Campo rotulo="Início da produção">
          {lote.inicio ? `${formatDiaMes(lote.inicio)} ${formatHora(lote.inicio)}` : '—'}
        </Campo>
        <Campo rotulo="Tempo na fila">
          {lote.esperaMinutos !== undefined ? formatDuracao(lote.esperaMinutos) : '—'}
        </Campo>
        <Campo rotulo="Time QA">{lote.analista}</Campo>
        <Campo rotulo="Resultado">
          {lote.resultado ? <StatusPill status={lote.resultado} /> : <span className="font-normal text-muted">Em andamento</span>}
        </Campo>
        <Campo rotulo="Próxima ação" largo>
          <span className="font-normal">{lote.proximaAcao}</span>
        </Campo>
        {lote.observacao ? (
          <Campo rotulo="Observação" largo>
            <span className="font-normal">{lote.observacao}</span>
          </Campo>
        ) : null}
      </GradeCampos>

      {lote.parametros?.length ? (
        <>
          <TituloSecao>Parâmetros críticos</TituloSecao>
          <div className="grid grid-cols-2 gap-2">
            {lote.parametros.map((parametro) => (
              <div key={parametro.nome} className="rounded-xl border border-line bg-app/50 px-3 py-2">
                <p className="text-caption text-muted">{parametro.nome}</p>
                <p className="text-body-sm font-semibold text-ink">{parametro.valor}</p>
                <p className="text-caption text-muted">Faixa: {parametro.faixa}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {lote.documentos?.length ? (
        <>
          <TituloSecao>Documentação</TituloSecao>
          <div className="flex flex-wrap gap-2">
            {lote.documentos.map((documento) => (
              <span
                key={documento.nome}
                className="flex items-center gap-2 rounded-pill border border-line bg-app/50 px-3 py-1.5 text-body-sm text-ink"
              >
                {documento.nome}
                <StatusPill status={documento.status} tone={documento.status === 'Recebido' ? 'success' : 'warning'} />
              </span>
            ))}
          </div>
        </>
      ) : null}

      {lote.ordemId ? (
        <>
          <TituloSecao>Relacionados</TituloSecao>
          <ItemRelacionado
            id={lote.ordemId}
            titulo={lote.ordemId}
            subtitulo={`Ordem de produção na ${lote.linhaId} · abrir ficha`}
          />
        </>
      ) : null}
    </>
  )
}

// ── Ficha de Ativo ───────────────────────────────────────────────────────────

function CorpoAtivo({ ativoId }: { ativoId: string }) {
  const ativo = equipamentoPorId(ativoId)
  const filaOts = useAppStore((s) => s.filaOts)
  if (!ativo) return null
  const otsDoAtivo = filaOts.filter((ot) => ot.ativoId === ativo.id)

  return (
    <>
      <GradeCampos>
        <Campo rotulo="Tipo">{ativo.tipo}</Campo>
        <Campo rotulo="Localização">
          {ativo.linhaId ? (linhaPorId(ativo.linhaId)?.nome ?? ativo.linhaId) : ativo.area}
        </Campo>
        <Campo rotulo="Disponibilidade">
          {formatPercent(ativo.disponibilidade, 0)}
          {ativo.variacaoDisponibilidade !== undefined ? (
            <span className="font-normal text-muted"> ({formatPontosPercentuais(ativo.variacaoDisponibilidade, 0)})</span>
          ) : null}
        </Campo>
        <Campo rotulo="Probabilidade de falha (7 dias)">
          {ativo.probabilidadeFalha !== undefined ? formatPercent(ativo.probabilidadeFalha, 0) : '—'}
          {ativo.nivelRiscoFalha ? <span className="font-normal text-muted"> · nível {ativo.nivelRiscoFalha}</span> : null}
        </Campo>
        <Campo rotulo="Última manutenção">
          {formatDiaMes(ativo.ultimaManutencaoData)} <span className="font-normal text-muted">· {ativo.ultimaManutencaoTipo}</span>
        </Campo>
        <Campo rotulo="Próxima preventiva">{formatDiaMes(ativo.proximaPreventiva)}</Campo>
        <Campo rotulo="Peças críticas em estoque">
          {formatNumero(ativo.pecasCriticasEstoque ?? 0)} {(ativo.pecasCriticasEstoque ?? 0) === 1 ? 'item' : 'itens'}
        </Campo>
      </GradeCampos>

      <TituloSecao>Indicadores de condição</TituloSecao>
      <div className="grid grid-cols-2 gap-2">
        {ativo.indicadores.map((indicador) => (
          <div key={indicador.nome} className="rounded-xl border border-line bg-app/50 px-3 py-2">
            <p className="text-caption text-muted">{indicador.nome}</p>
            <p className="text-body-sm font-semibold text-ink">
              {formatNumero(indicador.valor, Number.isInteger(indicador.valor) ? 0 : 1)} {indicador.unidade}
            </p>
            <StatusPill status={indicador.situacao} pulsar={indicador.situacao === 'Crítico'} />
          </div>
        ))}
      </div>

      {otsDoAtivo.length > 0 ? (
        <>
          <TituloSecao>Relacionados</TituloSecao>
          <div className="flex flex-col gap-2">
            {otsDoAtivo.map((ot) => (
              <ItemRelacionado
                key={ot.id}
                id={ot.id}
                titulo={ot.id}
                subtitulo={`${ot.tipo} · ${ot.status} · ${formatDiaSemana(ot.janelaInicio)} ${formatDiaMes(ot.janelaInicio)}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </>
  )
}

// ── Ficha de OT ──────────────────────────────────────────────────────────────

function CorpoOt({ ot }: { ot: OrdemManutencao }) {
  const equipamento = equipamentoPorId(ot.ativoId)

  return (
    <>
      <GradeCampos>
        <Campo rotulo="Ativo" largo>
          {equipamento?.nome ?? ot.ativoId} <span className="font-normal text-muted">· {equipamento?.tipo}</span>
        </Campo>
        <Campo rotulo="Tipo">{ot.tipo}</Campo>
        <Campo rotulo="Prioridade">
          <StatusPill status={ot.prioridade} />
        </Campo>
        <Campo rotulo="Janela" largo>
          {formatDiaSemana(ot.janelaInicio)} {formatDiaMes(ot.janelaInicio)} ·{' '}
          {formatFaixaHoraria(ot.janelaInicio, ot.janelaFim)}
        </Campo>
        <Campo rotulo="Responsável">{ot.responsavel}</Campo>
        <Campo rotulo="Localização">
          {equipamento?.linhaId ? (linhaPorId(equipamento.linhaId)?.nome ?? equipamento.linhaId) : (equipamento?.area ?? '—')}
        </Campo>
        <Campo rotulo="Descrição" largo>
          <span className="font-normal">{ot.descricao}</span>
        </Campo>
      </GradeCampos>

      <TituloSecao>Relacionados</TituloSecao>
      <ItemRelacionado
        id={ot.ativoId}
        titulo={equipamento?.nome ?? ot.ativoId}
        subtitulo={`${equipamento?.status ?? ''} · disponibilidade ${formatPercent(equipamento?.disponibilidade ?? 0, 0)} · abrir ficha`}
      />
    </>
  )
}

// ── Roteador da ficha ────────────────────────────────────────────────────────

/**
 * Ficha universal da entidade — drawer aberto por qualquer ID clicável do
 * app (store.abrirFicha), roteado pelo prefixo do ID.
 */
export function FichaUniversal() {
  const ficha = useAppStore((s) => s.fichaAberta)
  const fecharFicha = useAppStore((s) => s.fecharFicha)
  const abrirSimulador = useAppStore((s) => s.abrirSimulador)
  const priorizarLote = useAppStore((s) => s.priorizarLote)
  const priorizarOt = useAppStore((s) => s.priorizarOt)
  const acionarManutencao = useAppStore((s) => s.acionarManutencaoCompressora)
  const addToast = useAppStore((s) => s.addToast)
  const filaOts = useAppStore((s) => s.filaOts)
  const irPara = useIrPara()

  if (!ficha) return <Drawer aberto={false} onFechar={fecharFicha} titulo="Ficha" children={null} />

  if (ficha.tipo === 'ordem') {
    const ordem = ordemPorId(ficha.id)
    const produto = ordem ? produtoPorId(ordem.produtoId) : undefined
    return (
      <Drawer
        aberto
        onFechar={fecharFicha}
        titulo={ficha.id}
        descricao={`Ordem de produção · ${produto?.nome ?? ''}`}
        chip={ordem ? <StatusPill status={ordem.status} pulsar={ordem.situacao === 'Em risco'} /> : undefined}
        rodape={
          ordem ? (
            <>
              {ordem.status !== 'Planejada' ? (
                <Button variante="outline" tamanho="sm" onClick={() => irPara(`/execucao?destaque=${ordem.id}`)}>
                  Ver na Execução
                </Button>
              ) : null}
              {ordem.situacao === 'Em risco' ? (
                <Button variante="outline" tamanho="sm" onClick={() => { fecharFicha(); abrirSimulador('EV-001') }}>
                  Simular recuperação
                </Button>
              ) : null}
              <Button tamanho="sm" onClick={() => irPara(`/sequenciamento?destaque=${ordem.id}`)}>
                Ver no Sequenciamento
              </Button>
            </>
          ) : undefined
        }
      >
        {ordem ? <CorpoOrdem ordem={ordem} /> : <p className="text-body-sm text-muted">Ordem fora do universo modelado.</p>}
      </Drawer>
    )
  }

  if (ficha.tipo === 'material') {
    const material = materialPorId(ficha.id)
    return (
      <Drawer
        aberto
        onFechar={fecharFicha}
        titulo={material?.nome ?? ficha.id}
        descricao={`Material · ${ficha.id}`}
        chip={material ? <StatusPill status={material.status} pulsar={material.status === 'Crítico'} /> : undefined}
        rodape={
          material ? (
            <>
              <Button variante="outline" tamanho="sm" onClick={() => irPara(`/materiais?destaque=${material.id}`)}>
                Ver em Materiais
              </Button>
              <Button
                tamanho="sm"
                onClick={() =>
                  addToast({
                    titulo: 'Suprimentos acionado',
                    descricao: `${material.proximaAcao} — registrado na fila de abastecimento.`,
                    tone: 'success',
                  })
                }
              >
                Acionar suprimentos
              </Button>
            </>
          ) : undefined
        }
      >
        {material ? <CorpoMaterial material={material} /> : <p className="text-body-sm text-muted">Material fora do universo modelado.</p>}
      </Drawer>
    )
  }

  if (ficha.tipo === 'lote') {
    const lote = lotes.find((item) => item.id === ficha.id)
    return (
      <Drawer
        aberto
        onFechar={fecharFicha}
        titulo={`Lote ${ficha.id}`}
        descricao={`Fila de liberação de QA · ${lote ? (produtoPorId(lote.produtoId)?.nome ?? '') : ''}`}
        chip={lote ? <StatusPill status={lote.status} pulsar={lote.status === 'Em investigação'} /> : undefined}
        rodape={
          lote ? (
            <>
              <Button variante="outline" tamanho="sm" onClick={() => irPara(`/qualidade?destaque=${lote.id}`)}>
                Ver na Qualidade
              </Button>
              <Button tamanho="sm" onClick={() => priorizarLote(lote.id)}>
                Priorizar lote
              </Button>
            </>
          ) : undefined
        }
      >
        {lote ? <CorpoLote lote={lote} /> : <p className="text-body-sm text-muted">Lote fora do universo modelado.</p>}
      </Drawer>
    )
  }

  if (ficha.tipo === 'ativo') {
    const ativo = equipamentoPorId(ficha.id)
    return (
      <Drawer
        aberto
        onFechar={fecharFicha}
        titulo={ativo?.nome ?? ficha.id}
        descricao={`Ativo monitorado · ${ativo?.tipo ?? ''}`}
        chip={ativo ? <StatusPill status={ativo.status} pulsar={ativo.status === 'Crítico'} /> : undefined}
        rodape={
          ativo ? (
            <>
              {ativo.id === 'eq-compressora-l12' ? (
                <Button variante="outline" tamanho="sm" onClick={acionarManutencao}>
                  Acionar manutenção
                </Button>
              ) : null}
              <Button
                tamanho="sm"
                onClick={() =>
                  irPara(`/manutencao?ativo=${ativo.id}${ativo.otVinculada ? `&destaque=${ativo.otVinculada}` : ''}`)
                }
              >
                Ver Manutenção
              </Button>
            </>
          ) : undefined
        }
      >
        {ativo ? <CorpoAtivo ativoId={ativo.id} /> : <p className="text-body-sm text-muted">Ativo fora do universo modelado.</p>}
      </Drawer>
    )
  }

  const ot = filaOts.find((item) => item.id === ficha.id) ?? otPorId(ficha.id)
  return (
    <Drawer
      aberto
      onFechar={fecharFicha}
      titulo={ficha.id}
      descricao={`Ordem de manutenção · ${ot ? (equipamentoPorId(ot.ativoId)?.nome ?? '') : ''}`}
      chip={ot ? <StatusPill status={ot.status} pulsar={ot.status === 'Atrasada'} /> : undefined}
      rodape={
        ot ? (
          <>
            <Button variante="outline" tamanho="sm" onClick={() => irPara(`/manutencao?destaque=${ot.id}`)}>
              Ver Manutenção
            </Button>
            <Button tamanho="sm" onClick={() => priorizarOt(ot.id)}>
              Priorizar OT
            </Button>
          </>
        ) : undefined
      }
    >
      {ot ? <CorpoOt ot={ot} /> : <p className="text-body-sm text-muted">OT fora do universo modelado.</p>}
    </Drawer>
  )
}
