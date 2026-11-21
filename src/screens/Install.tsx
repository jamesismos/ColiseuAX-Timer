import { useEffect, useMemo, useState } from 'react'
import { Chips, Page } from '../components/ui'
import { currentDevice, guideFor, type GuideId } from '../lib/device'
import { GUIAS, ORDEM_GUIAS, PACOTES } from '../lib/guides'
import { useInstall, usePublicacao } from '../lib/install'

const comHost = (texto: string, host: string) => texto.split('{host}').join(host)

export default function Install() {
  const device = useMemo(() => currentDevice(), [])
  const [guia, setGuia] = useState<GuideId>(guideFor(device.platform))
  const { canPrompt, installed, prompt } = useInstall()
  const pub = usePublicacao()
  const host = window.location.protocol.startsWith('http') ? window.location.host : 'coliseu-ax-timer.vercel.app'
  const g = GUIAS[guia]
  const meu = guideFor(device.platform)
  const ordem = [meu, ...ORDEM_GUIAS.filter((id) => id !== meu)]

  useEffect(() => {
    document.querySelector<HTMLElement>('.install .btn.primary, .install .chip')?.focus()
  }, [])

  return (
    <Page title="Instalar">
      <div className="install">
        <p>
          Aparelho detectado: <strong>{device.label}</strong>
          {installed && ' (você já está usando o app instalado)'}
        </p>

        {canPrompt && !installed && (
          <div className="actions">
            <button className="btn primary big" onClick={() => void prompt()}>
              Adicionar à tela inicial deste aparelho
            </button>
          </div>
        )}

        <h2>Escolha o seu aparelho</h2>
        <Chips<GuideId> value={guia} onChange={setGuia} options={ordem.map((id) => ({ value: id, label: id === meu ? `${GUIAS[id].nome} (seu aparelho)` : GUIAS[id].nome }))} />

        {g.metodos.map((m) => {
          const disponivel = m.baixar ? pub?.arquivos?.[m.baixar] : undefined
          return (
            <section className="metodo" key={m.titulo}>
              <h2>{m.titulo}</h2>
              <ol>
                {m.passos.map((p) => (
                  <li key={p}>{comHost(p, host)}</li>
                ))}
              </ol>
              {m.baixar && (
                <div className="actions">
                  {disponivel === false || pub === null ? (
                    <span className="muted">Este pacote ainda não foi publicado.</span>
                  ) : (
                    <a className="btn primary" href={PACOTES[m.baixar].rota} download>
                      {PACOTES[m.baixar].rotulo}
                    </a>
                  )}
                  <span className="muted">
                    Endereço curto para digitar na TV: {host}
                    {PACOTES[m.baixar].rota}
                  </span>
                </div>
              )}
              {m.nota && <p className="muted">{m.nota}</p>}
            </section>
          )
        })}

        {pub && <p className="muted">Versão publicada: {pub.version}</p>}
      </div>
    </Page>
  )
}
