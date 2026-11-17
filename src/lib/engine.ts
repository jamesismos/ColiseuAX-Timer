// Motor do timer: funções puras, sem React, fáceis de testar.

export type TimerType = 'rounds' | 'tabata' | 'circuit' | 'countdown' | 'countup' | 'openmat'
export type PhaseKind = 'prep' | 'work' | 'rest' | 'free'

export interface TimerConfig {
  id: string
  name: string
  type: TimerType
  prep: number // segundos de preparação
  work: number // segundos de trabalho
  rest: number // segundos de descanso
  rounds: number // rounds (ou voltas, no circuito)
  stations: number // estações por volta (circuito)
}

export interface Phase {
  kind: PhaseKind
  label: string
  sub?: string
  seconds: number // 0 quando aberta (cronômetro progressivo)
  open?: boolean
  round: number
  totalRounds: number
  group?: string // nome do timer de origem (playlists)
}

export interface RunState {
  index: number
  elapsedMs: number
  done: boolean
}

export const TYPE_LABEL: Record<TimerType, string> = {
  rounds: 'Rounds',
  tabata: 'Tabata',
  circuit: 'Circuito',
  countdown: 'Regressivo',
  countup: 'Progressivo',
  openmat: 'Open Mat',
}

const clampInt = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number.isFinite(n) ? n : min)))

export function buildPhases(c: TimerConfig, group?: string): Phase[] {
  const prep = clampInt(c.prep, 0, 3600)
  const work = clampInt(c.work, 0, 36000)
  const rest = clampInt(c.rest, 0, 3600)
  const rounds = clampInt(c.rounds, 1, 99)
  const stations = clampInt(c.stations, 1, 30)
  const out: Phase[] = []

  if (c.type === 'countup') {
    return [{ kind: 'free', label: c.name || 'Cronômetro', seconds: 0, open: true, round: 1, totalRounds: 1, group }]
  }

  if (prep > 0) {
    out.push({ kind: 'prep', label: 'Preparar', seconds: prep, round: 0, totalRounds: rounds, group })
  }

  if (c.type === 'countdown') {
    if (work > 0) out.push({ kind: 'work', label: c.name || 'Tempo', seconds: work, round: 1, totalRounds: 1, group })
    return out
  }

  if (c.type === 'circuit') {
    const total = rounds * stations
    let n = 0
    for (let lap = 1; lap <= rounds; lap++) {
      for (let s = 1; s <= stations; s++) {
        n++
        if (work > 0) {
          out.push({
            kind: 'work',
            label: `Estação ${s}/${stations}`,
            sub: `Volta ${lap}/${rounds}`,
            seconds: work,
            round: n,
            totalRounds: total,
            group,
          })
        }
        if (rest > 0 && n < total) {
          out.push({ kind: 'rest', label: 'Descanso', sub: `Volta ${lap}/${rounds}`, seconds: rest, round: n, totalRounds: total, group })
        }
      }
    }
    return out
  }

  // rounds, tabata, openmat
  const workLabel = c.type === 'tabata' ? 'Trabalho' : c.type === 'openmat' ? 'Rolo' : 'Round'
  for (let r = 1; r <= rounds; r++) {
    if (work > 0) {
      out.push({
        kind: 'work',
        label: c.type === 'tabata' ? workLabel : `${workLabel} ${r}/${rounds}`,
        sub: c.type === 'tabata' ? `Série ${r}/${rounds}` : undefined,
        seconds: work,
        round: r,
        totalRounds: rounds,
        group,
      })
    }
    if (rest > 0 && r < rounds) {
      out.push({ kind: 'rest', label: 'Descanso', seconds: rest, round: r, totalRounds: rounds, group })
    }
  }
  return out
}

export function totalSeconds(phases: Phase[]): number {
  return phases.reduce((acc, p) => acc + (p.open ? 0 : p.seconds), 0)
}

export const initialState = (): RunState => ({ index: 0, elapsedMs: 0, done: false })

/** Avança o estado em dtMs, carregando o resto entre fases. */
export function tick(phases: Phase[], s: RunState, dtMs: number): RunState {
  if (s.done || phases.length === 0 || dtMs <= 0) return s
  let index = s.index
  let elapsed = s.elapsedMs + dtMs
  for (;;) {
    const p = phases[index]
    if (p.open) return { index, elapsedMs: elapsed, done: false }
    const len = p.seconds * 1000
    if (elapsed < len) return { index, elapsedMs: elapsed, done: false }
    elapsed -= len
    index++
    if (index >= phases.length) {
      const last = phases[phases.length - 1]
      return { index: phases.length - 1, elapsedMs: last.seconds * 1000, done: true }
    }
  }
}

/** Segundos exibidos: regressivo arredonda para cima, progressivo para baixo. */
export function displaySeconds(p: Phase, elapsedMs: number): number {
  if (p.open) return Math.floor(elapsedMs / 1000)
  return Math.max(0, Math.ceil((p.seconds * 1000 - elapsedMs) / 1000))
}

/** Pula para o início da fase seguinte (ou anterior). */
export function skip(phases: Phase[], s: RunState, delta: 1 | -1): RunState {
  const next = s.index + delta
  if (next < 0) return { index: 0, elapsedMs: 0, done: false }
  if (next >= phases.length) {
    const last = phases[phases.length - 1]
    return { index: phases.length - 1, elapsedMs: last.open ? s.elapsedMs : last.seconds * 1000, done: true }
  }
  return { index: next, elapsedMs: 0, done: false }
}

export function formatTime(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`
}

export function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  } catch {
    /* segue para o fallback */
  }
  return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const blankTimer = (): TimerConfig => ({
  id: newId(),
  name: 'Novo timer',
  type: 'rounds',
  prep: 10,
  work: 300,
  rest: 60,
  rounds: 5,
  stations: 6,
})

const t = (id: string, name: string, type: TimerType, prep: number, work: number, rest: number, rounds: number, stations = 6): TimerConfig => ({
  id,
  name,
  type,
  prep,
  work,
  rest,
  rounds,
  stations,
})

/** Modelos prontos (não editáveis; "Personalizar" cria uma cópia). */
export const TEMPLATES: TimerConfig[] = [
  t('tpl-rounds-5', 'Treino de rounds 5 min', 'rounds', 10, 300, 60, 6),
  t('tpl-openmat', 'Open Mat', 'openmat', 10, 300, 60, 10),
  t('tpl-luta-5', 'Luta 5 min', 'countdown', 5, 300, 0, 1),
  t('tpl-luta-6', 'Luta 6 min', 'countdown', 5, 360, 0, 1),
  t('tpl-luta-7', 'Luta 7 min', 'countdown', 5, 420, 0, 1),
  t('tpl-luta-8', 'Luta 8 min', 'countdown', 5, 480, 0, 1),
  t('tpl-luta-10', 'Luta 10 min', 'countdown', 5, 600, 0, 1),
  t('tpl-tabata', 'Tabata 20/10', 'tabata', 10, 20, 10, 8),
  t('tpl-circuito', 'Circuito 40/20', 'circuit', 10, 40, 20, 3, 6),
  t('tpl-regressivo-10', 'Regressivo 10 min', 'countdown', 0, 600, 0, 1),
  t('tpl-cronometro', 'Cronômetro', 'countup', 0, 0, 0, 1),
]

export const DEFAULT_PHRASES = [
  'Disciplina vence talento.',
  'Respira, confia na técnica.',
  'Cada round é uma chance de evoluir.',
  'Quem treina, confia.',
  'O tatame ensina humildade.',
  'Um dia de cada vez, uma posição de cada vez.',
  'Constância é o segredo.',
  'Tap cedo, treine amanhã.',
  'Foco, calma e ação.',
  'Se não der hoje, dá amanhã.',
]
