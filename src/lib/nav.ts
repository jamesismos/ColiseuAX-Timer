import { useEffect, useState } from 'react'

// ---------- Roteamento por hash (funciona em qualquer navegador de TV e no APK) ----------
export const currentPath = () => window.location.hash.replace(/^#/, '') || '/'

export function usePath(): string {
  const [path, setPath] = useState(currentPath())
  useEffect(() => {
    const h = () => setPath(currentPath())
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])
  return path
}

export const go = (path: string) => {
  window.location.hash = path
}

let depth = 0
export function trackNavigation() {
  window.addEventListener('hashchange', () => {
    depth++
  })
}

export function goBack() {
  if (currentPath() === '/') return
  if (depth > 0) {
    depth--
    window.history.back()
  } else go('/')
}

// ---------- Navegação espacial por setas (controle remoto de TV) ----------
const SELECTOR = 'button, a[href], input, select, textarea, [data-nav]'

const isVisible = (el: HTMLElement) => {
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'
}

type Dir = 'up' | 'down' | 'left' | 'right'
const KEY_DIR: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }

function moveFocus(dir: Dir) {
  const all = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter(
    (el) => !(el as HTMLButtonElement).disabled && el.tabIndex !== -1 && isVisible(el),
  )
  if (all.length === 0) return
  const active = document.activeElement as HTMLElement | null
  if (!active || !all.includes(active)) {
    all[0].focus()
    return
  }
  const a = active.getBoundingClientRect()
  const ax = a.left + a.width / 2
  const ay = a.top + a.height / 2
  let best: HTMLElement | null = null
  let bestScore = Infinity
  for (const el of all) {
    if (el === active) continue
    const r = el.getBoundingClientRect()
    const dx = r.left + r.width / 2 - ax
    const dy = r.top + r.height / 2 - ay
    const main = dir === 'up' ? -dy : dir === 'down' ? dy : dir === 'left' ? -dx : dx
    if (main <= 1) continue
    const cross = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy)
    const score = main + cross * 2
    if (score < bestScore) {
      bestScore = score
      best = el
    }
  }
  best?.focus()
  best?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

const BACK_KEYS = ['Escape', 'GoBack', 'BrowserBack', 'XF86Back']
const BACK_CODES = [4, 10009, 461] // Android TV, Tizen, webOS

export function installRemoteControl() {
  const onKey = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null
    const typing = !!target && (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && ['text', 'search', 'url'].includes((target as HTMLInputElement).type)))

    if (BACK_KEYS.includes(e.key) || BACK_CODES.includes(e.keyCode) || (e.key === 'Backspace' && !typing)) {
      e.preventDefault()
      goBack()
      return
    }
    const dir = KEY_DIR[e.key]
    if (!dir) return
    // Dentro de campos de texto, esquerda/direita movem o cursor
    if (typing && (dir === 'left' || dir === 'right')) return
    if (target?.tagName === 'SELECT') return
    e.preventDefault()
    moveFocus(dir)
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}
