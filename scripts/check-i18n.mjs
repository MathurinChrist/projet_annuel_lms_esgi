#!/usr/bin/env node
/**
 * Fail CI if FR/EN locale key trees diverge.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function flatten(obj, prefix = '', out = new Set()) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, path, out)
    } else {
      out.add(path)
    }
  }
  return out
}

const root = process.cwd()
const fr = JSON.parse(readFileSync(resolve(root, 'i18n/locales/fr.json'), 'utf8'))
const en = JSON.parse(readFileSync(resolve(root, 'i18n/locales/en.json'), 'utf8'))
const frKeys = flatten(fr)
const enKeys = flatten(en)

const onlyFr = [...frKeys].filter((k) => !enKeys.has(k)).sort()
const onlyEn = [...enKeys].filter((k) => !frKeys.has(k)).sort()

if (onlyFr.length || onlyEn.length) {
  console.error('i18n key mismatch between fr.json and en.json')
  if (onlyFr.length) {
    console.error(`Only in fr (${onlyFr.length}):`)
    for (const k of onlyFr) console.error(`  - ${k}`)
  }
  if (onlyEn.length) {
    console.error(`Only in en (${onlyEn.length}):`)
    for (const k of onlyEn) console.error(`  - ${k}`)
  }
  process.exit(1)
}

console.log(`i18n OK — ${frKeys.size} keys in sync (fr/en)`)
