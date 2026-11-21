// Identifica em que aparelho o site está aberto, para mostrar o jeito certo de instalar.

export type Platform = 'webos' | 'tizen' | 'androidtv' | 'firetv' | 'tv' | 'android' | 'ios' | 'desktop'
export type GuideId = 'androidtv' | 'firetv' | 'webos' | 'tizen' | 'tv' | 'android' | 'ios' | 'pc'

export interface Device {
  platform: Platform
  isTV: boolean
  label: string
}

export function detectPlatform(ua: string, touchPoints = 0): Platform {
  if (/Web0S|webOS|NetCast/i.test(ua)) return 'webos'
  if (/Tizen/i.test(ua)) return 'tizen'
  if (/;\s*AFT[A-Z0-9]+[\s;)]|Fire ?TV/i.test(ua)) return 'firetv'
  if (/Android/i.test(ua) && /\bTV\b|BRAVIA|SHIELD|MiBOX|Chromecast|GoogleTV|SmartTV|AndroidTV/i.test(ua)) return 'androidtv'
  if (/SmartTV|SMART-TV|HbbTV|VIDAA|Hisense|Roku|CrKey/i.test(ua)) return 'tv'
  if (/Android/i.test(ua)) return 'android'
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && touchPoints > 1)) return 'ios'
  return 'desktop'
}

const LABEL: Record<Platform, string> = {
  webos: 'TV LG (webOS)',
  tizen: 'TV Samsung (Tizen)',
  androidtv: 'Android TV ou Google TV',
  firetv: 'Fire TV',
  tv: 'Smart TV',
  android: 'Celular ou tablet Android',
  ios: 'iPhone ou iPad',
  desktop: 'Computador',
}

export function deviceFrom(ua: string, touchPoints = 0): Device {
  const platform = detectPlatform(ua, touchPoints)
  return { platform, isTV: ['webos', 'tizen', 'androidtv', 'firetv', 'tv'].includes(platform), label: LABEL[platform] }
}

export function currentDevice(): Device {
  if (typeof navigator === 'undefined') return deviceFrom('')
  return deviceFrom(navigator.userAgent, navigator.maxTouchPoints ?? 0)
}

export function guideFor(p: Platform): GuideId {
  return p === 'desktop' ? 'pc' : p
}
