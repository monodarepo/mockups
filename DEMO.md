# HPO — Roteiro de Demonstração (10 passos)

Duração sugerida: 12–15 min. Data-base da simulação: **19/mai/2025, Turno A (06:00 – 14:00)**.
Os três fios da história atravessam o roteiro inteiro: **(1)** Ibuprofeno API com 1,4 dia de
cobertura ameaçando a OF-045678 na L12 (R$ 420 mil), **(2)** Compressora L12 com vibração de
12,3 mm/s e 78% de probabilidade de falha em 7 dias, **(3)** L08 com aderência de 45% por
microparadas.

---

## 1. Visão Geral — o panorama executivo
Abra **/** (persona muda para Ricardo Martins, Diretor). Percorra os 6 KPIs executivos e o mapa
da rede (Anápolis com "Atenção necessária"). Leia em voz alta o resumo do **Copiloto Gemini** à
direita: os riscos do dia já apontam os três fios da história.

## 2. O fio do Ibuprofeno aparece na Prontidão de Materiais
Ainda na Visão Geral, desça até **Prontidão de Materiais** (faixa inferior): o Ibuprofeno API
figura em vermelho com cobertura de 1,4 dia. Mensagem: *o HPO enxerga o risco antes da ruptura.*

## 3. /materiais — o detalhe do insumo crítico
Navegue para **Materiais**. O Ibuprofeno API está no topo da fila de críticos; o card de detalhe
mostra consumo 220 kg/dia (▲15%), estoque 320 kg (abaixo dos 500 kg de segurança), cobertura
1,4 dia, lead time de 12 dias e CoA pendente. Mostre as **Ordens Impactadas**: OF-045678 com
atraso projetado de 6 h.

## 4. /alertas — da detecção à decisão
Vá para **Alertas e Decisões**. Abra o alerta crítico **"Falta de Ibuprofeno API"** (R$ 420 mil):
o drawer traz causa provável, impacto operacional e alternativas. Clique em **[Simular]**.

## 5. Simulador — comparar e aprovar o Cenário A
O Simulador de Cenários abre com o evento pré-selecionado. Compare o plano-base com os cenários:
o **Cenário A** entrega 97% de atendimento, 4 SKUs em ruptura a menos e risco Baixo (selo
Recomendado). Clique em **[Aprovar Cenário A]** — toast "Cenário A aplicado ao plano", o badge
de pendências decrementa e a decisão entra em Próximas Aprovações.

## 6. /sequenciamento — o plano reage
Navegue para **Sequenciamento**: o chip **"Cenário A ativo"** está no topo. Clique em
**[Otimizar Sequência]**: os blocos se reorganizam (−3 setups · +10,7 h de capacidade · ganho de
R$ 210 mil) com opção de desfazer. Arraste um bloco no Gantt para mostrar o painel "Impacto da
mudança".

## 7. /execucao — acompanhar a OF-045678 no piso
Vá para **Execução**. A OF-045678 (Buscopan, L12) avança a 68% com eficiência de 82,3%. No
copiloto, clique em **[Aceitar]** numa recomendação — toast "registrada na trilha de auditoria".
Mostre a L08 com OEE de 52,4% e o pareto de microparadas — o fio 3 em números.

## 8. /manutencao — a janela ótima da Compressora L12
Navegue para **Manutenção**. O detalhe do ativo mostra vibração 12,3 mm/s (▲35%) e falha de 78%
em 7 dias. No copiloto, clique em **[Acionar manutenção]**: a **OT 245690** entra no topo da
fila, Programada para a janela de menor impacto — **quarta, 02:00 – 05:00** — recomendada pelo
Agente de Manutenção.

## 9. /agentes — governança com humano no circuito
Vá para **Agentes IA**. Na Fila de Ações, clique em **[Aprovar]** na ação **"Antecipar compra de
Ibuprofeno API"** (evita risco de R$ 780 mil): o KPI "Decisões em Aprovação" e o badge global
decrementam na hora. Feche com a Governança: donut 91%, trilha de auditoria íntegra e selos de
conformidade (LGPD | ISO 27001 | GMP).

## 10. /relatorios — fechar o ciclo com a diretoria
Termine em **Relatórios**. No copiloto, clique em **[Gerar resumo executivo]**: após a barra de
progresso (~2 s), o preview abre com os KPIs do dia, Produção vs Plano e os riscos e
recomendações — os mesmos números vistos na demo inteira. Clique em **[Enviar para diretoria]**
— toast "Enviado para 8 destinatários". Ciclo completo: **monitorar → prever → simular →
aprovar → executar → aprender.**

---

### Passos bônus (se houver tempo)
- **Visão Geral → [Supply]**: o seletor de perspectiva no topo troca a persona para Ricardo
  Martins (Diretor de Supply) e mostra OTIF, mapa do site, fluxo de supply e nós logísticos —
  a mesma torre de controle, agora de ponta a ponta da cadeia.
- **/gemeo**: clique na área **Compressão (L12)** da planta interativa — o drawer traz o fio da
  compressora e o botão **[Ver Manutenção]** navega com o ativo já selecionado.
- **Copiloto em qualquer tela**: pergunte *"simule a parada da L12"* — a resposta digitada
  oferece o botão [Abrir simulador] no evento correspondente.
- **/qualidade**: clique em **[Priorizar lote]** no 2456789A — a fila reordena com toast.
