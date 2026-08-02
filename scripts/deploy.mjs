#!/usr/bin/env node
/**
 * Publica o site: junta as alterações, faz commit e envia para o GitHub.
 *
 *   npm run deploy                    -> mensagem automática
 *   npm run deploy "Novo texto"       -> mensagem à escolha
 *
 * O envio é o deploy: o GitHub Actions apanha o commit e publica sozinho.
 * Este script não toca nas regras do Firestore — para isso é `npm run regras`.
 */

import { execFileSync } from 'node:child_process'

const REPO = 'Magalhaes24/rosarinhoemanel'
const SITE = 'https://magalhaes24.github.io/rosarinhoemanel/'

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function gitEcoando(...args) {
  execFileSync('git', args, { stdio: 'inherit' })
}

/** Uma frase a partir do que mudou, para quando não vier mensagem. */
function mensagemAutomatica(ficheiros) {
  const nomes = ficheiros.map((l) => l.slice(3).split('/').pop())
  const amostra = [...new Set(nomes)].slice(0, 3).join(', ')
  const resto = ficheiros.length > 3 ? ` e mais ${ficheiros.length - 3}` : ''
  return `Atualizar ${amostra}${resto}`
}

try {
  git('rev-parse', '--is-inside-work-tree')
} catch {
  console.error('Isto não é um repositório git.')
  process.exit(1)
}

const ramo = git('rev-parse', '--abbrev-ref', 'HEAD')
const porEnviar = git('status', '--porcelain').split('\n').filter(Boolean)

if (porEnviar.length) {
  console.log(`\n${porEnviar.length} ficheiro(s) alterado(s):`)
  for (const l of porEnviar.slice(0, 12)) console.log('  ' + l)
  if (porEnviar.length > 12) console.log(`  … e mais ${porEnviar.length - 12}`)

  const mensagem = process.argv.slice(2).join(' ').trim() || mensagemAutomatica(porEnviar)

  console.log(`\nMensagem: ${mensagem}\n`)
  gitEcoando('add', '-A')
  gitEcoando('commit', '-m', mensagem)
} else {
  console.log('\nNada de novo no disco.')
}

// Mesmo sem alterações novas pode haver commits ainda não enviados.
const naoEnviados = git('log', '--oneline', `origin/${ramo}..${ramo}`).split('\n').filter(Boolean)

if (!naoEnviados.length) {
  console.log('O GitHub já tem tudo. Nada a fazer.\n')
  process.exit(0)
}

console.log(`\nA enviar ${naoEnviados.length} commit(s) para «${ramo}»…\n`)
gitEcoando('push', 'origin', ramo)

console.log(`
Enviado. O GitHub Actions está a construir e publica em cerca de um minuto.

  Site      ${SITE}
  Progresso https://github.com/${REPO}/actions

Ver o estado sem sair do terminal:
  gh run list --repo ${REPO} --limit 3
`)
