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
  return s === 'buzina' ? 'sawtooth' : s === 'beep' ? 'square' : 'sine'
}
const isBell = () => getSettings().sound === 'sino'

export function playTick() {
  tone(880, 0, 0.12, isBell() ? 'sine' : wave(), 0.7)
}

export function playPhaseStart(kind: PhaseKind) {
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
  const w = isBell() ? 'sine' : wave()
  for (let i = 0; i < 3; i++) tone(1320, i * 0.45, isBell() ? 1.0 : 0.3, w, 1, isBell())
}
