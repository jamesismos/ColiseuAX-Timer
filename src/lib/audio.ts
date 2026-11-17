import type { PhaseKind } from './engine'
import { getSettings } from './storage'

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Precisa ser chamado dentro de um clique/tecla para liberar o áudio no navegador. */
export function unlockAudio() {
  audio()
}

function tone(freq: number, startAt: number, dur: number, wave: OscillatorType, gainMul = 1, decay = false) {
  const c = audio()
  const { volume, sound } = getSettings()
  if (!c || sound === 'mudo') return
  const osc = c.createOscillator()
  const g = c.createGain()
  const peak = Math.max(0.0001, (volume / 100) * 0.6 * gainMul)
  const t0 = c.currentTime + startAt
  osc.type = wave
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.01)
  if (decay) g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  else {
    g.gain.setValueAtTime(peak, t0 + dur - 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  }
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

const wave = () => {
  const s = getSettings().sound
  return s === 'buzina' || s === 'arena' ? 'sawtooth' : s === 'beep' ? 'square' : 'sine'
}
const isBell = () => getSettings().sound === 'sino'
const isArena = () => getSettings().sound === 'arena'

// Sinal sintetizado com fundamental grave e harmônicos para atravessar o ruído da academia.
function arenaSignal(startAt: number, dur: number, intensity = 1) {
  tone(185, startAt, dur, 'sawtooth', 0.72 * intensity, true)
  tone(370, startAt, dur * 0.82, 'square', 0.22 * intensity, true)
  tone(555, startAt, dur * 0.58, 'sine', 0.12 * intensity, true)
}

export function playTick() {
  if (isArena()) {
    tone(740, 0, 0.11, 'square', 0.28)
    return
  }
  tone(880, 0, 0.12, isBell() ? 'sine' : wave(), 0.7)
}

export function playPhaseStart(kind: PhaseKind) {
  if (isArena()) {
    if (kind === 'work') {
      arenaSignal(0, 0.95, 1)
      arenaSignal(1.12, 0.48, 0.72)
    } else if (kind === 'rest') {
      tone(260, 0, 0.62, 'sawtooth', 0.48, true)
      tone(390, 0, 0.42, 'sine', 0.18, true)
    } else {
      tone(330, 0, 0.38, 'square', 0.35, true)
      tone(495, 0, 0.3, 'sine', 0.16, true)
    }
    return
  }
  if (kind === 'work') {
    if (isBell()) {
      tone(1320, 0, 1.4, 'sine', 1, true)
      tone(1980, 0, 1.0, 'sine', 0.4, true)
    } else {
      tone(1200, 0, 0.7, wave(), 0.9)
    }
  } else if (kind === 'rest') {
    if (isBell()) tone(660, 0, 1.0, 'sine', 0.9, true)
    else tone(600, 0, 0.45, wave(), 0.8)
  } else {
    tone(880, 0, 0.3, wave(), 0.8)
  }
}

export function playEnd() {
  if (isArena()) {
    arenaSignal(0, 1.1, 1)
    arenaSignal(0.58, 1.1, 0.88)
    arenaSignal(1.16, 1.35, 0.76)
    return
  }
  const w = isBell() ? 'sine' : wave()
  for (let i = 0; i < 3; i++) tone(1320, i * 0.45, isBell() ? 1.0 : 0.3, w, 1, isBell())
}
