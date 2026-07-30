import { ATUALIZADO_EM } from './constants'
import { alertaPorId } from './alertas'
import { acoesAgentes } from './agentes'
import type { SeveridadeAlerta } from './types'

/**
 * Notificações do sino do header — derivadas dos alertas do dia e da fila de
 * ações dos agentes. Horários ancorados no agora da simulação (19/mai, 10:18).
 */

export interface Notificacao {
  id: string
  titulo: string
  descricao: string
  hora: Date
  severidade: SeveridadeAlerta
  /** Rota de destino com contexto (?destaque= realça a linha). */
  destino: string
}

const hj = (hora: number, minuto: number) => new Date(2025, 4, 19, hora, minuto)

function deAlerta(id: string, hora: Date): Notificacao | undefined {
  const alerta = alertaPorId(id)
  if (!alerta) return undefined
  return {
    id: `not-${alerta.id}`,
    titulo: alerta.titulo,
    descricao: `${alerta.linhaId ?? 'Fábrica'} · ${alerta.area} · SLA ${alerta.slaHoras} h`,
    hora,
    severidade: alerta.severidade,
    destino: `/alertas?destaque=${alerta.id}`,
  }
}

function deAcaoAgente(id: string): Notificacao | undefined {
  const acao = acoesAgentes.find((item) => item.id === id)
  if (!acao) return undefined
  return {
    id: `not-${acao.id}`,
    titulo: `Agente recomenda: ${acao.titulo}`,
    descricao: `${acao.impacto} · ${acao.responsavel}`,
    hora: acao.criadaEm,
    severidade: 'Média',
    destino: '/agentes',
  }
}

/** As 8 notificações do dia, da mais recente para a mais antiga. */
export const notificacoes: Notificacao[] = [
  deAlerta('AL-006', hj(10, 6)),
  deAlerta('AL-001', hj(9, 47)),
  deAlerta('AL-002', hj(9, 32)),
  deAlerta('AL-003', hj(9, 30)),
  deAcaoAgente('ACA-001'),
  deAcaoAgente('ACA-002'),
  deAlerta('AL-004', hj(8, 24)),
  deAlerta('AL-005', hj(7, 41)),
].filter((notificacao): notificacao is Notificacao => notificacao !== undefined)

/** Agora da simulação — referência do tempo relativo ("há 12 min"). */
export const NOTIFICACOES_AGORA = ATUALIZADO_EM
