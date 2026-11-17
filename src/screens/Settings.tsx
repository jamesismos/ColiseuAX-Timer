import { useState } from 'react'
import { Chips, Page, Stepper } from '../components/ui'
import { playPhaseStart, unlockAudio } from '../lib/audio'
import { DEFAULT_PHRASES } from '../lib/engine'
import { DEFAULT_SETTINGS, resetAll, useSettings, type SoundStyle } from '../lib/storage'

const COLORS = ['#d10f1c', '#a80812', '#d9dadf', '#ffffff', '#f5b301', '#3b82f6']

export default function Settings() {
  const [s, set] = useSettings()
  const [confirm, setConfirm] = useState(false)

  const onLogo = (file?: File) => {
    if (!file) return
    if (file.size > 1_500_000) {
      alert('Imagem muito grande. Use até 1,5 MB.')
      return
    }
    const r = new FileReader()
    r.onload = () => set({ logoData: String(r.result) })
    r.readAsDataURL(file)
  }

  return (
    <Page title="Personalizar">
      <label className="field">
        <span>Nome da academia</span>
        <input value={s.academy} onChange={(e) => set({ academy: e.target.value })} maxLength={30} />
      </label>
      <label className="field">
        <span>Equipe</span>
        <input value={s.team} onChange={(e) => set({ team: e.target.value })} maxLength={30} />
      </label>
      <div className="field">
        <span>Cor de destaque</span>
        <div className="chips">
          {COLORS.map((c) => (
            <button key={c} className={`swatch ${s.accent === c ? 'on' : ''}`} style={{ background: c }} onClick={() => set({ accent: c })} aria-label={`Cor ${c}`} />
          ))}
        </div>
      </div>

      <div className="field">
        <span>Logo (opcional)</span>
        <div className="chips">
          <label className="btn file">
            Escolher imagem
            <input type="file" accept="image/*" onChange={(e) => onLogo(e.target.files?.[0])} hidden />
          </label>
          {s.logoData && (
            <button className="btn danger" onClick={() => set({ logoData: '' })}>
              Remover logo
            </button>
          )}
        </div>
      </div>

      <label className="field">
        <span>Imagem de fundo (endereço da imagem, opcional)</span>
        <input type="url" value={s.bgUrl} onChange={(e) => set({ bgUrl: e.target.value })} placeholder="https://..." />
      </label>

      <div className="field">
        <span>Som</span>
        <Chips<SoundStyle>
          value={s.sound}
          onChange={(v) => set({ sound: v })}
          options={[
            { value: 'arena', label: 'Timer de parede' },
            { value: 'sino', label: 'Sino clássico' },
            { value: 'beep', label: 'Beep' },
            { value: 'buzina', label: 'Buzina' },
            { value: 'mudo', label: 'Mudo' },
          ]}
        />
        <button
          className="btn"
          onClick={() => {
            unlockAudio()
            playPhaseStart('work')
          }}
        >
          Testar som
        </button>
      </div>
      <Stepper label="Volume" value={s.volume} onChange={(n) => set({ volume: n })} min={0} max={100} steps={[5, 20]} />

      <div className="field">
        <span>Frases motivacionais</span>
        <Chips<'sim' | 'nao'> value={s.showPhrases ? 'sim' : 'nao'} onChange={(v) => set({ showPhrases: v === 'sim' })} options={[{ value: 'sim', label: 'Mostrar' }, { value: 'nao', label: 'Ocultar' }]} />
        <textarea rows={5} value={s.phrases.join('\n')} onChange={(e) => set({ phrases: e.target.value.split('\n') })} aria-label="Frases, uma por linha" />
        <button className="btn" onClick={() => set({ phrases: DEFAULT_PHRASES })}>
          Restaurar frases padrão
        </button>
      </div>

      <div className="actions">
        {!confirm ? (
          <button className="btn danger" onClick={() => setConfirm(true)}>
            Restaurar tudo
          </button>
        ) : (
          <>
            <button
              className="btn danger"
              onClick={() => {
                resetAll()
                setConfirm(false)
              }}
            >
              Confirmar: apagar timers, playlists e ajustes
            </button>
            <button className="btn" onClick={() => setConfirm(false)}>
              Cancelar
            </button>
          </>
        )}
      </div>
      <p className="muted">Versão {DEFAULT_SETTINGS.academy} Timer 1.0</p>
    </Page>
  )
}
