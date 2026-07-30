import {
  ATUALIZADO_EM,
  AREA_POR_LINHA,
  faixaDoPeriodo,
  type Area,
  type NomeFabrica,
  type Periodo,
  type Turno,
} from './constants'
import { fabricaPorId, linhaPorId, linhas } from './fabricas'
import { ordens } from './ordens'
import { alertas } from './alertas'
import { ordensManutencao } from './manutencao'
import { materiais } from './materiais'
import { lotes } from './lotes'
import { blocosSequencia } from './sequencia'
import { equipamentoPorId } from './equipamentos'
import type {
  Alerta,
  BlocoSequencia,
  Linha,
  Lote,
  Material,
  OrdemManutencao,
  OrdemProducao,
} from './types'

/**
 * Camada de seleção: funções puras (dados + filtros → resultado) que aplicam
 * o recorte global da FilterBar a cada coleção. Regras:
 *
 * — Fábrica e área derivam SEMPRE da linha do item (linha → fábrica e
 *   AREA_POR_LINHA). Item sem linha usa o vínculo direto que tiver
 *   (fabricaId do alerta/ativo) e só aparece em "Todas as áreas".
 * — Turno e período se aplicam a itens com janela de tempo (ordens, OTs,
 *   lotes): a janela de relevância precisa interceptar a faixa do período e
 *   tocar a banda horária do turno dentro dessa interseção. Um recorte
 *   impossível (ex.: Turno C × período "Turno atual") esvazia as listas.
 * — Itens abertos (ordem não concluída, OT em carteira, lote na fila) são
 *   relevantes desde o agora da simulação (19/mai 10:18) até o fim da janela;
 *   itens concluídos valem apenas pela janela real em que aconteceram.
 * — Coleções de estado (alertas, materiais, linhas) e o Gantt — que tem eixo
 *   de tempo próprio — respondem a fábrica e área; turno e período não se
 *   aplicam a elas.
 * — Nunca inventar dados para preencher um recorte: lista vazia é resposta
 *   válida e a tela mostra EmptyState.
 */

/** Subconjunto dos filtros globais que os seletores entendem. */
export interface FiltrosSelecao {
  fabrica: NomeFabrica
  area: Area
  turno: Turno
  periodo: Periodo
}

/** Agora da simulação — âncora da janela de relevância de itens abertos. */
const AGORA = ATUALIZADO_EM

/** Bandas horárias de cada turno; o Turno C cruza a meia-noite. */
const BANDAS_TURNO: Record<Turno, Array<[number, number]>> = {
  'Turno A (06:00 – 14:00)': [[6, 14]],
  'Turno B (14:00 – 22:00)': [[14, 22]],
  'Turno C (22:00 – 06:00)': [
    [22, 24],
    [0, 6],
  ],
}

/** Nome da fábrica dona da linha (L12 → Anápolis, P23 → Goiânia…). */
export function fabricaDaLinha(linhaId: string): NomeFabrica | undefined {
  const linha = linhaPorId(linhaId)
  if (!linha) return undefined
  return fabricaPorId(linha.fabricaId)?.nome as NomeFabrica | undefined
}

function passaFabricaPorLinha(linhaId: string | undefined, filtros: FiltrosSelecao, fallback?: string): boolean {
  if (linhaId) return fabricaDaLinha(linhaId) === filtros.fabrica
  if (fallback) return fabricaPorId(fallback)?.nome === filtros.fabrica
  return false
}

function passaAreaPorLinha(linhaId: string | undefined, filtros: FiltrosSelecao): boolean {
  if (filtros.area === 'Todas as áreas') return true
  return linhaId ? AREA_POR_LINHA[linhaId] === filtros.area : false
}

/** A janela [inicio, fim] toca a banda horária do turno em algum dia? */
function janelaTocaTurno(inicio: Date, fim: Date, turno: Turno): boolean {
  if (fim.getTime() <= inicio.getTime()) return false
  // Janela de um dia inteiro ou mais cobre qualquer banda.
  if (fim.getTime() - inicio.getTime() >= 24 * 60 * 60 * 1000) return true
  const bandas = BANDAS_TURNO[turno]
  const dia = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())
  while (dia.getTime() < fim.getTime()) {
    for (const [horaInicio, horaFim] of bandas) {
      const bandaInicio = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), horaInicio)
      const bandaFim = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), horaFim)
      if (bandaInicio.getTime() < fim.getTime() && bandaFim.getTime() > inicio.getTime()) return true
    }
    dia.setDate(dia.getDate() + 1)
  }
  return false
}

/** Interseção da janela do item com o período + checagem da banda do turno. */
function passaTempo(janelaInicio: Date, janelaFim: Date, filtros: FiltrosSelecao): boolean {
  const faixa = faixaDoPeriodo(filtros.periodo)
  const inicio = new Date(Math.max(janelaInicio.getTime(), faixa.inicio.getTime()))
  const fim = new Date(Math.min(janelaFim.getTime(), faixa.fim.getTime()))
  if (inicio.getTime() >= fim.getTime()) return false
  return janelaTocaTurno(inicio, fim, filtros.turno)
}

/** Item aberto é relevante do agora até o fim; concluído vale pela janela real. */
function janelaDeRelevancia(inicio: Date, fim: Date, concluido: boolean): { inicio: Date; fim: Date } {
  if (concluido) return { inicio, fim }
  return { inicio: new Date(Math.min(inicio.getTime(), AGORA.getTime())), fim }
}

// ── Seletores ────────────────────────────────────────────────────────────────

export function ordensFiltradas(filtros: FiltrosSelecao, lista: OrdemProducao[] = ordens): OrdemProducao[] {
  return lista.filter((ordem) => {
    if (!passaFabricaPorLinha(ordem.linhaId, filtros, ordem.fabricaId)) return false
    if (!passaAreaPorLinha(ordem.linhaId, filtros)) return false
    const janela = janelaDeRelevancia(ordem.inicio, ordem.fim, ordem.status === 'Concluída')
    return passaTempo(janela.inicio, janela.fim, filtros)
  })
}

/** Alertas são estado vivo do dia: respondem a fábrica e área. */
export function alertasFiltrados(filtros: FiltrosSelecao, lista: Alerta[] = alertas): Alerta[] {
  return lista.filter((alerta) => {
    if (!passaFabricaPorLinha(alerta.linhaId, filtros, alerta.fabricaId)) return false
    return passaAreaPorLinha(alerta.linhaId, filtros)
  })
}

export function otsFiltradas(filtros: FiltrosSelecao, lista: OrdemManutencao[] = ordensManutencao): OrdemManutencao[] {
  return lista.filter((ot) => {
    const equipamento = equipamentoPorId(ot.ativoId)
    if (!passaFabricaPorLinha(equipamento?.linhaId, filtros, equipamento?.fabricaId)) return false
    // Ativo sem linha (utilidades, granulação) usa a própria área do equipamento.
    const passaArea = equipamento?.linhaId
      ? passaAreaPorLinha(equipamento.linhaId, filtros)
      : filtros.area === 'Todas as áreas' || equipamento?.area === filtros.area
    if (!passaArea) return false
    const janela = janelaDeRelevancia(ot.janelaInicio, ot.janelaFim, ot.status === 'Concluída')
    return passaTempo(janela.inicio, janela.fim, filtros)
  })
}

/**
 * Materiais são posição de estoque do dia. O vínculo com fábrica/área vem das
 * linhas afetadas; material de almoxarifado central (sem linha afetada)
 * pertence a Anápolis e só aparece em "Todas as áreas".
 */
export function materiaisFiltrados(filtros: FiltrosSelecao, lista: Material[] = materiais): Material[] {
  return lista.filter((material) => {
    const linhasAfetadas = material.linhasAfetadas ?? []
    const passaFabrica =
      linhasAfetadas.length > 0
        ? linhasAfetadas.some((linhaId) => fabricaDaLinha(linhaId) === filtros.fabrica)
        : filtros.fabrica === 'Anápolis'
    if (!passaFabrica) return false
    if (filtros.area === 'Todas as áreas') return true
    return linhasAfetadas.some((linhaId) => AREA_POR_LINHA[linhaId] === filtros.area)
  })
}

export function lotesFiltrados(filtros: FiltrosSelecao, lista: Lote[] = lotes): Lote[] {
  return lista.filter((lote) => {
    if (!passaFabricaPorLinha(lote.linhaId, filtros)) return false
    if (!passaAreaPorLinha(lote.linhaId, filtros)) return false
    // A fila de QA é viva: o lote é relevante da entrada na fila até o agora.
    if (!lote.inicio) return true
    return passaTempo(lote.inicio, AGORA, filtros)
  })
}

export function linhasFiltradas(filtros: FiltrosSelecao, lista: Linha[] = linhas): Linha[] {
  return lista.filter((linha) => {
    if (fabricaPorId(linha.fabricaId)?.nome !== filtros.fabrica) return false
    return passaAreaPorLinha(linha.id, filtros)
  })
}

/** O Gantt tem eixo de tempo próprio: o recorte aplicável é fábrica + área. */
export function blocosFiltrados(filtros: FiltrosSelecao, lista: BlocoSequencia[] = blocosSequencia): BlocoSequencia[] {
  return lista.filter((bloco) => {
    if (!passaFabricaPorLinha(bloco.linhaId, filtros)) return false
    return passaAreaPorLinha(bloco.linhaId, filtros)
  })
}
