import { useEffect, useState } from 'react'

// ---------- Roteamento por hash (funciona em qualquer navegador de TV e no APK) ----------
// "/baixar" (endereço curto para digitar na TV) abre a tela de instalação
export const currentPath = () => {
  const hash = window.location.hash.replace(/^#/, '')
  if (hash) return hash
  return window.location.pathname.replace(/\/+$/, '') === '/baixar' ? '/install' : '/'
}

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

interface TizenApi {
  application?: { getCurrentApplication: () => { exit: () => void } }
  tvinputdevice?: { registerKey: (k: string) => void }
}
declare global {
  interface Window {
    tizen?: TizenApi
    webOSSystem?: unknown
    __caxBack?: () => boolean
  }
}

/** Fecha o app quando ele roda empacotado (Tizen, webOS). Em navegador comum não faz nada. */
export function exitApp(): boolean {
  try {
    if (window.tizen?.application) {
      window.tizen.application.getCurrentApplication().exit()
      return true
    }
    if ((window.webOSSystem || /Web0S|webOS/i.test(navigator.userAgent)) && window.location.protocol === 'file:') {
      window.close()
      return true
    }
  } catch {
    /* sem permissão para fechar */
  }
  return false
}

/** Voltar de uma tela interna. Retorna false quando já está na tela inicial. */
export function handleBack(): boolean {
  if (currentPath() === '/') return false
  goBack()
  return true
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

// ---------- Mapeamento de teclas (controles de Android TV, Fire TV, Samsung/Tizen, LG/webOS) ----------
export type KeyAction = Dir | 'select' | 'back' | 'playpause' | 'play' | 'pause' | 'next' | 'prev' | null

const KEY_NAMES: Record<string, KeyAction> = {
  ArrowUp: 'up', Up: 'up', ArrowDown: 'down', Down: 'down', ArrowLeft: 'left', Left: 'left', ArrowRight: 'right', Right: 'right',
  Select: 'select',
  Escape: 'back', GoBack: 'back', BrowserBack: 'back', XF86Back: 'back', Back: 'back',
  MediaPlayPause: 'playpause', MediaPlay: 'play', MediaPause: 'pause',
  MediaTrackNext: 'next', MediaFastForward: 'next', MediaTrackPrevious: 'prev', MediaRewind: 'prev',
}

const KEY_CODES: Record<number, KeyAction> = {
  38: 'up', 40: 'down', 37: 'left', 39: 'right',
  23: 'select', // DPAD_CENTER do Android
  27: 'back', 4: 'back', 166: 'back', 10009: 'back', 461: 'back', // Esc, Android, navegador, Tizen, webOS
  179: 'playpause', 10252: 'playpause', 415: 'play', 19: 'pause',
  176: 'next', 417: 'next', 177: 'prev', 412: 'prev',
}

/** Converte uma tecla (por nome ou código) em ação. Backspace só vale fora de campos de texto. */
export function keyAction(k: { key?: string; keyCode?: number }, typing = false): KeyAction {
  if (k.key === 'Backspace') return typing ? null : 'back'
  if (k.key && k.key in KEY_NAMES) return KEY_NAMES[k.key]
  if (k.keyCode !== undefined && k.keyCode in KEY_CODES) return KEY_CODES[k.keyCode]
  return null
}

export function installRemoteControl() {
  const onKey = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null
    const typing = !!target && (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && ['text', 'search', 'url'].includes((target as HTMLInputElement).type)))
    const action = keyAction(e, typing)
    if (!action) return

    if (action === 'back') {
      if (handleBack()) e.preventDefault()
      else if (exitApp()) e.preventDefault()
      return
    }
    if (action === 'select') {
      // DPAD_CENTER / "Select": aciona o item em foco (Enter já faz isso sozinho)
      e.preventDefault()
      ;(document.activeElement as HTMLElement | null)?.click?.()
      return
    }
    if (action === 'up' || action === 'down' || action === 'left' || action === 'right') {
      // Dentro de campos de texto, esquerda/direita movem o cursor
      if (typing && (action === 'left' || action === 'right')) return
      if (target?.tagName === 'SELECT') return
      e.preventDefault()
      moveFocus(action)
    }
    // teclas de mídia são tratadas pela tela do timer
  }
  window.addEventListener('keydown', onKey)
  // O app Android chama isto quando o botão Voltar da TV é apertado
  window.__caxBack = handleBack
  try {
    ;['MediaPlay', 'MediaPause', 'MediaPlayPause', 'MediaFastForward', 'MediaRewind'].forEach((k) => window.tizen?.tvinputdevice?.registerKey(k))
  } catch {
    /* fora do Tizen */
  }
  return () => {
    window.removeEventListener('keydown', onKey)
    window.__caxBack = undefined
  }
}
