# Deploy no Google (Firebase Hosting)

O HPO é 100% estático — o build de produção em `dist/` não depende de backend nem de chamadas
de rede. O Firebase Hosting serve esse conteúdo com HTTPS e gera um link fixo para compartilhar
com o time: `https://<projeto>.web.app`.

A configuração já está no repositório (`firebase.json`): reescrita SPA para as 13 rotas
(`/planejamento`, `/execucao`, …) e cache imutável para os assets com hash.

## Primeira vez (uma única configuração)

1. Crie um projeto no [console do Firebase](https://console.firebase.google.com) — por exemplo
   `hpo-mockup` (o plano gratuito Spark é suficiente).
2. Na raiz do repositório, autentique e vincule o projeto:

```bash
npx firebase-tools login
npx firebase-tools use --add   # selecione o projeto e aceite o alias "default"
```

O `use --add` grava um `.firebaserc` local com o ID do projeto — pode ser commitado.

## Publicar (a cada versão)

```bash
npm run deploy
```

O script roda `npm run build` (tipos + bundle) e publica `dist/` no Hosting. Ao final, o CLI
imprime o link `https://<projeto>.web.app` — é esse o URL para o time.

## Notas de acesso

- O link é público, porém não listado nem indexado — o padrão adequado para um mockup de demo.
  Quem tem o URL acessa; não há login.
- Se a demo exigir restrição por conta corporativa, o caminho no Google é servir o mesmo `dist/`
  atrás do Identity-Aware Proxy (Cloud Run + IAP) — fora do escopo deste mockup.

## Deploy automático a cada push (opcional)

O Firebase gera a integração com GitHub Actions com um comando, criando o workflow e o secret
de deploy no repositório:

```bash
npx firebase-tools init hosting:github
```

Aponte para `monodarepo/mockups` e escolha o branch de produção. A partir daí, todo push
publica sozinho.
