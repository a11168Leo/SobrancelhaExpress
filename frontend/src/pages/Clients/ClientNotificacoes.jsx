
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useState } from 'react'
import { fetchJson } from '../../services/api'

function ClientNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([])

  useEffect(() => {
    const load = async () => {
      const res = await fetchJson('/notifications/me')
      setNotificacoes(res?.notifications || [])
    }
    load().catch(() => {})
  }, [])

  return (
    <section className="page">
      <div>
        <h1>Notificacoes</h1>
        <p className="page-subtitle">Mensagens importantes da sua conta.</p>
      </div>

      <div className="card" style={{ display: 'grid', gap: '0.8rem' }}>
        {notificacoes.length === 0 && (
          <div className="notify-item">
            <h5>Sem notificacoes</h5>
            <p>Nao ha novidades no momento.</p>
          </div>
        )}

        {notificacoes.map((item) => (
          <div key={item._id} className="notify-item" style={{ display: 'grid', gap: '0.5rem' }}>
            <h5>{item.title}</h5>
            <p>{item.message}</p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {!item.read && (
                <button
                  className="btn"
                  type="button"
                  onClick={async () => {
                    await fetchJson(`/notifications/${item._id}/read`, { method: 'PATCH' })
                    setNotificacoes((prev) =>
                      prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
                    )
                  }}
                >
                  Marcar como lida
                </button>
              )}
              <button
                className="btn"
                type="button"
                onClick={async () => {
                  await fetchJson(`/notifications/${item._id}`, { method: 'DELETE' })
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

export default ClientNotificacoes




