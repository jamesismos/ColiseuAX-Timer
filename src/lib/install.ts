import { useEffect, useState, useSyncExternalStore } from 'react'
import { PACOTES, type Pacote } from './guides'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null
let installedNow = false
let version = 0
const listeners = new Set<() => void>()
const notify = () => {
  version++
  listeners.forEach((l) => l())
}

// O navegador pode avisar antes do React montar, por isso o ouvinte é registrado já na importação.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    installedNow = true
    notify()
  })
}

/** Verdadeiro quando já está rodando como app (janela instalada, APK ou pacote de TV). */
export function isInstalledApp(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return (
      window.location.protocol === 'file:' ||
      navigator.userAgent.includes('ColiseuAXApp') ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    )
  } catch {
    return false
  }
}

export function useInstall() {
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => version,
  )
  return {
    canPrompt: deferred !== null,
    installed: installedNow || isInstalledApp(),
    async prompt() {
      const d = deferred
      if (!d) return false
      await d.prompt()
      const { outcome } = await d.userChoice
      deferred = null
      notify()
      return outcome === 'accepted'
    },
  }
}

export interface Publicacao {
  version: string
  atualizadoEm: string
  arquivos: Record<Pacote, boolean>
}

const RELEASE_API = 'https://api.github.com/repos/jamesismos/coliseuax-timer/releases/latest'

/** Lê a Release mais recente e quais pacotes ela tem. null: nenhuma publicada. undefined: ainda carregando ou sem resposta. */
export function usePublicacao(): Publicacao | null | undefined {
  const [pub, setPub] = useState<Publicacao | null | undefined>(undefined)
  useEffect(() => {
    let vivo = true
    fetch(RELEASE_API)
      .then(async (r) => {
        if (r.status === 404) return null
        if (!r.ok) return undefined
        const j = (await r.json()) as { tag_name: string; published_at: string; assets: { name: string }[] }
        const tem = (arquivo: string) => j.assets.some((a) => a.name === arquivo)
        return {
          version: j.tag_name.replace(/^v/, ''),
          atualizadoEm: j.published_at.slice(0, 10),
          arquivos: { apk: tem(PACOTES.apk.arquivo), webos: tem(PACOTES.webos.arquivo), tizen: tem(PACOTES.tizen.arquivo) },
        }
      })
      .catch(() => undefined)
      .then((p) => vivo && setPub(p))
    return () => {
      vivo = false
    }
  }, [])
  return pub
}
