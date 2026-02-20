import { useState } from 'react'

function ClientConfiguracoes() {
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('clientPreferences')
    return saved
      ? JSON.parse(saved)
      : {
          emailNotifications: true,
          reminderNotifications: true,
          compactTable: false,
        }
  })
  const [message, setMessage] = useState('')

  const save = () => {
    localStorage.setItem('clientPreferences', JSON.stringify(preferences))
    setMessage('Configuracoes salvas.')
    setTimeout(() => setMessage(''), 2500)
  }

  return (
    <section className="page">
      <div>
        <h1>Configuracoes</h1>
        <p className="page-subtitle">Preferencias da sua experiencia no painel.</p>
      </div>

      <div className="card" style={{ display: 'grid', gap: '0.8rem' }}>
        <h3>Notificacoes</h3>
        <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={preferences.emailNotifications}
            onChange={(event) =>
              setPreferences((prev) => ({ ...prev, emailNotifications: event.target.checked }))
            }
          />
          Receber avisos por email
        </label>
        <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={preferences.reminderNotifications}
            onChange={(event) =>
              setPreferences((prev) => ({ ...prev, reminderNotifications: event.target.checked }))
            }
          />
          Receber lembretes de agendamento
        </label>
        <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={preferences.compactTable}
            onChange={(event) =>
              setPreferences((prev) => ({ ...prev, compactTable: event.target.checked }))
            }
          />
          Tabela compacta
        </label>
        <button className="btn" type="button" onClick={save}>
          Salvar
        </button>
        {message && <p style={{ color: '#5f9a8f', margin: 0 }}>{message}</p>}
      </div>
    </section>
  )
}

export default ClientConfiguracoes

