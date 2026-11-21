import { describe, expect, it } from 'vitest'
import { deviceFrom, detectPlatform, guideFor } from './device'

// Textos de user agent reais (ou muito próximos) de cada tipo de aparelho
const UA = {
  webos: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36 WebAppManager',
  webosApp: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) QtWebEngine/5.2.1 Chrome/38.0.2125.122 Safari/537.36 WebAppManager',
  tizen: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/537.36 (KHTML, like Gecko) 76.0.3809.146/6.0 TV Safari/537.36',
  firetv: 'Mozilla/5.0 (Linux; Android 9; AFTMM Build/PS7233; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/98.0.4758.101 Mobile Safari/537.36',
  sony: 'Mozilla/5.0 (Linux; Android 11; BRAVIA 4K GB ATV3 Build/RTT1.220209.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 Safari/537.36',
  shield: 'Mozilla/5.0 (Linux; Android 11; SHIELD Android TV Build/RQ1A.210105.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
  tcl: 'Mozilla/5.0 (Linux; Android 9; TCL TV Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Safari/537.36',
  android: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  hisense: 'Mozilla/5.0 (Linux; NetCast; U) AppleWebKit/537.36 (KHTML, like Gecko) Hisense VIDAA SmartTV',
}

describe('detectPlatform', () => {
  it('reconhece TVs', () => {
    expect(detectPlatform(UA.webos)).toBe('webos')
    expect(detectPlatform(UA.webosApp)).toBe('webos')
    expect(detectPlatform(UA.tizen)).toBe('tizen')
    expect(detectPlatform(UA.firetv)).toBe('firetv')
    expect(detectPlatform(UA.sony)).toBe('androidtv')
    expect(detectPlatform(UA.shield)).toBe('androidtv')
    expect(detectPlatform(UA.tcl)).toBe('androidtv')
  })
  it('celular e computador não viram TV', () => {
    expect(detectPlatform(UA.android)).toBe('android')
    expect(detectPlatform(UA.iphone)).toBe('ios')
    expect(detectPlatform(UA.windows)).toBe('desktop')
  })
  it('iPad que se apresenta como Mac é reconhecido pelo toque', () => {
    const mac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
    expect(detectPlatform(mac, 5)).toBe('ios')
    expect(detectPlatform(mac, 0)).toBe('desktop')
  })
  it('outras smart TVs caem em genérico', () => {
    expect(detectPlatform('Mozilla/5.0 (Linux) Hisense VIDAA SmartTV')).toBe('tv')
  })
})

describe('deviceFrom e guideFor', () => {
  it('marca TV e dá o nome em português', () => {
    expect(deviceFrom(UA.webos)).toEqual({ platform: 'webos', isTV: true, label: 'TV LG (webOS)' })
    expect(deviceFrom(UA.windows).isTV).toBe(false)
  })
  it('computador usa o guia pc', () => {
    expect(guideFor('desktop')).toBe('pc')
    expect(guideFor('firetv')).toBe('androidtv')
    expect(guideFor('androidtv')).toBe('androidtv')
    expect(guideFor('webos')).toBe('tv')
    expect(guideFor('tizen')).toBe('tv')
    expect(guideFor('ios')).toBe('ios')
  })
})
