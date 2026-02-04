import { useEffect, useState } from 'react'
import api from '../../api/api.js'

function AdminConfiguracoes() {
  const [settings, setSettings] = useState({
    startTime: '09:00',
    endTime: '19:00',
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/settings/business-hours')
      setSettings(res.data)
    }
    load().catch(() => {})
  }, [])

  const save = async () => {
    if (!settings.startTime || !settings.endTime) return
    if (settings.startTime >= settings.endTime) {
      setMessage('O horário inicial deve ser menor que o final.')
      return
    }
    await api.put('/settings/business-hours', settings)
    setMessage('Configurações salvas com sucesso.')
    setTimeout(() => setMessage(''), 2500)
  }

  return (
    <section className="page">
      <div>
        <h1>Configurações</h1>
        <p className="page-subtitle">Preferências do painel administrativo.</p>
      </div>

      <div className="card" style={{ display: 'grid', gap: '1rem' }}>
        <h3>Agenda</h3>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <input
            className="search"
            type="time"
            value={settings.startTime}
            onChange={(e) => setSettings((prev) => ({ ...prev, startTime: e.target.value }))}
          />
          <input
            className="search"
            type="time"
            value={settings.endTime}
            onChange={(e) => setSettings((prev) => ({ ...prev, endTime: e.target.value }))}
          />
          <button className="btn" type="button" onClick={save}>
            Salvar
          </button>
        </div>
        {message && <p style={{ color: '#5f9a8f', margin: 0 }}>{message}</p>}
      </div>
    </section>
  )
}

export default AdminConfiguracoes
