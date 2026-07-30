/**
 * Glossário dos indicadores do HPO: definição de 1–2 frases, o ESCOPO do
 * número pela regra derivar-vs-fixar (amostra modelada vs universo da rede)
 * e a rota de aprofundamento do click-through do KpiCard.
 * O ⓘ de todo KPI responde com definição + escopo (testado no check:data).
 */

export interface EntradaGlossario {
  definicao: string
  escopo: string
  /** Tela de aprofundamento do indicador — o KpiCard navega para cá. */
  rota: string
}

export const glossarioKpis: Record<string, EntradaGlossario> = {
  // ── Visão Geral ────────────────────────────────────────────────────────────
  'vg-oee': {
    definicao: 'OEE (Overall Equipment Effectiveness) mede disponibilidade × performance × qualidade das linhas.',
    escopo: 'Média ponderada das 13 linhas da rede no Turno A; meta corporativa de 85%.',
    rota: '/execucao',
  },
  'vg-aderencia': {
    definicao: 'Percentual da produção executada conforme o plano-mestre, em volume e janela.',
    escopo: 'Rede completa no turno; o detalhe por ordem usa as 14 ordens modeladas da semana.',
    rota: '/planejamento',
  },
  'vg-ordens-risco': {
    definicao: 'Ordens com risco de atraso por material, ativo ou capacidade nos próximos 7 dias.',
    escopo: 'Universo de 23 ordens em risco na rede; as telas detalham as 14 modeladas.',
    rota: '/alertas',
  },
  'vg-capacidade': {
    definicao: 'Ocupação da capacidade produtiva instalada frente às horas planejadas.',
    escopo: 'Média das 13 linhas da rede na semana 20 – 26/mai.',
    rota: '/planejamento',
  },
  'vg-rupturas': {
    definicao: 'SKUs com projeção de ruptura de estoque no horizonte de 7 dias.',
    escopo: 'Universo de 7 rupturas projetadas; Materiais detalha os 10 itens modelados.',
    rota: '/materiais',
  },
  'vg-ganho': {
    definicao: 'Valor capturado pelas otimizações aprovadas (setup, energia, refugo e replanejamento).',
    escopo: 'Acumulado do mês na rede, consolidado pela Controladoria.',
    rota: '/custos',
  },

  // ── Planejamento ───────────────────────────────────────────────────────────
  'pl-aderencia': {
    definicao: 'Aderência do executado ao plano-mestre da semana, em volume por ordem.',
    escopo: 'Semana 20 – 26/mai na rede; a tabela mede as 14 ordens modeladas.',
    rota: '/execucao',
  },
  'pl-atendimento': {
    definicao: 'Percentual da demanda comercial atendida pelo plano vigente.',
    escopo: 'Carteira completa do horizonte de 4 semanas (W21 – W25).',
    rota: '/sequenciamento',
  },
  'pl-utilizacao': {
    definicao: 'Horas planejadas sobre horas disponíveis das linhas no horizonte.',
    escopo: 'As 13 linhas da rede; o plano por linha detalha horas por semana.',
    rota: '/sequenciamento',
  },
  'pl-skus-risco': {
    definicao: 'SKUs com ruptura projetada dentro das próximas 2 semanas.',
    escopo: 'Universo de 18 SKUs em risco; o card exibe os 5 modelados.',
    rota: '/materiais',
  },
  'pl-estoque': {
    definicao: 'Cobertura média projetada dos estoques de produto acabado, em dias.',
    escopo: 'Média das 5 fábricas do horizonte de planejamento.',
    rota: '/materiais',
  },
  'pl-setup': {
    definicao: 'Horas de setup embutidas no plano da semana — alvo do otimizador de sequência.',
    escopo: 'Semana 20 – 26/mai em Anápolis (312 h contra meta de 294 h).',
    rota: '/sequenciamento',
  },

  // ── Sequenciamento ─────────────────────────────────────────────────────────
  'sq-aderencia': {
    definicao: 'Percentual dos blocos executados na janela sequenciada, sem replanejamento.',
    escopo: 'Sequência vigente de Anápolis (L03 – L15) na semana 20 – 26/mai.',
    rota: '/execucao',
  },
  'sq-setups': {
    definicao: 'Quantidade de setups programados na sequência da semana.',
    escopo: 'Gantt de Anápolis; a otimização elimina 3 reagrupando a família Analgésicos.',
    rota: '/sequenciamento',
  },
  'sq-horas': {
    definicao: 'Total de horas de setup da sequência — tempo sem produzir entre campanhas.',
    escopo: 'Anápolis na semana; meta de 294 h contra 312 h planejadas.',
    rota: '/custos',
  },
  'sq-risco': {
    definicao: 'Ordens da sequência com conflito de material, manutenção ou capacidade.',
    escopo: 'Universo de 11 ordens em risco na rede; o Gantt marca as modeladas.',
    rota: '/alertas',
  },
  'sq-eficiencia': {
    definicao: 'Tempo produtivo sobre tempo total da sequência (produção ÷ produção+setup+limpeza).',
    escopo: 'Sequência vigente de Anápolis; sobe com a otimização aplicada.',
    rota: '/execucao',
  },
  'sq-ganho': {
    definicao: 'Valor capturável identificado pelo otimizador (setups, horas e ruptura evitada).',
    escopo: 'Semana 20 – 26/mai em Anápolis, estimado pelo Agente de Sequenciamento.',
    rota: '/custos',
  },

  // ── Execução ───────────────────────────────────────────────────────────────
  'ex-oee': {
    definicao: 'OEE do turno corrente: disponibilidade × performance × qualidade.',
    escopo: 'Linhas de Anápolis no Turno A (06:00 – 14:00); meta de 85%.',
    rota: '/custos',
  },
  'ex-producao': {
    definicao: 'Unidades boas produzidas no turno, somando todas as linhas ativas.',
    escopo: 'Anápolis no Turno A — contador ao vivo do MES.',
    rota: '/execucao',
  },
  'ex-aderencia': {
    definicao: 'Produção real sobre a produção planejada para o turno, hora a hora.',
    escopo: 'Anápolis no Turno A; o fio da L08 (45%) puxa a média para baixo.',
    rota: '/sequenciamento',
  },
  'ex-paradas': {
    definicao: 'Minutos de parada não planejada acumulados no turno.',
    escopo: 'As 5 linhas de Anápolis; o pareto detalha os 6 motivos modelados.',
    rota: '/manutencao',
  },
  'ex-refugo': {
    definicao: 'Percentual de unidades refugadas ou perdidas sobre o total produzido.',
    escopo: 'Anápolis no Turno A; limite de qualidade em 2%.',
    rota: '/qualidade',
  },
  'ex-ordens': {
    definicao: 'Ordens de produção com apontamento ativo neste momento.',
    escopo: 'Universo de 9 em execução na rede; a tabela exibe as 5 de Anápolis.',
    rota: '/planejamento',
  },

  // ── Gêmeo da Fábrica ───────────────────────────────────────────────────────
  'gm-eventos': {
    definicao: 'Eventos de risco prontos para simulação no gêmeo digital da planta.',
    escopo: 'Biblioteca da semana em Anápolis (parada de linha, ruptura, hora extra…).',
    rota: '/alertas',
  },
  'gm-cenarios': {
    definicao: 'Cenários alternativos comparados contra o plano-base no simulador.',
    escopo: 'Plano-base, Cenário A e Cenário B da semana 20 – 26/mai.',
    rota: '/gemeo',
  },
  'gm-oee': {
    definicao: 'OEE projetado caso o melhor cenário simulado seja aplicado ao plano.',
    escopo: 'Cenário A vs plano-base, calculado pelo gêmeo às 10:18.',
    rota: '/execucao',
  },
  'gm-atendimento': {
    definicao: 'Atendimento da demanda projetado pelo cenário recomendado.',
    escopo: 'Cenário A (97%) contra o plano-base (94%).',
    rota: '/planejamento',
  },
  'gm-custo': {
    definicao: 'Custo adicional estimado para executar o cenário simulado.',
    escopo: 'Plano-base ativo — o Cenário A adiciona custo de hora extra e transferência.',
    rota: '/custos',
  },
  'gm-confiabilidade': {
    definicao: 'Acurácia do modelo do gêmeo contra o realizado das últimas semanas.',
    escopo: 'Calibração de 19/mai às 10:18 com dados do MES de Anápolis.',
    rota: '/configuracoes',
  },

  // ── Qualidade ──────────────────────────────────────────────────────────────
  'qa-fila': {
    definicao: 'Lotes aguardando análise ou liberação da Qualidade.',
    escopo: 'Universo de 18 lotes na rede; a fila detalha os 6 de Anápolis.',
    rota: '/qualidade',
  },
  'qa-rft': {
    definicao: 'RFT (Right First Time): lotes aprovados de primeira, sem retrabalho ou desvio.',
    escopo: 'Últimos 30 dias na rede; meta corporativa de 95%.',
    rota: '/qualidade',
  },
  'qa-desvios': {
    definicao: 'Desvios de qualidade abertos aguardando investigação ou CAPA.',
    escopo: 'Rede completa; o ranking detalha os 6 tipos com 89 ocorrências em 7 dias.',
    rota: '/alertas',
  },
  'qa-inspecao': {
    definicao: 'Percentual de aprovação nas inspeções em processo (peso, dureza, visual).',
    escopo: 'Últimas 24 h nas linhas de Anápolis.',
    rota: '/execucao',
  },
  'qa-capas': {
    definicao: 'Ações corretivas e preventivas (CAPA) em andamento.',
    escopo: 'Rede completa, acompanhadas pelo time de Qualidade.',
    rota: '/qualidade',
  },
  'qa-criticos': {
    definicao: 'Alertas de qualidade com severidade crítica abertos agora.',
    escopo: 'Rede completa; a central de alertas detalha os modelados.',
    rota: '/alertas',
  },

  // ── Manutenção ─────────────────────────────────────────────────────────────
  'mn-ativos': {
    definicao: 'Equipamentos com monitoramento de condição (vibração, temperatura, energia).',
    escopo: 'Universo de 132 ativos na rede; o mapa detalha os 8 críticos de Anápolis.',
    rota: '/gemeo',
  },
  'mn-disponibilidade': {
    definicao: 'Tempo disponível para produzir sobre o tempo total dos ativos.',
    escopo: 'Frota monitorada da rede na última semana.',
    rota: '/execucao',
  },
  'mn-preditivos': {
    definicao: 'Alertas gerados pelos modelos preditivos de falha.',
    escopo: 'Rede completa; a tela detalha os 5 eventos de Anápolis.',
    rota: '/alertas',
  },
  'mn-ots': {
    definicao: 'Ordens de manutenção abertas na carteira (preventivas, corretivas e preditivas).',
    escopo: 'Universo de 28 OTs na rede; a fila exibe as 8 modeladas de Anápolis.',
    rota: '/manutencao',
  },
  'mn-mtbf': {
    definicao: 'MTBF (Mean Time Between Failures): tempo médio entre falhas dos ativos.',
    escopo: 'Frota monitorada, janela móvel de 90 dias.',
    rota: '/manutencao',
  },
  'mn-mttr': {
    definicao: 'MTTR (Mean Time To Repair): tempo médio para devolver o ativo à operação.',
    escopo: 'Corretivas da rede nos últimos 90 dias.',
    rota: '/manutencao',
  },
  'mn-preventiva': {
    definicao: 'Percentual do plano de preventivas executado dentro da janela.',
    escopo: 'Plano mensal da rede; a AHU-03 vencida derruba o índice.',
    rota: '/manutencao',
  },

  // ── Materiais ──────────────────────────────────────────────────────────────
  'mt-monitorados': {
    definicao: 'Materiais com cobertura acompanhada em tempo real (APIs, excipientes, embalagem).',
    escopo: 'Universo de 46 SKUs na rede; a tela detalha os 10 modelados de Anápolis.',
    rota: '/materiais',
  },
  'mt-prontidao': {
    definicao: 'Percentual das ordens da semana com todos os materiais disponíveis.',
    escopo: 'As 14 ordens modeladas da semana 20 – 26/mai.',
    rota: '/planejamento',
  },
  'mt-criticos': {
    definicao: 'Materiais com cobertura abaixo do estoque de segurança.',
    escopo: 'Universo de 5 críticos na rede; Ibuprofeno API e Blister Alu/Alu lideram.',
    rota: '/alertas',
  },
  'mt-ordens-risco': {
    definicao: 'Ordens de produção ameaçadas por falta de material.',
    escopo: 'As ordens-âncora impactadas — OF-045678 e OF-045682 à frente.',
    rota: '/sequenciamento',
  },
  'mt-cobertura': {
    definicao: 'Dias de produção cobertos pelo estoque atual, na média dos materiais.',
    escopo: 'Os 10 materiais modelados do almoxarifado de Anápolis.',
    rota: '/materiais',
  },
  'mt-vencimento': {
    definicao: 'Lotes de material com validade nos próximos 90 dias.',
    escopo: 'Almoxarifado da rede, priorizados por FEFO.',
    rota: '/qualidade',
  },
  'mt-otif': {
    definicao: 'OTIF (On Time In Full) dos fornecedores: entregas completas e no prazo.',
    escopo: 'Recebimentos da rede nos últimos 30 dias.',
    rota: '/materiais',
  },

  // ── Custos e Performance ───────────────────────────────────────────────────
  'cs-unitario': {
    definicao: 'Custo industrial médio por unidade boa produzida.',
    escopo: 'Anápolis no Turno A, consolidado por linha.',
    rota: '/custos',
  },
  'cs-turno': {
    definicao: 'Custo total do turno corrente: materiais, energia, mão de obra e overhead.',
    escopo: 'Anápolis no Turno A (06:00 – 14:00).',
    rota: '/custos',
  },
  'cs-orcamento': {
    definicao: 'Desvio do custo real contra o orçado no período.',
    escopo: 'Turno A de Anápolis; positivo significa acima do orçamento.',
    rota: '/custos',
  },
  'cs-margem': {
    definicao: 'Margem de contribuição: receita menos custos variáveis da produção do turno.',
    escopo: 'Anápolis no Turno A, por hora produzida.',
    rota: '/custos',
  },
  'cs-yield': {
    definicao: 'Yield: percentual de unidades boas sobre o total processado.',
    escopo: 'Linhas de Anápolis na média dos últimos 7 dias.',
    rota: '/qualidade',
  },
  'cs-perdas': {
    definicao: 'Valor perdido com refugo, retrabalho e paradas não planejadas.',
    escopo: 'Anápolis no turno; o pareto de drivers detalha os 6 maiores desvios.',
    rota: '/execucao',
  },
  'cs-ganho': {
    definicao: 'Ganho capturado pelas otimizações aplicadas no mês.',
    escopo: 'Rede completa, mês corrente — mesmo número da Visão Geral.',
    rota: '/agentes',
  },

  // ── Alertas e Decisões ─────────────────────────────────────────────────────
  'al-criticos': {
    definicao: 'Alertas com severidade crítica aguardando ação imediata.',
    escopo: 'Universo de 14 detectados hoje na rede; a central detalha os 7 modelados.',
    rota: '/alertas',
  },
  'al-pendentes': {
    definicao: 'Decisões recomendadas aguardando aprovação humana (badge do menu).',
    escopo: 'Fila global da rede — alertas e ações de agentes compartilham a fila.',
    rota: '/agentes',
  },
  'al-impacto': {
    definicao: 'Soma do impacto financeiro estimado dos alertas abertos.',
    escopo: 'Últimas 24 h na rede; o gráfico acumula o dia hora a hora.',
    rota: '/custos',
  },
  'al-ordens': {
    definicao: 'Ordens de produção afetadas pelos alertas ativos.',
    escopo: 'Rede completa; as ordens-âncora concentram os fios da história.',
    rota: '/sequenciamento',
  },
  'al-slas': {
    definicao: 'Alertas cujo prazo de decisão vence nas próximas 4 horas.',
    escopo: 'Fila da rede — o SLA de cada alerta consta na central.',
    rota: '/alertas',
  },
  'al-concluidas': {
    definicao: 'Ações de resposta concluídas hoje, da detecção à execução.',
    escopo: 'Rede completa; o funil de decisão mostra as etapas.',
    rota: '/agentes',
  },

  // ── Relatórios ─────────────────────────────────────────────────────────────
  'rl-gerados': {
    definicao: 'Relatórios gerados pela plataforma no mês corrente.',
    escopo: 'Rede completa; a biblioteca exibe os 10 modelados (+ criados na sessão).',
    rota: '/relatorios',
  },
  'rl-agendados': {
    definicao: 'Envios programados com destinatários e canal definidos.',
    escopo: 'Agendamentos ativos da biblioteca modelada.',
    rota: '/relatorios',
  },
  'rl-prazo': {
    definicao: 'Percentual dos envios agendados que saíram dentro da janela.',
    escopo: 'Últimos 30 dias na rede.',
    rota: '/relatorios',
  },
  'rl-leituras': {
    definicao: 'Aberturas de relatório pelos destinatários na semana.',
    escopo: 'Rede completa, 13 – 19/mai; o gráfico mostra a série diária.',
    rota: '/relatorios',
  },
  'rl-criticos': {
    definicao: 'Relatórios obrigatórios (GMP/auditoria) com geração em dia.',
    escopo: 'Conjunto regulatório da rede.',
    rota: '/configuracoes',
  },
  'rl-tempo': {
    definicao: 'Tempo médio para gerar um relatório sob demanda.',
    escopo: 'Pipeline da plataforma nos últimos 30 dias.',
    rota: '/configuracoes',
  },

  // ── Agentes IA ─────────────────────────────────────────────────────────────
  'ag-ativos': {
    definicao: 'Agentes de IA operando dentro do escopo aprovado pela governança.',
    escopo: 'Universo de 12 na rede; o catálogo exibe os 8 de Anápolis (+ criados).',
    rota: '/agentes',
  },
  'ag-acoes': {
    definicao: 'Ações executadas automaticamente pelos agentes hoje (níveis N3 – N4).',
    escopo: 'Rede completa desde as 00:00.',
    rota: '/agentes',
  },
  'ag-assertividade': {
    definicao: 'Percentual das propostas de agente confirmadas como corretas após execução.',
    escopo: 'Últimos 30 dias, todas as decisões auditadas.',
    rota: '/agentes',
  },
  'ag-aprovacao': {
    definicao: 'Propostas de agente aguardando decisão humana na fila.',
    escopo: 'Fila da rede; a tabela detalha as 4 ações modeladas de hoje.',
    rota: '/alertas',
  },
  'ag-resposta': {
    definicao: 'Tempo médio entre a detecção de um evento e a proposta do agente.',
    escopo: 'Rede completa no mês corrente.',
    rota: '/agentes',
  },
  'ag-ganho': {
    definicao: 'Valor gerado pelas decisões propostas por agentes e aprovadas.',
    escopo: 'Mês corrente na rede, validado pela Controladoria.',
    rota: '/custos',
  },

  // ── Configurações ──────────────────────────────────────────────────────────
  'cf-usuarios': {
    definicao: 'Usuários com acesso ativo à plataforma.',
    escopo: 'Rede completa, todos os perfis (128 contas).',
    rota: '/configuracoes',
  },
  'cf-visoes': {
    definicao: 'Visões (papéis funcionais) configuradas para navegação e alçadas.',
    escopo: 'Executiva, PCP, Operações e Administração.',
    rota: '/configuracoes',
  },
  'cf-integracoes': {
    definicao: 'Sistemas conectados trocando dados com o HPO.',
    escopo: 'SAP, MES, LIMS, WMS e historiador — todas ativas.',
    rota: '/configuracoes',
  },
  'cf-agentes': {
    definicao: 'Agentes de IA com escopo e autonomia configurados.',
    escopo: 'Os 9 agentes modelados de Anápolis.',
    rota: '/agentes',
  },
  'cf-politicas': {
    definicao: 'Políticas de governança aplicadas às decisões automatizadas.',
    escopo: 'Rede completa — trilha de auditoria íntegra.',
    rota: '/agentes',
  },
  'cf-uptime': {
    definicao: 'Disponibilidade da plataforma nos últimos 90 dias.',
    escopo: 'Ambiente de produção (região southamerica-east1).',
    rota: '/configuracoes',
  },

  // ── Supply (perspectiva da Visão Geral) ────────────────────────────────────
  'sp-otif': {
    definicao: 'OTIF (On Time In Full): pedidos entregues completos e no prazo ao cliente.',
    escopo: 'Expedições da rede nos últimos 30 dias.',
    rota: '/materiais',
  },
  'sp-servico': {
    definicao: 'Nível de serviço: linhas de pedido atendidas sem corte.',
    escopo: 'Carteira comercial da rede no mês.',
    rota: '/planejamento',
  },
  'sp-estoque': {
    definicao: 'Valor total imobilizado em estoque (MP, WIP e produto acabado).',
    escopo: 'Rede completa, posição de 19/mai.',
    rota: '/materiais',
  },
  'sp-cobertura': {
    definicao: 'Dias de venda cobertos pelo estoque de produto acabado.',
    escopo: 'CDs da rede na média dos SKUs ativos.',
    rota: '/materiais',
  },
  'sp-giro': {
    definicao: 'Giro de estoque: quantas vezes o estoque se renova por ano.',
    escopo: 'Rede completa, janela móvel de 12 meses.',
    rota: '/custos',
  },
  'sp-rupturas': {
    definicao: 'SKUs sem estoque disponível para venda em algum CD.',
    escopo: 'Universo de 7 rupturas projetadas na rede em 7 dias.',
    rota: '/materiais',
  },
  'sp-aderencia': {
    definicao: 'Aderência do abastecimento ao plano de distribuição.',
    escopo: 'Transferências fábrica → CD da semana.',
    rota: '/planejamento',
  },
  'sp-ocupacao': {
    definicao: 'Ocupação média dos armazéns e CDs da rede.',
    escopo: 'Os 4 CDs e 2 armazéns de fábrica modelados.',
    rota: '/materiais',
  },
  'sp-atrasos': {
    definicao: 'Cargas em trânsito com atraso contra a janela prometida.',
    escopo: 'Malha logística da rede, posição de 10:18.',
    rota: '/alertas',
  },
  'sp-leadtime': {
    definicao: 'Lead time médio do pedido à entrega no cliente.',
    escopo: 'Expedições da rede nos últimos 30 dias.',
    rota: '/planejamento',
  },
}
