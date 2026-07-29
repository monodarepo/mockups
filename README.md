# HPO — Hypera Production Optimizer

Mockup navegável da torre de controle inteligente da produção farmacêutica da Hypera.
Protótipo de alta fidelidade para demonstração executiva: 100% front-end, sem backend e sem
chamadas de rede em tempo de execução. Todos os números vêm de mocks determinísticos em
`src/data` — recarregar a página nunca muda um valor.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
```

Outros comandos:

```bash
npm run build    # checagem de tipos + build de produção em dist/
npm run preview  # serve o build de produção
npm run lint     # apenas a checagem de tipos
```

Requer Node.js 18 ou superior.

## Stack

Vite · React 18 · TypeScript · Tailwind CSS · react-router-dom · zustand · recharts ·
lucide-react · @dnd-kit · date-fns (locale pt-BR) · @fontsource/inter (fonte empacotada localmente).

## Estrutura

```
src/components/ui       primitivos de interface (Card, Button, Badge, Toast…)
src/components/shared   blocos reaproveitados entre telas (PageHeader, StatusPill…)
src/components/layout   AppShell, Sidebar e Header
src/features/<tela>     uma pasta por tela do menu lateral
src/data                mocks centralizados — única fonte de dados
src/store               estado global em zustand (filtros, pendências, toasts, persona)
src/lib                 format.ts, series.ts, colors.ts
```

As convenções de produto, design system e dados estão em [CLAUDE.md](./CLAUDE.md).

## Estado da construção

O shell (navegação, design system, filtros globais, personas e toasts) está pronto e as 13 rotas
respondem. As telas são entregues por etapa e as ainda não construídas exibem o cartão
"Em construção — Prompt N".
