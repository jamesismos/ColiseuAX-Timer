import { useEffect, useRef } from 'react'
import { Brand } from '../components/ui'
import { TEMPLATES, TYPE_LABEL, buildPhases, formatTime, totalSeconds } from '../lib/engine'
import { currentDevice } from '../lib/device'
import { useInstall } from '../lib/install'
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

  const { canPrompt, installed, prompt } = useInstall()
  const device = currentDevice()
  const installLabel = device.isTV ? 'Instalar na TV' : 'Adicionar à tela inicial'
  const onInstall = () => (canPrompt ? void prompt() : go('/install'))

  const last = [...list, ...TEMPLATES].find((t) => t.id === s.lastTimerId) ?? TEMPLATES[0]
  const total = totalSeconds(buildPhases(last))

  return (
    <main className="shell">
      <aside className="rail">
        <Brand />
        <nav className="rail-nav" aria-label="Menu">
          {[...MENU, ...(installed ? [] : [{ to: '/install', icon: '⬇', title: 'Instalar' }])].map((m) => (
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
          {!installed && (
            <button className="btn big install-cta" onClick={onInstall}>
              ⬇ {installLabel}
            </button>
          )}
        </div>
      </section>

      <a className="credit" href="https://www.instagram.com/jamesismos/" target="_blank" rel="noreferrer" tabIndex={-1} aria-label="Criado por @jamesismos no Instagram">
        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
        </svg>
        by @jamesismos
      </a>
    </main>
  )
}
