import { useEffect, useState, useSyncExternalStore } from 'react'
import type { Pacote } from './guides'

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

/** Lê quais pacotes já estão publicados no site (arquivo versao.json). */
export function usePublicacao(): Publicacao | null | undefined {
  const [pub, setPub] = useState<Publicacao | null | undefined>(undefined)
  useEffect(() => {
    let vivo = true
    fetch('/downloads/versao.json', { cache: 'no-store' })
      .then((r) => (r.ok ? (r.json() as Promise<Publicacao>) : null))
      .catch(() => null)
      .then((p) => vivo && setPub(p))
    return () => {
      vivo = false
    }
  }, [])
  return pub
}
