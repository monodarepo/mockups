# HPO — Roteiro de Demonstração v2 (10 passos)

Duração sugerida: 12–15 min. Data-base da simulação: **19/mai/2025, Turno A (06:00 – 14:00)**.
Fio condutor: as **fichas universais** — todo ID (OF-, MAT-, OT-, lote, ativo) é clicável e abre
a ficha da entidade, com os mesmos números em todas as telas. Os três fios da história:
**(1)** Ibuprofeno API com 1,4 dia de cobertura ameaçando a OF-045678 na L12 (R$ 420 mil),
**(2)** Compressora L12 com vibração de 12,3 mm/s e 78% de probabilidade de falha em 7 dias,
**(3)** L08 com aderência de 45% por microparadas.

## Atalhos de teclado

| Atalho | Ação |
| --- | --- |
| `Ctrl`/`⌘` + `K` | Abre a busca global (ordens, materiais, lotes, ativos, OTs e telas) |
| `↑` `↓` · `Enter` | Percorre e abre os resultados da busca |
| `Esc` | Fecha ficha, modal, simulador ou busca |
| `Tab` | Percorre os controles com anel de foco visível |
| `Enter` / `Espaço` | Aciona o controle focado (linha de tabela, KPI, card) |
| `Espaço` + `←` `→` no Gantt | Pega, move e solta um bloco da sequência |

---

## 1. Abertura — qualquer entidade a dois toques
Em qualquer tela, pressione **Ctrl+K** e digite **"Ibuprofeno"**. `Enter` abre a **ficha do
material MAT-API-001**: estoque 320 kg, cobertura de **1,4 dia**, lead time de 12 dias e as
ordens impactadas. Dentro da ficha, clique na **OF-045678** relacionada — a **ficha da ordem**
abre por cima, com o mesmo status "Em risco" que ela terá em todas as telas. Mensagem: *no HPO,
nenhum dado está a mais de dois toques.*

## 2. Ficha da OF-045678 — o contexto navega junto
Ainda na ficha da ordem: produto Buscopan Composto, linha L12, prontidão de materiais e o lote
vinculado. Clique em **[Ver no Sequenciamento]** — a ficha fecha e a tela abre com a ordem
**destacada** na sequência (o realce de 3 s vem do `?destaque=`). `Esc` limpa o caminho.

## 3. Visão Geral — o panorama executivo
Abra **/** e selecione a **Visão Executiva** no header. Percorra os KPIs, o mapa da rede
(Anápolis em "Atenção necessária") e o resumo do **Copiloto Gemini**: os riscos do dia são os
três fios da história. Na faixa inferior, **Prontidão de Materiais** mostra o Ibuprofeno API em
vermelho.

## 4. /materiais — a mesa de trabalho do insumo crítico
Navegue para **Materiais**. Na **Fila de Materiais Críticos**, demonstre a tabela de produto:
busque **"Ibuprofeno"** no campo da tabela, filtre a coluna **Status** por **Crítico** (funil no
cabeçalho, valores com contagem) e clique em **[CSV]** — o arquivo
`hpo-materiais-…-2025-05-19.csv` abre correto no Excel pt-BR. Limpe os filtros da tabela e
mostre as **Ordens Impactadas**: OF-045678 com atraso projetado de 6 h.

## 5. /alertas — da detecção à decisão
Vá para **Alertas e Decisões**. Abra o alerta crítico **"Falta de Ibuprofeno API"**
(R$ 420 mil): causa provável, impacto e alternativas com prós e contras. Clique em **[Simular]**.

## 6. Simulador — comparar e aprovar o Cenário A
O Simulador abre com o evento pré-selecionado. O **Cenário A** entrega 97% de atendimento,
4 SKUs a menos em ruptura e risco Baixo (selo Recomendado). Clique em **[Aprovar Cenário A]** —
toast "Cenário A aplicado ao plano", o badge de pendências decrementa e a decisão entra em
Próximas Aprovações.

## 7. /sequenciamento — o plano reage
O chip **"Cenário A ativo"** está no topo. Clique em **[Otimizar Sequência]**: −3 setups,
+10,7 h de capacidade, ganho de R$ 210 mil, com opção de desfazer. Arraste um bloco no Gantt
(mouse, ou `Espaço` + setas) e mostre o painel "Impacto da mudança".

## 8. /execucao — a mesma ordem, o mesmo status
Vá para **Execução**. A OF-045678 avança a 68% na L12. Clique no **ID da ordem** — a mesma
ficha do passo 1, com o mesmo status: *uma entidade, uma verdade*. Mostre a L08 com OEE de
52,4% e o pareto de microparadas — o fio 3 em números.

## 9. /manutencao — da OT à janela ótima do ativo
Navegue para **Manutenção**. Clique na **OT-245689** da fila — na ficha da OT, clique no ativo
**Compressora L12**: vibração 12,3 mm/s (▲35%), falha de 78% em 7 dias e a OT vinculada. Feche
e, no copiloto, clique em **[Acionar manutenção]**: a **OT-245690** entra no topo da fila,
programada para a janela de menor impacto — **quarta, 02:00 – 05:00** — recomendada pelo Agente
de Manutenção.

## 10. /agentes e /relatorios — governança e fechamento do ciclo
Em **Agentes IA**, aprove a ação **"Antecipar compra de Ibuprofeno API"** (evita risco de
R$ 780 mil): o KPI "Decisões em Aprovação" e o badge global decrementam na hora; a governança
mostra o donut 91% e a trilha de auditoria. Termine em **Relatórios**: **[Gerar resumo
executivo]** → preview com os mesmos números da demo inteira → **[Enviar para diretoria]** —
toast "Enviado para 8 destinatários". Ciclo completo: **monitorar → prever → simular → aprovar →
executar → aprender.**

---

### Passos bônus (se houver tempo)
- **Visão Geral → [Supply]**: a mesma torre, agora de ponta a ponta da cadeia — OTIF, mapa do
  site, fluxo de supply e nós logísticos.
- **/gemeo**: clique na área **Compressão (L12)** da planta interativa — o drawer traz o fio da
  compressora e **[Ver Manutenção]** navega com o ativo já selecionado.
- **/qualidade**: clique no lote **2456791C** — a ficha do lote encadeia com a ficha da ordem;
  **[Priorizar lote]** reordena a fila com toast.
- **Copiloto em qualquer tela**: pergunte *"simule a parada da L12"* — a resposta digitada
  oferece [Abrir simulador] no evento correspondente.
- **Rodapé de qualquer tela**: "Dados atualizados em 19/05/2025 10:18 · há 2 min" — a
  simulação inteira vive no mesmo instante.
