import { useEffect, useRef } from 'react'
import { Brand } from '../components/ui'
import { TEMPLATES, TYPE_LABEL, buildPhases, formatTime, totalSeconds } from '../lib/engine'
import { go } from '../lib/nav'
import { useSettings, useTimers } from '../lib/storage'

const MENU = [
  { to: '/timers', icon: '⏱', title: 'Timers' },
  { to: '/scoreboard', icon: '🥋', title: 'Placar' },
  { to: '/playlists', icon: '☰', title: 'Playlists' },
  { to: '/settings', icon: '⚙', title: 'Personalizar' },
]

export default function Home() {
  const [s] = useSettings()
  const { list } = useTimers()
  const hero = useRef<HTMLButtonElement>(null)
  useEffect(() => hero.current?.focus(), [])

  const last = [...list, ...TEMPLATES].find((t) => t.id === s.lastTimerId) ?? TEMPLATES[0]
  const total = totalSeconds(buildPhases(last))

  return (
    <main className="shell">
      <aside className="rail">
        <Brand />
        <nav className="rail-nav" aria-label="Menu">
          {MENU.map((m) => (
            <button key={m.to} className="rail-item" onClick={() => go(m.to)}>
              <span aria-hidden>{m.icon}</span>
              {m.title}
            </button>
          ))}
        </nav>
        <footer className="rail-foot">
          <a href="https://www.instagram.com/coliseuax/" target="_blank" rel="noreferrer">
            @coliseuax
          </a>
          <a href="https://www.instagram.com/teamalexandrexuxa/" target="_blank" rel="noreferrer">
            @teamalexandrexuxa
          </a>
        </footer>
      </aside>

      <section className="hero">
        <span className="hero-kicker">Pronto para treinar</span>
        <h1 className="hero-title">{last.name}</h1>
        <p className="muted">
          {TYPE_LABEL[last.type]}
          {last.type === 'countup' ? '' : ` · ${formatTime(total)}`}
        </p>
        <div className="actions">
          <button ref={hero} className="btn primary big" onClick={() => go('/tv')}>
            ▶ Abrir em tela de TV
          </button>
          <button className="btn big" onClick={() => go('/timers')}>
            Escolher outro
          </button>
        </div>
      </section>
    </main>
  )
}
