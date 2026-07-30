import type { ConteudoCopilot, ParQA } from './types'

/**
 * Conteúdo do Copiloto Gemini por tela. A saudação usa o marcador {nome},
 * substituído pelo primeiro nome da persona atual. Os textos amarram os
 * quatro fios da história da demo: Ibuprofeno API/OF-045678, Compressora L12,
 * microparadas da L08 e blister da L15.
 */
export const conteudoCopilot: Record<string, ConteudoCopilot> = {
  '/': {
    tela: '/',
    perguntasSugeridas: ['Quais os maiores riscos da semana?', 'Quais produtos podem romper?', 'Qual o impacto financeiro em risco?'],
    saudacao: 'Bom dia, {nome}. Este é o resumo executivo da rede em 19/mai.',
    resumo:
      'As três fábricas operam com OEE de 78,6% e aderência de 92,1%. O ponto de atenção é Jacareí: a P27 concentra as ordens em risco da semana.',
    riscos: [
      '23 ordens em risco na rede, concentradas na P27 (Jacareí) — capacidade em 45%.',
      '7 rupturas projetadas de matérias-primas críticas nos próximos 7 dias, lideradas pelo Ibuprofeno API (1,4 dia de cobertura).',
    ],
    causas: [
      'P27 opera abaixo de 50% da capacidade desde 15/mai por indisponibilidade de equipamento.',
      'Consumo de Ibuprofeno API 15% acima do plano com lead time de reposição de 12 dias.',
    ],
    acoes: [
      'Realocar capacidade da P24 para apoiar a P27 durante a semana 20–26/mai.',
      'Antecipar a compra do insumo Ibuprofeno API antes de 20/mai.',
    ],
    impactos: [
      'Redução de 18 das 23 ordens em risco da rede.',
      'Ganho estimado de R$ 1,12 mi em atendimento preservado.',
    ],
    botoes: ['Simular cenário', 'Aprovar ajuste', 'Ver ordens críticas'],
  },
  '/planejamento': {
    tela: '/planejamento',
    perguntasSugeridas: ['Compare os cenários da semana', 'Quais SKUs correm risco de ruptura?', 'Quais os maiores riscos da semana?'],
    saudacao: 'Bom dia, {nome}. O plano da semana 20–26/mai precisa de ajustes.',
    resumo:
      'O plano-base atende 94% da demanda com 320 h de setup e 12 SKUs em risco de ruptura. O Cenário A eleva o atendimento a 97% com custo de R$ 180 mil.',
    riscos: [
      '12 SKUs com risco de ruptura no plano-base, concentrados em Analgésicos.',
      'Cobertura de Ibuprofeno API limita a carga da L12 a partir de 21/mai.',
      'L15 sem programação firme enquanto o blister Alu/Alu não é liberado.',
    ],
    causas: [
      'Demanda de Analgésicos 9% acima do previsto no S&OP de abril.',
      'Plano atual não considera transferência de campanha entre plantas.',
    ],
    acoes: [
      'Aplicar o Cenário A: transferir o Advil para Goiânia e liberar hora extra no sábado.',
      'Replanejar a L15 assim que o substituto do blister for homologado.',
    ],
    botoes: ['Comparar cenários', 'Aplicar Cenário A'],
  },
  '/sequenciamento': {
    tela: '/sequenciamento',
    perguntasSugeridas: ['Qual sequência minimiza setups?', 'Simule a parada da L12', 'Por que o OEE caiu?'],
    saudacao: 'Bom dia, {nome}. Estes são os insights da sequência da semana.',
    resumo:
      'A sequência vigente tem 28 setups (312 h). Reagrupar a família Analgésicos elimina 3 setups, libera 10,7 h de capacidade e captura R$ 210 mil.',
    riscos: [
      '1 conflito crítico: a cápsula gelatina do Apracur chega 26/mai, 09:00 — depois do início programado na L03.',
      '2 janelas de manutenção impactam prazos: Compressora L12 (23/mai, 08:00 – 16:00) e HVAC AHU-03 (21/mai).',
    ],
    causas: [
      'Alternância Analgésicos → Antitérmicos → Analgésicos na L08 adiciona 2 limpezas completas.',
      'Dorflex dividido em duas corridas na L05 exige setup extra de retomada.',
    ],
    acoes: [
      'Reagrupar a família Analgésicos — redução potencial de 3 setups (10,7 h).',
      'Confirmar a chegada da cápsula gelatina antes de publicar a sequência da L03.',
    ],
    botoes: ['Reagrupar Campanhas', 'Simular Parada', 'Aprovar Ajuste'],
  },
  '/execucao': {
    tela: '/execucao',
    perguntasSugeridas: ['Por que a velocidade da L08 caiu?', 'Qual o risco de atraso da OF-045678?', 'Prepare o resumo do turno'],
    saudacao: 'Bom dia, {nome}. O Turno A está com 4 linhas rodando e 1 parada.',
    resumo:
      'A OF-045678 avança a 68% na L12. A L08 preocupa: aderência de 45%. A L05 acumula microparadas nas últimas 2 h.',
    riscos: [
      'L08 com aderência abaixo do esperado (45%).',
      'Aumento de microparadas na L05 nas últimas 2 h.',
    ],
    causas: [
      'Ajustes frequentes por variação de peso alvo na L08.',
      'Instabilidade no alimentador da calandra na L05.',
    ],
    acoes: [
      'Ajustar velocidade alvo da L08 em +6% por 30 min.',
      'Inspecionar o alimentador da calandra da L05.',
    ],
    botoes: ['Simular Recuperação', 'Acionar Manutenção', 'Ajustar Prioridade'],
  },
  '/gemeo': {
    tela: '/gemeo',
    perguntasSugeridas: ['Simule a parada da L12', 'Por que o Cenário B não venceu?', 'Quais SKUs correm risco de ruptura?'],
    saudacao: 'Bom dia, {nome}. O gêmeo está calibrado com dados de 10:18.',
    resumo:
      'Cinco eventos estão prontos para simulação. Na comparação vigente, o Cenário A entrega 97% de atendimento com risco Baixo — o melhor resultado.',
    riscos: [
      'Parada de 8 h na L12 derrubaria o atendimento para 91% e atrasaria a OF-045678 em 6 h.',
      'Atraso de 48 h do Ibuprofeno API forçaria replanejamento completo da L12.',
    ],
    causas: [
      'Plano-base sem folga de capacidade nas linhas de Anápolis (utilização média de 86,6%).',
    ],
    acoes: [
      'Aplicar o Cenário A e recalcular o plano da semana.',
      'Simular a parada da L12 para validar o plano de contingência.',
    ],
    botoes: ['Simular parada da L12', 'Aplicar Cenário A'],
  },
  '/qualidade': {
    tela: '/qualidade',
    perguntasSugeridas: ['Como está a fila de QA?', 'Por que a L08 está com microparadas?', 'Prepare o resumo da reunião diária'],
    saudacao: 'Bom dia, {nome}. A fila de QA tem 6 lotes e 1 bloqueio ativo.',
    resumo:
      'O lote 2456789A (Buscopan) está com parâmetros dentro da faixa e aguarda apenas o laudo. O 2456793E (Apracur) segue bloqueado após reprovação.',
    riscos: [
      'Lote 2456791C (Neosaldina) em investigação há 3h32 — mesma causa das microparadas da L08.',
      'Reprovação do 2456793E pode exigir reprocesso e nova janela na L03.',
    ],
    causas: [
      'Variação de peso na L08 desloca resultados para o limite superior da especificação.',
      'Laudo do 2456789A pendente no laboratório desde 08:00.',
    ],
    acoes: [
      'Priorizar a liberação do lote 2456789A — destrava a embalagem da L12.',
      'Concluir a investigação do 2456791C junto com a análise das microparadas.',
    ],
    botoes: ['Priorizar lote 2456789A', 'Ver investigação'],
  },
  '/manutencao': {
    tela: '/manutencao',
    perguntasSugeridas: ['Qual o risco de falha da compressora?', 'Simule a parada da L12', 'Qual o plano de recuperação da OF-045678?'],
    saudacao: 'Bom dia, {nome}. Dois ativos exigem atenção imediata.',
    resumo:
      'A Compressora L12 opera em estado crítico (78% de falha em 7 dias) e a Seladora L15 aguarda peça. A preventiva do HVAC AHU-03 está atrasada.',
    riscos: [
      'Falha da Compressora L12 pararia a OF-045678 — impacto de R$ 180 mil.',
      'HVAC AHU-03 com preventiva vencida compromete a classificação de área.',
    ],
    causas: [
      'Rolamento do eixo principal da compressora com desgaste acelerado (▲35% de vibração).',
      'Janela da preventiva do HVAC perdida em 12/mai por prioridade da corretiva da L08.',
    ],
    acoes: [
      'Aprovar a OT-245689 na janela noturna de 21/mai — peças disponíveis em estoque.',
      'Executar a OT-245682 (HVAC) em 21/mai, 08:00, antes da auditoria interna.',
    ],
    botoes: ['Aprovar OT-245689', 'Ver saúde da Compressora L12'],
  },
  '/materiais': {
    tela: '/materiais',
    perguntasSugeridas: ['Qual a cobertura do Ibuprofeno?', 'Quando a L15 volta a operar?', 'Quais produtos podem romper?'],
    saudacao: 'Bom dia, {nome}. Dois materiais críticos pressionam o plano.',
    resumo:
      'Ibuprofeno API cobre 1,4 dia e o Blister Alu/Alu 10cp, 1,7 dia. A Sacarose está bloqueada aguardando CoA. Valor em risco: R$ 475 mil.',
    riscos: [
      'Ibuprofeno API abaixo do estoque de segurança (320 kg contra 500 kg).',
      'Blister Alu/Alu 10cp mantém a L15 parada — lead time de reposição é de 15 dias.',
    ],
    causas: [
      'Consumo de Ibuprofeno 15% acima do plano com a campanha de Buscopan.',
      'Fornecedor Alumipack com atraso recorrente nas últimas 3 entregas.',
    ],
    acoes: [
      'Priorizar transferência de Ibuprofeno API de Goiânia — chega em 24 h.',
      'Liberar o blister substituto homologado e retomar a L15 em 21/mai.',
    ],
    botoes: ['Priorizar transferência', 'Liberar substituto'],
  },
  '/custos': {
    tela: '/custos',
    perguntasSugeridas: ['Por que o OEE caiu?', 'Qual o impacto financeiro em risco?', 'Qual sequência minimiza setups?'],
    saudacao: 'Bom dia, {nome}. As perdas do dia somam R$ 620 mil.',
    resumo:
      'O custo do dia está 3,2% acima do orçamento. Microparadas da L08 e a parada da L15 respondem por 62% das perdas.',
    riscos: [
      'Perdas de produção em R$ 620 mil (▲18% vs média da semana).',
      'Custo de setup em R$ 184 mil — sequência atual desperdiça 45 h.',
    ],
    causas: [
      'L08 com aderência de 45% converte capacidade paga em perda.',
      'L15 parada mantém custo fixo sem produção desde 20/mai.',
    ],
    acoes: [
      'Aplicar a sequência otimizada — reduz o custo de setup em R$ 26 mil na semana.',
      'Retomar a L15 com o blister substituto para diluir o custo fixo.',
    ],
    botoes: ['Ver perdas por linha', 'Comparar com orçamento'],
  },
  '/alertas': {
    tela: '/alertas',
    perguntasSugeridas: ['Qual o impacto financeiro em risco?', 'Simule a parada da L12', 'Qual o plano de recuperação da OF-045678?'],
    saudacao: 'Bom dia, {nome}. Há decisões críticas vencendo na próxima hora.',
    resumo:
      'O impacto em risco na rede chega a R$ 1,82 mi nas últimas 24 h. Os sete alertas de Anápolis somam R$ 1,34 mi — dois críticos na L12.',
    riscos: [
      'AL-006 (risco de atraso da OF-045678) escalado com SLA vencendo às 11:18.',
      'Materiais concentram R$ 720 mil do risco — Ibuprofeno API e blister Alu/Alu.',
    ],
    causas: [
      'Falta de Ibuprofeno API e vibração da compressora convergem na L12.',
      'Fila de aprovação cresceu 2 itens na última hora — gargalo em Aprovações (80%).',
    ],
    acoes: [
      'Decidir primeiro o AL-006: simule o impacto e aprove o plano combinado.',
      'Aprovar a transferência de API (AL-001) elimina a causa comum de dois alertas.',
    ],
    botoes: ['Simular impacto', 'Convocar war room', 'Aprovar plano'],
  },
  '/relatorios': {
    tela: '/relatorios',
    perguntasSugeridas: ['Prepare o resumo da reunião diária', 'Quais os maiores riscos da semana?', 'Por que o OEE caiu?'],
    saudacao: 'Bom dia, {nome}. O resumo da reunião diária está pronto para gerar.',
    resumo:
      'Oito relatórios disponíveis, três gerados hoje. O painel executivo da semana destaca R$ 1,34 mi em risco mapeado.',
    riscos: [
      'Relatório de aderência semanal mostrará a L08 abaixo de 50% pela segunda semana.',
    ],
    causas: [
      'Microparadas da L08 e parada da L15 dominam os desvios da semana.',
    ],
    acoes: [
      'Gerar o resumo diário com os três riscos principais para a reunião das 11:00.',
      'Exportar o OEE por linha para anexar ao painel executivo.',
    ],
    botoes: ['Gerar resumo diário', 'Exportar OEE por linha'],
  },
  '/agentes': {
    tela: '/agentes',
    perguntasSugeridas: ['O que os agentes propuseram hoje?', 'Qual a cobertura do Ibuprofeno?', 'Quais os maiores riscos da semana?'],
    saudacao: 'Bom dia, {nome}. Os agentes propuseram 4 ações hoje.',
    resumo:
      'Nove agentes ativos concluíram 173 tarefas hoje com SLA médio de 97,7%. A ação de maior impacto — antecipar a compra de Ibuprofeno API — evita R$ 780 mil.',
    riscos: [
      'Ação ACA-001 (compra de Ibuprofeno) perde efeito se aprovada depois de 20/mai.',
      'Agente de Auditoria em treinamento — decisões N4 sem trilha completa até 26/mai.',
    ],
    causas: [
      'Lead time de 12 dias do fornecedor exige decisão antecipada.',
    ],
    acoes: [
      'Aprovar a ação do Agente de Materiais dentro do SLA.',
      'Revisar a fila de ações pendentes antes da reunião diária.',
    ],
    botoes: ['Aprovar ação de Materiais', 'Ver histórico de ações'],
  },
  '/configuracoes': {
    tela: '/configuracoes',
    perguntasSugeridas: ['O que os agentes propuseram hoje?', 'Prepare o resumo da reunião diária', 'Qual o impacto financeiro em risco?'],
    saudacao: 'Bom dia, {nome}. A configuração da plataforma está saudável.',
    resumo:
      'Três personas ativas, seis integrações conectadas e dois agentes operando em autonomia N4. A última sincronização com o SAP foi às 10:12.',
    riscos: [
      'Política de aprovação em lote não cobre ações de agentes N4 acima de R$ 500 mil.',
    ],
    causas: [
      'Limite de alçada definido antes da ativação do Agente de Materiais em N4.',
    ],
    acoes: [
      'Revisar o limite de alçada das ações N4 com a Administradora.',
      'Agendar teste de contingência da integração SAP para 23/mai.',
    ],
    botoes: ['Revisar autonomia', 'Testar integração SAP'],
  },
}

/** Fontes fictícias citadas nas respostas do assistente. */
export const FONTES_COPILOT = ['MES L12', 'SAP PP', 'LIMS', 'POP-042', 'Histórico de manutenção'] as const

/**
 * Banco de perguntas e respostas do assistente. O matching é por
 * palavras-chave (minúsculas, sem acento não é necessário — a busca da UI
 * normaliza antes de comparar).
 */
export const bancoQA: ParQA[] = [
  {
    id: 'qa-01',
    palavrasChave: ['maiores riscos', 'riscos da semana', 'principais riscos'],
    resposta:
      'Os três maiores riscos da semana são: (1) cobertura de 1,4 dia de Ibuprofeno API, que ameaça a OF-045678 na L12 com impacto de R$ 420 mil; (2) probabilidade de falha de 78% da Compressora L12 em 7 dias; (3) aderência de 45% na L08 por microparadas. Somados aos demais alertas, o impacto mapeado chega a R$ 1,34 mi.',
    fontes: ['SAP PP', 'MES L12', 'Histórico de manutenção'],
  },
  {
    id: 'qa-02',
    palavrasChave: ['oee caiu', 'por que o oee', 'queda do oee'],
    resposta:
      'O OEE de Anápolis caiu 2,1 p.p. na semana, para 68,4%. A decomposição mostra: microparadas da L08 respondem por 1,2 p.p., a parada da L15 por falta de blister por 0,6 p.p. e a disponibilidade reduzida da Compressora L12 (72%) pelos 0,3 p.p. restantes. Na visão de rede, o consolidado das três fábricas está em 78,6% (▲5,4 p.p.), sustentado por Goiânia.',
    fontes: ['MES L12', 'SAP PP'],
  },
  {
    id: 'qa-03',
    palavrasChave: ['sequência minimiza', 'minimiza setups', 'menos setups', 'otimizar sequência'],
    resposta:
      'A sequência otimizada agrupa por família: na L08, a Novalgina roda logo após a Neosaldina com troca rápida de 30 min, e na L05 o Dorflex vira corrida única — 3 setups eliminados e 10,7 h de capacidade liberadas em Anápolis (setup de 312 h para 301,3 h). No plano consolidado da rede, o Cenário A leva as horas de setup de 320 h para 275 h.',
    fontes: ['SAP PP', 'POP-042'],
  },
  {
    id: 'qa-04',
    palavrasChave: ['simule a parada', 'parada da l12', 'se a l12 parar'],
    resposta:
      'Simulação de parada de 8 h na L12: o atendimento da semana cai de 94% para 91%, a OF-045678 atrasa 6 h e o impacto financeiro estimado é de R$ 510 mil. Mitigação recomendada: antecipar a preditiva (OT-245689) para 21/mai à noite e transferir o Advil para Goiânia — o atraso cai para zero com custo de R$ 180 mil.',
    fontes: ['MES L12', 'Histórico de manutenção'],
    acao: { rotulo: 'Abrir simulador', tipo: 'abrir-simulador', eventoId: 'EV-001' },
  },
  {
    id: 'qa-05',
    palavrasChave: ['cenário b', 'por que o cenário', 'cenário recomendado', 'comparação de cenários', 'compare os cenários'],
    resposta:
      'O recomendado é o Cenário A, não o B. O Cenário B (só hora extra no sábado) custa menos — R$ 95 mil contra R$ 180 mil — mas deixa 6 SKUs em ruptura e risco Médio. O Cenário A adiciona a transferência de campanha para Goiânia: atendimento de 97%, 4 SKUs em ruptura, OEE projetado de 73% e risco Baixo. O ganho de atendimento paga o custo adicional.',
    fontes: ['SAP PP'],
  },
  {
    id: 'qa-06',
    palavrasChave: ['produtos podem romper', 'risco de ruptura', 'quais skus', 'ruptura de estoque'],
    resposta:
      'No plano-base, 12 SKUs correm risco de ruptura na semana. Os mais expostos: Buscopan Composto (depende do Ibuprofeno API, cobertura de 1,4 dia), Advil (mesmo API) e Rinosoro (parado na L15 por blister). Com o Cenário A aplicado, a lista cai para 4 SKUs, todos com ruptura inferior a 2 dias.',
    fontes: ['SAP PP'],
  },
  {
    id: 'qa-07',
    palavrasChave: ['resumo da reunião', 'reunião diária', 'prepare o resumo', 'daily'],
    resposta:
      'Resumo para a reunião diária de 19/mai: (1) OEE 68,4%, ▼2,1 p.p.; (2) 4 ordens em execução, OF-045678 a 68%; (3) riscos críticos: Ibuprofeno API 1,4 dia, Compressora L12 com 78% de falha, L08 a 45% de aderência; (4) decisões pendentes: 12, sendo o alerta escalado AL-006 com SLA às 11:18; (5) recomendação: aprovar transferência de API, antecipar OT-245689 e aplicar sequência otimizada.',
    fontes: ['MES L12', 'SAP PP', 'LIMS'],
  },
  {
    id: 'qa-08',
    palavrasChave: ['plano de recuperação', 'recuperar a of-045678', 'recuperação da l12'],
    resposta:
      'Plano de recuperação da OF-045678: (1) transferir 400 kg de Ibuprofeno API de Goiânia — chega em 24 h e eleva a cobertura para 3,2 dias; (2) antecipar a preditiva da compressora para 21/mai, 22:00, reduzindo a probabilidade de falha de 78% para 12%; (3) manter o lote 2456789A priorizado na QA para não travar a embalagem. Com os três passos, a entrega de 22/mai, 16:00 fica preservada.',
    fontes: ['SAP PP', 'MES L12', 'LIMS'],
  },
  {
    id: 'qa-09',
    palavrasChave: ['status da of-045678', 'como está a of-045678', 'buscopan l12', 'risco de atraso da of-045678', 'atraso da of-045678'],
    resposta:
      'OF-045678 (Buscopan Composto, L12): em execução com 68% de progresso — 820.560 de 1.200.000 comprimidos. Janela: 20/mai, 08:00 a 22/mai, 16:00. Prontidão de materiais em 100%, operador João Santos. Risco ativo: cobertura de Ibuprofeno API de 1,4 dia; alerta AL-006 escalado com impacto de R$ 510 mil.',
    fontes: ['MES L12', 'SAP PP'],
  },
  {
    id: 'qa-10',
    palavrasChave: ['ibuprofeno', 'cobertura do ibuprofeno', 'quando chega o api'],
    resposta:
      'Ibuprofeno API (MAT-API-001): 320 kg em estoque, cobertura de 1,4 dia com consumo de 220 kg/dia (▲15%). Estoque de segurança é 500 kg e o lead time do fornecedor PharmaQuímica é de 12 dias — compra nova não chega a tempo. A ação recomendada é a transferência entre plantas (24 h) e a antecipação da compra para proteger as próximas semanas, que evita risco de R$ 780 mil.',
    fontes: ['SAP PP'],
  },
  {
    id: 'qa-11',
    palavrasChave: ['vibração', 'compressora', 'risco de falha', 'saúde da l12'],
    resposta:
      'A Compressora L12 vibra a 12,3 mm/s (▲35% sobre o baseline) com temperatura de 86,4 °C (▲12%). O modelo preditivo indica 78% de probabilidade de falha em 7 dias, por desgaste do rolamento do eixo principal. Há 3 peças críticas em estoque e a OT-245689 está aberta para a janela de 21/mai, 22:00 — antecipá-la reduz a probabilidade para 12%.',
    fontes: ['Histórico de manutenção', 'MES L12'],
  },
  {
    id: 'qa-12',
    palavrasChave: ['aderência da l08', 'microparadas', 'por que a l08', 'velocidade da l08'],
    resposta:
      'A L08 opera com aderência de 45% por causa de 23 microparadas desde as 06:00. Causa raiz: variação de peso alvo da Neosaldina, que dispara ajustes frequentes, agravada pelo tensionamento da esteira transportadora. A OT-245683 (corretiva) está em execução com conclusão prevista para 14:00; o lote 2456791C está em investigação pela mesma causa.',
    fontes: ['MES L12', 'LIMS', 'POP-042'],
  },
  {
    id: 'qa-13',
    palavrasChave: ['l15', 'blister', 'quando a l15 volta'],
    resposta:
      'A L15 está parada desde 20/mai por criticidade do Blister Alu/Alu 10cp: cobertura de 1,7 dia e prontidão da OF-045682 (Rinosoro) em 62%. O lead time de reposição é de 15 dias, então a saída rápida é liberar o blister substituto homologado — com isso a linha retoma em 21/mai e a OF-045682 termina dentro da semana.',
    fontes: ['SAP PP', 'POP-042'],
  },
  {
    id: 'qa-14',
    palavrasChave: ['lotes aguardando', 'fila de qa', 'liberação de lotes'],
    resposta:
      'A fila de QA tem 6 lotes: 2456789A (Buscopan, em análise, 2h18, prioridade Alta), 2456790B (Dorflex, aguardando documentação), 2456791C (Neosaldina, em investigação há 3h32), 2456792D (Benegrip Multi, liberado), 2456793E (Apracur, bloqueado após reprovação, 5h47) e 2456794F (Addera D3, em análise). O 2456789A tem todos os parâmetros dentro da faixa e aguarda apenas o laudo.',
    fontes: ['LIMS'],
  },
  {
    id: 'qa-15',
    palavrasChave: ['impacto financeiro', 'quanto está em risco', 'valor em risco'],
    resposta:
      'O impacto financeiro mapeado soma R$ 1,34 mi em 7 alertas ativos: risco de atraso da OF-045678 (R$ 510 mil), falta de Ibuprofeno API (R$ 420 mil), vibração da compressora (R$ 180 mil), lote aguardando QA (R$ 95 mil), setup acima do padrão na L08 (R$ 60 mil), blister da L15 (R$ 55 mil) e energia acima do baseline (R$ 18 mil).',
    fontes: ['SAP PP', 'MES L12'],
  },
  {
    id: 'qa-16',
    palavrasChave: ['agentes propuseram', 'ações dos agentes', 'fila de ações'],
    resposta:
      'Os agentes propuseram 4 ações hoje, todas pendentes: antecipar a compra de Ibuprofeno API (evita risco de R$ 780 mil), aplicar a sequência otimizada na L08 (reduz 45 h de setup), antecipar a preditiva da Compressora L12 para 21/mai (falha de 78% para 12%) e priorizar a liberação do lote 2456789A (libera R$ 95 mil). A primeira perde efeito se aprovada depois de 20/mai.',
    fontes: ['SAP PP', 'Histórico de manutenção', 'LIMS'],
  },
]

/** Resposta usada quando nenhuma palavra-chave corresponde à pergunta. */
export const RESPOSTA_PADRAO_QA =
  'Ainda não tenho essa análise no mockup. Posso falar sobre: riscos da semana, OEE, setups, rupturas, cenários e manutenção.'

/** Análise de trade-offs exibida no passo de comparação do Simulador de Cenários. */
export const ANALISE_CENARIOS: [string, string] = [
  'O Cenário A entrega o maior atendimento (97%) e o melhor OEE projetado (73%) ao custo incremental de R$ 180 mil: a transferência do Advil para Goiânia libera 45 h na L08 e a hora extra de sábado absorve o atraso da L12. É a opção recomendada quando a prioridade é proteger o nível de serviço das contas-chave.',
  'O Cenário B custa quase metade (R$ 95 mil), mas mantém 6 SKUs em risco de ruptura e OEE de 71% — o ganho fica limitado ao que a hora extra alcança sem redistribuir carga. Se o caixa da semana pesar mais que o atendimento, ele é defensável. A decisão é sua.',
]

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Matching por palavras-chave (sem acentos, caixa baixa). Em caso de mais de
 * um match, vence a palavra-chave mais longa — a mais específica.
 */
export function buscarResposta(pergunta: string): ParQA | null {
  const perguntaNormalizada = normalizar(pergunta)
  let melhor: ParQA | null = null
  let melhorPeso = 0
  for (const par of bancoQA) {
    for (const palavraChave of par.palavrasChave) {
      const chave = normalizar(palavraChave)
      if (perguntaNormalizada.includes(chave) && chave.length > melhorPeso) {
        melhor = par
        melhorPeso = chave.length
      }
    }
  }
  return melhor
}
