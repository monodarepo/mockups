# HPO — Hypera Production Optimizer (mockup)

## Produto
Torre de controle inteligente da produção farmacêutica da Hypera. Mockup navegável para demo
executiva. Ciclo: monitorar → prever → identificar riscos → simular → otimizar → recomendar →
aprovar → executar → aprender. Interface 100% em pt-BR. Sem backend: todos os dados vêm de
src/data e são determinísticos. A direção visual é a das referências do cliente (dashboard
enterprise claro, azul primário) — seguir exatamente, sem reinvenção estética.

## Comandos
npm run dev · npm run build (o build deve passar limpo sempre; sem `any`, sem warnings)

## Estrutura de pastas
src/components/ui      — primitivos (Card, Button, Badge, Tabs, Select, Tooltip, Modal, Drawer, Toast)
src/components/shared  — KpiCard, PageHeader, FilterBar, DataTable, StatusPill, TrendDelta,
                         Sparkline, ScoreDonut, MiniBarList, SectionCard, CopilotPanel, FactoryMap
src/components/layout  — AppShell, Sidebar, Header
src/features/<tela>    — uma pasta por tela
src/data               — mocks centralizados (única fonte de dados; telas nunca criam dados locais)
src/store              — zustand (filtros globais, pendências, aprovações, cenário ativo, toasts)
src/lib                — format.ts, series.ts, colors.ts

## Rotas e menu lateral (nesta ordem)
/ Visão Geral · /planejamento Planejamento · /sequenciamento Sequenciamento · /execucao Execução ·
/gemeo Gêmeo da Fábrica · /qualidade Qualidade · /manutencao Manutenção · /materiais Materiais ·
/custos Custos e Performance · /alertas Alertas e Decisões (badge vermelho com store.pendencias,
inicia em 12) · /relatorios Relatórios · /agentes Agentes IA · /configuracoes Configurações
Sidebar recolhível (botão "Recolher" no rodapé). Logo: símbolo em cruz farmacêutica multicolorida +
"Hypera" e, abaixo, "PRODUCTION OPTIMIZER" em caps de 10px.

## Design system
Fundo do app #F6F8FB · Card branco, borda #E6EBF2, radius 14px, sombra 0 1px 2px rgba(16,24,40,.06)
Primária #2563EB (hover #1D4ED8) · Texto #0F172A, secundário #64748B
Semânticas: sucesso #16A34A · atenção #F59E0B · crítico #DC2626 · info #0EA5E9 ·
setup #F97316 · limpeza/roxo #8B5CF6
Tipografia Inter — título de página 22px semibold; título de card 15px semibold; valor de KPI 28px
bold; corpo 13–14px; legendas 12px em #64748B
StatusPill (fundo suave + texto forte): Crítico/Alto/Reprovado = vermelho · Médio/Atenção/Pendente
= âmbar · Baixo/Normal/No prazo/Liberado/Aprovado = verde · Info/Planejada/Em análise = azul ·
Bloqueado/Pausado = cinza
Layout padrão de tela: PageHeader → FilterBar → fileira com 6–7 KpiCards → grid principal
(conteúdo ~2/3 à esquerda, CopilotPanel ~1/3 à direita) → seções secundárias → rodapé
"Dados atualizados em 19/05/2025 10:18".
Alvo 1440px; funcional a partir de 1280px; tabelas e Gantt com scroll interno, nunca overflow da
página. Ícones lucide 16–18px. Sem emojis na UI. Motion com moderação: transições de 150–200ms,
pulso apenas em status críticos e no selo "ao vivo"; respeitar prefers-reduced-motion.

## Voz e escrita da interface
Voz ativa e verbos concretos: botões dizem exatamente o que fazem ("Aprovar ajuste", nunca
"Enviar"). A mesma ação mantém o mesmo nome no fluxo inteiro: "Aprovar" gera toast "Aprovado".
Erros e vazios orientam a próxima ação, sem pedir desculpas. Registro profissional de operação
industrial farmacêutica, direto e sem floreio.

## Componentes — contratos
KpiCard: label, value, delta, deltaGoodWhen ('up'|'down'), sublabel ("vs última semana/hora/turno"),
sparklineData, tone — a cor do delta é contextual (aumento de perdas = vermelho mesmo com seta ▲).
FilterBar: Fábrica, Área, Turno, Período + selo "Atualizado em tempo real · Dados ao vivo" com
ponto verde pulsando. Lê e grava no store global.
CopilotPanel ("Copiloto Gemini", chip IA): saudação à persona; blocos RISCOS DETECTADOS (título
vermelho), CAUSAS PROVÁVEIS (âmbar), AÇÕES RECOMENDADAS (verde); 2–3 botões de ação contextuais;
input "Pergunte ao assistente…". Conteúdo por tela em src/data/copilot.ts. Recolhível.
DataTable: colunas tipadas, ordenação por clique, StatusPill, IDs como link (OF-, OT-, MAT-,
lotes), ação por linha opcional.

## Formatação pt-BR (sempre via src/lib/format.ts)
Milhar com ponto e decimal com vírgula: 1.256.840 · 92,4% · Moeda compacta: R$ 620 mil ·
R$ 1,84 mi · Pontos percentuais: "p.p." · Datas: 19/mai/2025 · Faixas de hora: 06:00 – 14:00

## Universo de dados (resumo; detalhes em src/data)
Fábricas: Anápolis (linhas L03 Cápsulas, L05 Drágeas, L08 Sólidos, L12 Comprimidos, L15 Pó) ·
Goiânia (P23–P26) · Jacareí (P27–P30).
Produtos (família): Buscopan Composto, Neosaldina, Dorflex, Novalgina (Analgésicos) · Benegrip
Multi, Apracur, Benegripe (Antigripais) · Tylenol 750mg, Advil (Antitérmicos) · Addera D3
(Vitaminas) · Rinosoro (Outros).
Ordens-âncora (cruzam todas as telas com o MESMO status): OF-045678 Buscopan/L12 · OF-045679
Neosaldina/L08 · OF-045680 Benegrip Multi/L03 · OF-045681 Dorflex/L05 · OF-045682 Rinosoro/L15 ·
OF-045683 Apracur/L03 · OF-045685 Tylenol/L05 · OF-045686 Novalgina/L08 · OF-045687 Advil/L08.
Fios da história da demo (coerentes em todas as telas e no copiloto):
(1) Ibuprofeno API com cobertura de 1,4 dia ameaça a OF-045678 na L12 — impacto R$ 420 mil;
(2) Compressora L12 com vibração 12,3 mm/s e 78% de probabilidade de falha em 7 dias;
(3) L08 com aderência de 45% por microparadas (variação de peso alvo);
(fio secundário) L15 parada por criticidade do Blister Alu/Alu 10cp (62% de prontidão).
Visões (papéis funcionais): Visão Executiva (diretoria industrial) · Visão PCP (planejamento e
sequenciamento — PADRÃO) · Visão Operações (execução, qualidade, manutenção, materiais) ·
Visão Administração (configurações e governança).
Nenhum dado exibe nome de pessoa. Operadores, responsáveis e aprovadores são sempre papéis
funcionais (ex.: "Operação L12 · Turno A", "Alçada: Suprimentos").
Linha do tempo única da simulação: hoje = 19/mai/2025, Turno A (06:00 – 14:00); semana de
planejamento 20–26/mai/2025. Nenhuma tela usa outra data-base.

## Regras de qualidade
NENHUM CONTROLE MORTO — todo elemento clicável (botão, filtro, link, ícone) executa uma ação
real no mockup, abre um conteúdo funcional ou navega com contexto. Se nada disso for possível,
o elemento não é renderizado.
Toda tela nasce populada e verossímil (zero estados vazios, zero lorem ipsum). Séries de gráfico
geradas por src/lib/series.ts com seed fixa (nunca Math.random puro) — recarregar a página nunca
muda um número. Interações principais têm feedback (hover, loading curto, toast). Foco de teclado
visível e aria-label em botões de ícone. Não usar imagens externas: mapas, planta da fábrica e
equipamentos são SVGs estilizados. Exceção aprovada pelo cliente: o logo oficial da Hypera Pharma
é um PNG embutido no bundle (src/assets), usado na sidebar no lugar da cruz farmacêutica.
