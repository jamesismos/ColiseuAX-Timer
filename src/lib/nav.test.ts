import { describe, expect, it } from 'vitest'
import { keyAction } from './nav'

describe('keyAction (controles de TV)', () => {
  it('setas por nome e por código (TVs antigas)', () => {
    expect(keyAction({ key: 'ArrowUp' })).toBe('up')
    expect(keyAction({ key: 'Unidentified', keyCode: 40 })).toBe('down')
    expect(keyAction({ keyCode: 37 })).toBe('left')
    expect(keyAction({ key: 'Right' })).toBe('right')
  })
  it('voltar em Android TV, Fire TV, Tizen, webOS e teclado', () => {
    expect(keyAction({ key: 'GoBack' })).toBe('back')
    expect(keyAction({ key: 'Unidentified', keyCode: 4 })).toBe('back')
    expect(keyAction({ keyCode: 10009 })).toBe('back') // Samsung
    expect(keyAction({ keyCode: 461 })).toBe('back') // LG
    expect(keyAction({ key: 'Escape' })).toBe('back')
    expect(keyAction({ key: 'Backspace' })).toBe('back')
  })
  it('Backspace não volta quando está digitando', () => {
    expect(keyAction({ key: 'Backspace' }, true)).toBeNull()
  })
  it('OK do Android (DPAD_CENTER) vira seleção; Enter fica com o navegador', () => {
    expect(keyAction({ keyCode: 23 })).toBe('select')
    expect(keyAction({ key: 'Enter', keyCode: 13 })).toBeNull()
  })
  it('teclas de mídia', () => {
    expect(keyAction({ key: 'MediaPlayPause' })).toBe('playpause')
    expect(keyAction({ keyCode: 415 })).toBe('play')
    expect(keyAction({ keyCode: 19 })).toBe('pause')
    expect(keyAction({ keyCode: 417 })).toBe('next')
    expect(keyAction({ keyCode: 412 })).toBe('prev')
  })
  it('tecla desconhecida não faz nada', () => {
    expect(keyAction({ key: 'a', keyCode: 65 })).toBeNull()
  })
})
