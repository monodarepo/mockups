/**
 * check:smoke — parte de navegador (Playwright). Duas provas em um percurso:
 *
 * 1) Auditoria "nenhum controle morto": em cada uma das 13 rotas, coleta os
 *    clicáveis visíveis (button, link, controles nativos e cursor-pointer) e
 *    FALHA se algum não tiver handler React, href ou controle interativo
 *    interno. Imprime o relatório por rota.
 * 2) Smoke estendido: abre 1 ficha de cada tipo (OF, MAT, OT, lote, ativo),
 *    aplica e limpa o filtro de fábrica, busca via Ctrl+K e exporta 1 CSV —
 *    com console 100% limpo do início ao fim.
 *
 * Sobe o próprio vite dev em porta dedicada e encerra ao final.
 */
import { spawn } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { chromium } from 'playwright'

const PORTA = 5313
const BASE = `http://localhost:${PORTA}`
const ROTAS = [
  '/',
  '/planejamento',
  '/sequenciamento',
  '/execucao',
  '/gemeo',
  '/qualidade',
  '/manutencao',
  '/materiais',
  '/custos',
  '/alertas',
  '/relatorios',
  '/agentes',
  '/configuracoes',
]

const falhas = []
const errosConsole = []

// ---------------------------------------------------------------- servidor
const raiz = new URL('..', import.meta.url).pathname
const servidor = spawn(process.execPath, [`${raiz}node_modules/vite/bin/vite.js`, '--port', String(PORTA), '--strictPort'], {
  cwd: raiz,
  stdio: ['ignore', 'pipe', 'pipe'],
})
servidor.stderr.on('data', (dado) => process.stderr.write(dado))

async function esperarServidor() {
  for (let tentativa = 0; tentativa < 100; tentativa++) {
    try {
      const resposta = await fetch(BASE)
      if (resposta.ok) return
    } catch {
      /* servidor ainda subindo */
    }
    await new Promise((resolver) => setTimeout(resolver, 300))
  }
  throw new Error(`vite dev não respondeu em ${BASE}`)
}

/** Chromium pré-instalado do ambiente quando o launch padrão não resolve. */
async function abrirChromium() {
  try {
    return await chromium.launch()
  } catch {
    const base = '/opt/pw-browsers'
    const pasta = readdirSync(base).find((nome) => nome.startsWith('chromium-'))
    return chromium.launch({ executablePath: `${base}/${pasta}/chrome-linux/chrome` })
  }
}

// ---------------------------------------------------------------- auditoria
/**
 * Roda no navegador: varre os clicáveis visíveis e devolve os que não têm
 * ação alguma (sem handler React próprio ou herdado, sem href, sem controle
 * interativo interno). Elementos desabilitados comunicam estado e não contam.
 */
function auditarClicaveis() {
  const primarios = document.querySelectorAll(
    'button, a, summary, input, select, textarea, [role="button"], [role="link"]',
  )
  const candidatos = new Set(primarios)
  for (const el of document.body.querySelectorAll('*')) {
    if (getComputedStyle(el).cursor === 'pointer') candidatos.add(el)
  }

  const visivel = (el) => {
    if (el.closest('[aria-hidden="true"]')) return false
    const estilo = getComputedStyle(el)
    if (estilo.display === 'none' || estilo.visibility === 'hidden' || estilo.pointerEvents === 'none')
      return false
    const caixa = el.getBoundingClientRect()
    return caixa.width >= 2 && caixa.height >= 2
  }

  const propsReact = (el) => {
    const chave = Object.keys(el).find((nome) => nome.startsWith('__reactProps$'))
    return chave ? el[chave] : undefined
  }
  const NOMES_HANDLER = ['onClick', 'onMouseDown', 'onPointerDown', 'onChange', 'onInput', 'onKeyDown', 'onSubmit']
  const temHandlerProprio = (el) => {
    const props = propsReact(el)
    return Boolean(props && NOMES_HANDLER.some((nome) => typeof props[nome] === 'function'))
  }
  const interativoNativo = (el) => {
    const tag = el.tagName
    if (tag === 'SUMMARY') return true
    if (tag === 'A' && el.getAttribute('href')) return true
    if ((tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') && temHandlerProprio(el)) return true
    return false
  }
  // Nota: NÃO usar el.onclick como sinal — o React instala um noop nativo
  // (trap de Safari) em contêineres, o que tornaria a checagem vacuosa.
  const temAcao = (el) => {
    let atual = el
    while (atual && atual !== document.body) {
      if (interativoNativo(atual) || temHandlerProprio(atual)) return true
      atual = atual.parentElement
    }
    // Contêineres (ex.: label envolvendo checkbox) valem pela ação interna.
    return [...el.querySelectorAll('a[href], button, input, select, textarea')].some(
      (filho) => interativoNativo(filho) || temHandlerProprio(filho),
    )
  }

  const conjuntoPrimarios = new Set(primarios)
  let total = 0
  const mortos = []
  for (const el of candidatos) {
    if (!visivel(el)) continue
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue
    // cursor-pointer herdado dentro de outro clicável não conta em dobro.
    if (!conjuntoPrimarios.has(el)) {
      let pai = el.parentElement
      let interno = false
      while (pai && pai !== document.body) {
        if (candidatos.has(pai)) {
          interno = true
          break
        }
        pai = pai.parentElement
      }
      if (interno) continue
    }
    total += 1
    if (!temAcao(el)) {
      const texto = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 60)
      const classe = (el.getAttribute('class') || '').slice(0, 60)
      mortos.push(`<${el.tagName.toLowerCase()}> "${texto}" class="${classe}"`)
    }
  }
  return { total, mortos }
}

// ---------------------------------------------------------------- percurso
const navegador = await (async () => {
  await esperarServidor()
  return abrirChromium()
})()
const contexto = await navegador.newContext({ viewport: { width: 1440, height: 900 } })
const pagina = await contexto.newPage()
pagina.on('console', (mensagem) => {
  if (mensagem.type() === 'error') errosConsole.push(mensagem.text())
})
pagina.on('pageerror', (erro) => errosConsole.push(String(erro)))

const irPara = async (rota) => {
  await pagina.goto(`${BASE}${rota}`, { waitUntil: 'domcontentloaded' })
  await pagina.getByText('Dados atualizados em').first().waitFor({ timeout: 15000 })
  await pagina.waitForTimeout(500)
}

const dialogo = (rotulo) => pagina.locator(`aside[role="dialog"][aria-label="${rotulo}"]`)

const fecharFicha = async (rotulo) => {
  await pagina.keyboard.press('Escape')
  // Fechada, a ficha permanece montada para a transição de saída — o wrapper
  // vira aria-hidden e o painel sai da tela.
  await pagina
    .locator(`[aria-hidden="true"] aside[role="dialog"][aria-label="${rotulo}"]`)
    .waitFor({ state: 'attached', timeout: 5000 })
}

const passo = async (nome, acao) => {
  try {
    await acao()
    console.log(`✔ ${nome}`)
  } catch (erro) {
    falhas.push(`${nome}: ${String(erro).split('\n')[0]}`)
    console.log(`✘ ${nome}`)
  }
}

try {
  // 1) Auditoria por rota (Configurações: também nas abas com tabelas).
  console.log('— Auditoria "nenhum controle morto" —')
  let totalGeral = 0
  for (const rota of ROTAS) {
    await irPara(rota)
    const resumo = await pagina.evaluate(auditarClicaveis)
    totalGeral += resumo.total
    const situacao = resumo.mortos.length === 0 ? 'OK' : `${resumo.mortos.length} MORTOS`
    console.log(`${rota.padEnd(18)} ${String(resumo.total).padStart(4)} clicáveis · ${situacao}`)
    for (const morto of resumo.mortos) console.log(`    ✘ ${morto}`)
    if (resumo.mortos.length > 0) falhas.push(`${rota}: ${resumo.mortos.length} clicáveis sem ação`)
  }
  console.log(`Total varrido: ${totalGeral} clicáveis em ${ROTAS.length} rotas\n`)

  console.log('— Smoke estendido —')

  // 2) Ficha de ordem (OF) a partir da Execução.
  await passo('ficha de ordem OF-045678', async () => {
    await irPara('/execucao')
    await pagina.getByRole('button', { name: 'OF-045678' }).first().click()
    await dialogo('OF-045678').getByText('Buscopan Composto').first().waitFor()
    await fecharFicha('OF-045678')
  })

  // 3) Ficha de material (MAT) + filtro de fábrica aplicado e limpo.
  await passo('ficha de material MAT-API-001', async () => {
    await irPara('/materiais')
    await pagina.getByRole('button', { name: 'MAT-API-001' }).first().click()
    await dialogo('Ibuprofeno API').waitFor()
    await fecharFicha('Ibuprofeno API')
  })

  await passo('filtro de fábrica aplicado e limpo', async () => {
    await pagina.getByLabel('Fábrica').first().selectOption('Goiânia')
    await pagina.getByText('Nenhum material no recorte atual').waitFor()
    await pagina.getByRole('button', { name: 'Limpar filtros', exact: true }).first().click()
    await pagina.getByRole('button', { name: 'MAT-API-001' }).first().waitFor()
  })

  // 4) Ficha de OT e, de dentro dela, a ficha do ativo relacionado.
  await passo('ficha de OT-245682 e do ativo HVAC AHU-03', async () => {
    await irPara('/manutencao')
    await pagina.getByRole('button', { name: 'OT-245682' }).first().click()
    await dialogo('OT-245682').waitFor()
    await dialogo('OT-245682').getByRole('button', { name: /HVAC AHU-03/ }).click()
    await dialogo('HVAC AHU-03').waitFor()
    await fecharFicha('HVAC AHU-03')
  })

  // 5) Exportação de CSV (respeita BOM, ';' e nome padronizado).
  await passo('exportar CSV da fila de manutenção', async () => {
    const [download] = await Promise.all([
      pagina.waitForEvent('download'),
      pagina
        .getByRole('button', { name: 'Exportar Fila de ordens de manutenção de Anápolis em CSV' })
        .click(),
    ])
    const esperado = 'hpo-manutencao-fila-de-ordens-de-manutencao-de-anapolis-2025-05-19.csv'
    if (download.suggestedFilename() !== esperado)
      throw new Error(`nome do CSV: ${download.suggestedFilename()} ≠ ${esperado}`)
    const conteudo = readFileSync(await download.path())
    if (!(conteudo[0] === 0xef && conteudo[1] === 0xbb && conteudo[2] === 0xbf))
      throw new Error('CSV sem BOM UTF-8')
    const texto = conteudo.toString('utf8')
    if (!texto.includes(';') || !texto.includes('\r\n') || !texto.includes('OT-245682'))
      throw new Error('CSV sem separador ";", CRLF ou dados esperados')
  })

  // 6) Ficha de lote a partir da Qualidade.
  await passo('ficha de lote 2456791C', async () => {
    await irPara('/qualidade')
    await pagina.getByRole('button', { name: '2456791C' }).first().click()
    await dialogo('Lote 2456791C').waitFor()
    await fecharFicha('Lote 2456791C')
  })

  // 7) Busca global Ctrl+K → Ibuprofeno → ficha do material.
  await passo('busca global Ctrl+K abre a ficha do Ibuprofeno', async () => {
    await pagina.keyboard.press('Control+k')
    const busca = pagina.getByRole('combobox', { name: /Buscar ordens/ })
    await busca.waitFor()
    await busca.fill('Ibuprofeno')
    await pagina.waitForTimeout(300)
    await pagina.keyboard.press('Enter')
    await dialogo('Ibuprofeno API').waitFor()
    await fecharFicha('Ibuprofeno API')
  })

  // 8) Console limpo no percurso inteiro.
  if (errosConsole.length > 0) {
    falhas.push(`console com ${errosConsole.length} erro(s)`)
    for (const erro of errosConsole.slice(0, 10)) console.log(`  console ✘ ${erro}`)
  } else {
    console.log('✔ console 100% limpo em todo o percurso')
  }
} finally {
  await navegador.close()
  servidor.kill()
}

if (falhas.length > 0) {
  console.error(`\nFALHOU: ${falhas.length} problema(s)`)
  for (const falha of falhas) console.error(`  ✘ ${falha}`)
  process.exit(1)
}
console.log('\nAuditoria e smoke de navegador: tudo passou.')
