import { useEffect, useRef, useState } from 'react'
import { Page } from '../components/ui'
import { TEMPLATES, buildPhases, formatTime, newId, totalSeconds } from '../lib/engine'
import { go, goBack } from '../lib/nav'
import { usePlaylists, useTimers, type Playlist } from '../lib/storage'

export function PlaylistList() {
  const { list } = usePlaylists()
  const { list: timers } = useTimers()
  const all = [...timers, ...TEMPLATES]
  const first = useRef<HTMLButtonElement>(null)
  useEffect(() => first.current?.focus(), [])
  return (
    <Page
      title="Playlists"
      actions={
        <button ref={list.length === 0 ? first : undefined} className="btn primary" onClick={() => go('/playlist-edit/new')}>
          + Nova playlist
        </button>
      }
    >
      {list.length === 0 && <p className="muted">Uma playlist roda vários timers em sequência, por exemplo aquecimento, técnica e rolo.</p>}
      {list.map((p, i) => {
        const total = p.items.reduce((acc, id) => {
          const t = all.find((x) => x.id === id)
          return acc + (t ? totalSeconds(buildPhases(t)) : 0)
        }, 0)
        return (
          <div className="row" key={p.id}>
            <button ref={i === 0 ? first : undefined} className="btn row-main" onClick={() => go(`/run-playlist/${p.id}`)}>
              <strong>{p.name}</strong>
              <span className="muted">
                {p.items.length} timers · {formatTime(total)}
              </span>
            </button>
            <button className="btn" onClick={() => go(`/playlist-edit/${p.id}`)}>
              Editar
            </button>
          </div>
        )
      })}
    </Page>
  )
}

export function PlaylistEditor({ id }: { id: string }) {
  const { list, save, remove } = usePlaylists()
  const { list: timers } = useTimers()
  const all = [...timers, ...TEMPLATES]
  const existing = list.find((p) => p.id === id)
  const [p, setP] = useState<Playlist>(() => existing ?? { id: newId(), name: 'Treino do dia', items: [] })

  const move = (i: number, d: -1 | 1) =>
    setP((cur) => {
      const items = [...cur.items]
      const j = i + d
      if (j < 0 || j >= items.length) return cur
      ;[items[i], items[j]] = [items[j], items[i]]
      return { ...cur, items }
    })

  return (
    <Page title={existing ? 'Editar playlist' : 'Nova playlist'}>
      <label className="field">
        <span>Nome</span>
        <input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} maxLength={40} />
      </label>

      <section>
        <h2>Sequência ({p.items.length})</h2>
        {p.items.length === 0 && <p className="muted">Escolha timers abaixo para adicionar.</p>}
        {p.items.map((tid, i) => {
          const t = all.find((x) => x.id === tid)
          return (
            <div className="row" key={`${tid}-${i}`}>
              <span className="row-main static">
                {i + 1}. {t?.name ?? 'Timer removido'}
              </span>
              <button className="btn small" onClick={() => move(i, -1)} aria-label="Subir">
                ↑
              </button>
              <button className="btn small" onClick={() => move(i, 1)} aria-label="Descer">
                ↓
              </button>
              <button className="btn small danger" onClick={() => setP({ ...p, items: p.items.filter((_, k) => k !== i) })} aria-label="Remover">
                ✕
              </button>
            </div>
          )
        })}
      </section>

      <section>
        <h2>Adicionar timer</h2>
        <div className="chips">
          {all.map((t) => (
            <button key={t.id} className="chip" onClick={() => setP({ ...p, items: [...p.items, t.id] })}>
              + {t.name}
            </button>
          ))}
        </div>
      </section>

      <div className="actions">
        <button
          className="btn primary"
          disabled={p.items.length === 0}
          onClick={() => {
            save({ ...p, name: p.name.trim() || 'Playlist' })
            goBack()
          }}
        >
          Salvar
        </button>
        {existing && (
          <button
            className="btn danger"
            onClick={() => {
              remove(existing.id)
              goBack()
            }}
          >
            Excluir
          </button>
        )}
      </div>
    </Page>
  )
}
