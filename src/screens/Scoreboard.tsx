import { useEffect, useMemo, useRef, useState } from 'react'
import { Page, Stepper } from '../components/ui'
import { buildPhases, blankTimer, displaySeconds, formatTime } from '../lib/engine'
import { useRunner } from './Run'

interface Side {
  points: number
  adv: number
  pen: number
}
type Score = [Side, Side]
const ZERO: Score = [
  { points: 0, adv: 0, pen: 0 },
  { points: 0, adv: 0, pen: 0 },
]

type Field = keyof Side

/** Regra de decisão do Jiu-Jitsu: pontos, depois vantagens, depois menos punições. */
export function leader(s: Score): 0 | 1 | null {
  const [a, b] = s
  if (a.points !== b.points) return a.points > b.points ? 0 : 1
  if (a.adv !== b.adv) return a.adv > b.adv ? 0 : 1
  if (a.pen !== b.pen) return a.pen < b.pen ? 0 : 1
  return null
}

export default function Scoreboard() {
  const [score, setScore] = useState<Score>(ZERO)
  const [history, setHistory] = useState<Score[]>([])
  const [names, setNames] = useState<[string, string]>(['Atleta A', 'Atleta B'])
  const [duration, setDuration] = useState(300)
  const first = useRef<HTMLButtonElement>(null)
  useEffect(() => first.current?.focus(), [])

  const phases = useMemo(() => buildPhases({ ...blankTimer(), type: 'countdown', prep: 0, work: duration }), [duration])
  const { state, running, start, pause, reset } = useRunner(phases)

  const change = (i: 0 | 1, f: Field, d: number) => {
    setHistory((h) => [...h, score])
    setScore((cur) => cur.map((s, k) => (k === i ? { ...s, [f]: Math.max(0, s[f] + d) } : s)) as Score)
  }
  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h
      setScore(h[h.length - 1])
      return h.slice(0, -1)
    })
  }
  const clearAll = () => {
    setScore(ZERO)
    setHistory([])
    reset()
  }

  const lead = leader(score)
  const secs = displaySeconds(phases[0], state.elapsedMs)

  const side = (i: 0 | 1) => {
    const s = score[i]
    return (
      <section className={`side side-${i} ${state.done && lead === i ? 'winner' : ''}`}>
        <input className="side-name" value={names[i]} onChange={(e) => setNames((n) => (i === 0 ? [e.target.value, n[1]] : [n[0], e.target.value]))} maxLength={24} aria-label={`Nome do atleta ${i + 1}`} />
        <div className="side-points">{s.points}</div>
        <div className="side-sub">
          <span>
            Vantagens <b>{s.adv}</b>
          </span>
          <span>
            Punições <b>{s.pen}</b>
          </span>
        </div>
        <div className="side-buttons">
          {[2, 3, 4].map((n, k) => (
            <button key={n} ref={i === 0 && k === 0 ? first : undefined} className="btn" onClick={() => change(i, 'points', n)}>
              +{n}
            </button>
          ))}
          <button className="btn" onClick={() => change(i, 'adv', 1)}>
            +Vant.
          </button>
          <button className="btn" onClick={() => change(i, 'pen', 1)}>
            +Pun.
          </button>
          <button className="btn ghost" onClick={() => change(i, 'points', -1)}>
            −1 pt
          </button>
        </div>
      </section>
    )
  }

  return (
    <Page title="Placar de Jiu-Jitsu">
      <div className="board">
        {side(0)}
        <div className="board-mid">
          <div className={`board-time ${running ? 'live' : ''}`}>{formatTime(secs)}</div>
          <button className="btn primary big" onClick={running ? pause : start}>
            {running ? 'Pausar' : state.done ? 'Reiniciar tempo' : 'Iniciar'}
          </button>
          <button className="btn" onClick={undo} disabled={history.length === 0}>
            Desfazer
          </button>
          <button className="btn" onClick={clearAll}>
            Zerar tudo
          </button>
          {state.done && <div className="board-result">{lead === null ? 'Empate' : `Vitória: ${names[lead]}`}</div>}
        </div>
        {side(1)}
      </div>
      {!running && state.elapsedMs === 0 && <Stepper label="Tempo da luta" value={duration} onChange={setDuration} steps={[30, 60]} min={30} max={1800} time />}
    </Page>
  )
}
