import { useSyncExternalStore } from 'react'
import { DEFAULT_PHRASES, type TimerConfig } from './engine'

// Mini-store persistido em localStorage (sem dependências).
function createStore<T>(key: string, initial: T, merge: boolean) {
  const load = (): T => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return initial
      const parsed = JSON.parse(raw)
      return merge ? { ...initial, ...parsed } : (parsed as T)
    } catch {
      return initial
    }
  }
  let value: T = load()
  const listeners = new Set<() => void>()
  return {
    get: () => value,
    set(next: T) {
      value = next
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        /* armazenamento cheio ou bloqueado: segue só em memória */
      }
      listeners.forEach((l) => l())
    },
    subscribe(l: () => void) {
      listeners.add(l)
      return () => listeners.delete(l)
    },
  }
}

export type SoundStyle = 'arena' | 'sino' | 'beep' | 'buzina' | 'mudo'

export interface Settings {
  academy: string
  team: string
  teacher: string
  accent: string
  bgUrl: string
  logoData: string // vazio por enquanto; também aceita public/logo.png
  sound: SoundStyle
  volume: number // 0..100
  showPhrases: boolean
  phrases: string[]
  lastTimerId: string
}

export const DEFAULT_SETTINGS: Settings = {
  academy: 'ColiseuAX',
  team: 'Team Alexandre Xuxa',
  teacher: 'SENSEI ALEXANDRE XUXA',
  accent: '#d10f1c',
  bgUrl: '',
  logoData: '',
  sound: 'arena',
  volume: 80,
  showPhrases: true,
  phrases: DEFAULT_PHRASES,
  lastTimerId: 'tpl-rounds-5',
}

export interface Playlist {
  id: string
  name: string
  items: string[] // ids de timers (salvos ou modelos)
}

const settingsStore = createStore<Settings>('cax.settings.v1', DEFAULT_SETTINGS, true)
const timersStore = createStore<TimerConfig[]>('cax.timers.v1', [], false)
const playlistsStore = createStore<Playlist[]>('cax.playlists.v1', [], false)

export function useSettings() {
  const s = useSyncExternalStore(settingsStore.subscribe, settingsStore.get)
  return [s, (patch: Partial<Settings>) => settingsStore.set({ ...settingsStore.get(), ...patch })] as const
}
export const getSettings = settingsStore.get

export function useTimers() {
  const list = useSyncExternalStore(timersStore.subscribe, timersStore.get)
  return {
    list,
    save(t: TimerConfig) {
      const cur = timersStore.get()
      const i = cur.findIndex((x) => x.id === t.id)
      timersStore.set(i >= 0 ? cur.map((x) => (x.id === t.id ? t : x)) : [...cur, t])
    },
    remove(id: string) {
      timersStore.set(timersStore.get().filter((x) => x.id !== id))
    },
  }
}

export function usePlaylists() {
  const list = useSyncExternalStore(playlistsStore.subscribe, playlistsStore.get)
  return {
    list,
    save(p: Playlist) {
      const cur = playlistsStore.get()
      const i = cur.findIndex((x) => x.id === p.id)
      playlistsStore.set(i >= 0 ? cur.map((x) => (x.id === p.id ? p : x)) : [...cur, p])
    },
    remove(id: string) {
      playlistsStore.set(playlistsStore.get().filter((x) => x.id !== id))
    },
  }
}

export function resetAll() {
  settingsStore.set(DEFAULT_SETTINGS)
  timersStore.set([])
  playlistsStore.set([])
}
