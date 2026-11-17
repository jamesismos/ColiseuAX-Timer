import { describe, expect, it } from 'vitest'
import {
  TEMPLATES,
  blankTimer,
  buildPhases,
  displaySeconds,
  formatTime,
  initialState,
  skip,
  tick,
  totalSeconds,
} from './engine'

const cfg = (over: Partial<ReturnType<typeof blankTimer>>) => ({ ...blankTimer(), ...over })

describe('buildPhases', () => {
  it('rounds: prep + N rounds com descanso entre eles (sem descanso depois do último)', () => {
    const p = buildPhases(cfg({ type: 'rounds', prep: 10, work: 300, rest: 60, rounds: 3 }))
    expect(p.map((x) => x.kind)).toEqual(['prep', 'work', 'rest', 'work', 'rest', 'work'])
    expect(totalSeconds(p)).toBe(10 + 3 * 300 + 2 * 60)
    expect(p[1].label).toBe('Round 1/3')
  })

  it('tabata 20/10 x8 = 4 min + prep', () => {
    const p = buildPhases(cfg({ type: 'tabata', prep: 10, work: 20, rest: 10, rounds: 8 }))
    expect(totalSeconds(p)).toBe(10 + 8 * 20 + 7 * 10)
  })

  it('circuito: estações x voltas', () => {
    const p = buildPhases(cfg({ type: 'circuit', prep: 0, work: 40, rest: 20, rounds: 2, stations: 3 }))
    expect(p.filter((x) => x.kind === 'work')).toHaveLength(6)
    expect(p.filter((x) => x.kind === 'rest')).toHaveLength(5)
    expect(p[0].label).toBe('Estação 1/3')
  })

  it('progressivo é uma fase aberta', () => {
    const p = buildPhases(cfg({ type: 'countup' }))
    expect(p).toHaveLength(1)
    expect(p[0].open).toBe(true)
  })

  it('valores inválidos não geram fases de duração zero nem laço infinito', () => {
    const p = buildPhases(cfg({ type: 'rounds', prep: -5, work: NaN, rest: 0, rounds: 0 }))
    expect(p.every((x) => x.seconds > 0)).toBe(true)
  })

  it('todos os modelos geram fases válidas', () => {
    for (const t of TEMPLATES) {
      const p = buildPhases(t)
      expect(p.length).toBeGreaterThan(0)
      expect(p.every((x) => x.open || x.seconds > 0)).toBe(true)
    }
  })
})

describe('tick', () => {
  const phases = buildPhases(cfg({ type: 'rounds', prep: 5, work: 10, rest: 5, rounds: 2 }))

  it('avança dentro da fase', () => {
    const s = tick(phases, initialState(), 2000)
    expect(s.index).toBe(0)
    expect(displaySeconds(phases[0], s.elapsedMs)).toBe(3)
  })

  it('carrega o resto entre fases (sem perder tempo)', () => {
    const s = tick(phases, initialState(), 5000 + 10000 + 1500)
    expect(s.index).toBe(2) // descanso
    expect(s.elapsedMs).toBe(1500)
  })

  it('termina e marca done', () => {
    const s = tick(phases, initialState(), 999999)
    expect(s.done).toBe(true)
    expect(s.index).toBe(phases.length - 1)
  })

  it('um passo grande equivale a vários pequenos', () => {
    let a = initialState()
    for (let i = 0; i < 300; i++) a = tick(phases, a, 100)
    const b = tick(phases, initialState(), 30000)
    expect(a).toEqual(b)
  })

  it('progressivo conta para cima sem terminar', () => {
    const p = buildPhases(cfg({ type: 'countup' }))
    const s = tick(p, initialState(), 3_661_000)
    expect(s.done).toBe(false)
    expect(formatTime(displaySeconds(p[0], s.elapsedMs))).toBe('1:01:01')
  })
})

describe('skip e formatTime', () => {
  const phases = buildPhases(cfg({ type: 'rounds', prep: 5, work: 10, rest: 5, rounds: 2 }))
  it('pula para a próxima fase e volta', () => {
    const a = skip(phases, initialState(), 1)
    expect(a.index).toBe(1)
    expect(skip(phases, a, -1).index).toBe(0)
    expect(skip(phases, initialState(), -1).index).toBe(0)
  })
  it('pular além do fim conclui', () => {
    let s = initialState()
    for (let i = 0; i < 10; i++) s = skip(phases, s, 1)
    expect(s.done).toBe(true)
  })
  it('formata mm:ss', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(92)).toBe('01:32')
    expect(formatTime(600)).toBe('10:00')
  })
})
