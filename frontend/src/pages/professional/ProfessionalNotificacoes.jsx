import { useEffect, useState } from 'react'
import api from '../../api/api.js'

function ProfessionalNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([])

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/notifications/me')
      setNotificacoes(res.data.notifications || [])
    }
    load().catch(() => {})
  }, [])

  return (
    <section className="page">
      <div>
        <h1>Notificações</h1>
        <p className="page-subtitle">Avisos e lembretes do sistema.</p>
      </div>

      <div className="card" style={{ display: 'grid', gap: '0.8rem' }}>
        {notificacoes.length === 0 && (
          <div className="notify-item">
            <h5>Sem notificações</h5>
            <p>Você está em dia.</p>
          </div>
        )}
        {notificacoes.map((item) => (
          <div
            key={item._id}
            className="notify-item"
            style={{ display: 'grid', gap: '0.4rem' }}
          >
            <h5>{item.title}</h5>
            <p>{item.message}</p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                className="btn"
                type="button"
                onClick={async () => {
                  await api.patch(`/notifications/${item._id}/read`)
                  setNotificacoes((prev) =>
                    prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
                  )
                }}
              >
                Marcar como lida
              </button>
              <button
                className="btn"
                type="button"
                onClick={async () => {
                  await api.delete(`/notifications/${item._id}`)
                  setNotificacoes((prev) => prev.filter((n) => n._id !== item._id))
                }}
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ProfessionalNotificacoes
