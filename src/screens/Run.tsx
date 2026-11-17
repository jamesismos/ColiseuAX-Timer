import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Brand } from '../components/ui'
import { playEnd, playPhaseStart, playTick, unlockAudio } from '../lib/audio'
import {
  TEMPLATES,
  buildPhases,
  displaySeconds,
  formatTime,
  initialState,
  skip,
  tick,
  type Phase,
  type RunState,
} from '../lib/engine'
import { go, goBack, keyAction } from '../lib/nav'
import { usePlaylists, useSettings, useTimers } from '../lib/storage'

const KIND_CLASS: Record<Phase['kind'], string> = { prep: 'k-prep', work: 'k-work', rest: 'k-rest', free: 'k-work' }

function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    let lock: { release: () => Promise<void> } | null = null
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }
    nav.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => undefined)
    return () => {
      void lock?.release().catch(() => undefined)
    }
  }, [active])
}

export function useRunner(phases: Phase[]) {
  const [state, setState] = useState<RunState>(initialState)
  const [running, setRunning] = useState(false)
  const last = useRef(0)
  const prev = useRef<{ index: number; secs: number } | null>(null)

  useEffect(() => {
    if (!running) return
    last.current = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      const dt = now - last.current
      last.current = now
      setState((s) => tick(phases, s, dt))
    }, 100)
    return () => window.clearInterval(id)
  }, [running, phases])

  // Sons: início de fase, últimos 3 segundos e fim
  useEffect(() => {
    const p = phases[state.index]
    if (!p) return
    if (state.done) {
      setRunning(false)
      if (running) playEnd()
      return
    }
    if (!running) return
    const secs = displaySeconds(p, state.elapsedMs)
    const before = prev.current
    if (before && before.index !== state.index) playPhaseStart(p.kind)
    else if (before && before.secs !== secs && !p.open && secs > 0 && secs <= 3) playTick()
    prev.current = { index: state.index, secs }
  }, [state, phases, running])

  const start = useCallback(() => {
    unlockAudio()
    setState((s) => {
      if (s.done) return initialState()
      return s
    })
    const p = phases[state.done ? 0 : state.index]
    if (p && (state.done || (state.index === 0 && state.elapsedMs === 0))) playPhaseStart(p.kind)
    prev.current = null
    setRunning(true)
  }, [phases, state])

  const pause = useCallback(() => setRunning(false), [])
  const reset = useCallback(() => {
    setRunning(false)
    setState(initialState())
    prev.current = null
  }, [])
  const next = useCallback((d: 1 | -1) => setState((s) => skip(phases, s, d)), [phases])

  return { state, running, start, pause, reset, next }
}

/** Resolve o que rodar: timer salvo, modelo, playlist ou o último usado (modo TV). */
function useResolved(kind: 'timer' | 'playlist' | 'tv', id: string) {
  const { list } = useTimers()
  const playlists = usePlaylists()
  const [settings, setSettings] = useSettings()
  const all = useMemo(() => [...list, ...TEMPLATES], [list])

  const resolved = useMemo(() => {
    if (kind === 'playlist') {
      const pl = playlists.list.find((p) => p.id === id)
      if (!pl) return null
      const phases = pl.items.flatMap((tid) => {
        const t = all.find((x) => x.id === tid)
        return t ? buildPhases(t, t.name) : []
      })
      return { name: pl.name, phases }
    }
    const tid = kind === 'tv' ? settings.lastTimerId : id
    const t = all.find((x) => x.id === tid) ?? TEMPLATES[0]
    return { name: t.name, phases: buildPhases(t), id: t.id }
  }, [kind, id, all, playlists.list, settings.lastTimerId])

  useEffect(() => {
    if (kind === 'timer' && resolved && 'id' in resolved && resolved.id && settings.lastTimerId !== resolved.id) {
      setSettings({ lastTimerId: resolved.id })
    }
  }, [kind, resolved, settings.lastTimerId, setSettings])

  return resolved
}

export default function Run({ kind, id }: { kind: 'timer' | 'playlist' | 'tv'; id: string }) {
  const resolved = useResolved(kind, id)
  const [settings] = useSettings()
  const phases = useMemo(() => resolved?.phases ?? [], [resolved])
  const { state, running, start, pause, reset, next } = useRunner(phases)
  const playRef = useRef<HTMLButtonElement>(null)
  const [phraseIdx, setPhraseIdx] = useState(0)
  useWakeLock(running)

  useEffect(() => playRef.current?.focus(), [])

  // Frase motivacional troca a cada round
  const phase = phases[state.index]
  const phrases = settings.phrases.filter((p) => p.trim())
  useEffect(() => {
    if (phase?.kind === 'work' && phrases.length > 0) setPhraseIdx((i) => (i + 1) % phrases.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index])

  // Teclas de mídia do controle: play, pause, avançar e voltar fase
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const a = keyAction(e)
      if (a === 'playpause') running ? pause() : start()
      else if (a === 'play' && !running) start()
      else if (a === 'pause' && running) pause()
      else if (a === 'next') next(1)
      else if (a === 'prev') next(-1)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running, pause, start, next])

  if (!resolved || phases.length === 0 || !phase) {
    return (
      <main className="page">
        <p>Timer não encontrado.</p>
        <button className="btn primary" onClick={() => go('/timers')}>
          Ver timers
        </button>
      </main>
    )
  }

  const selectedTimerId = 'id' in resolved ? resolved.id : null
  const secs = displaySeconds(phase, state.elapsedMs)
  const queue = phases.slice(state.index, state.index + 6)
  const lastThree = running && !phase.open && secs > 0 && secs <= 3
  const progress = phase.open ? 0 : Math.min(1, state.elapsedMs / (phase.seconds * 1000))
  const started = state.index > 0 || state.elapsedMs > 0

  const fullscreen = () => {
    const el = document.documentElement
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen?.().catch(() => undefined)
  }

  return (
    <main className={`run ${state.done ? 'k-done' : KIND_CLASS[phase.kind]} ${lastThree ? 'warn' : ''}`}>
      <div className="run-top">
        <Brand />
        <div className="run-top-actions">
          <div className="run-name">{phase.group ?? resolved.name}</div>
          {kind === 'tv' && (
            <button
              className="btn ghost run-settings"
              onClick={() => selectedTimerId && go(`/edit/${selectedTimerId}`)}
              disabled={!selectedTimerId}
            >
              Configurar timer
            </button>
          )}
        </div>
      </div>

      <div className="run-grid">
        <section className="run-main" aria-live="polite">
          <div className="run-label">{state.done ? 'Fim!' : phase.label}</div>
          {phase.sub && !state.done && <div className="run-sub">{phase.sub}</div>}
          <div className="run-time" role="timer">
            {formatTime(secs)}
          </div>
          {!phase.open && (
            <div className="bar" aria-hidden>
              <div className="bar-fill" style={{ transform: `scaleX(${1 - progress})` }} />
            </div>
          )}
        </section>

        <aside className="run-side">
          <h2>Fila</h2>
          <ol className="queue">
            {queue.map((q, i) => (
              <li key={state.index + i} className={`q-${q.kind} ${i === 0 ? 'now' : ''}`}>
                <span>{q.label}</span>
                <span>{q.open ? '∞' : formatTime(q.seconds)}</span>
              </li>
            ))}
          </ol>
          <div className="run-teacher">SENSEI ALEXANDRE XUXA</div>
          {settings.showPhrases && phrases.length > 0 && phase.kind !== 'prep' && <div className="run-phrase">{phrases[phraseIdx % phrases.length]}</div>}
        </aside>
      </div>

      {kind === 'tv' && (
        <a
          className="run-credit"
          href="https://www.instagram.com/jamesismos/"
          target="_blank"
          rel="noreferrer"
          aria-label="Desenvolvido por @jamesismos no Instagram"
        >
          Desenvolvido por <strong>@jamesismos</strong>
        </a>
      )}

      <div className="run-controls">
        <button ref={playRef} className="btn primary big" onClick={running ? pause : start}>
          {running ? 'Pausar' : state.done ? 'Reiniciar' : started ? 'Continuar' : 'Iniciar'}
        </button>
        <button className="btn" onClick={() => next(-1)} aria-label="Fase anterior">
          ◀◀
        </button>
        <button className="btn" onClick={() => next(1)} aria-label="Próxima fase">
          ▶▶
        </button>
        <button className="btn" onClick={reset}>
          Zerar
        </button>
        <button className="btn" onClick={fullscreen}>
          Tela cheia
        </button>
        <button className="btn ghost" onClick={goBack}>
          Sair
        </button>
      </div>
    </main>
  )
}
