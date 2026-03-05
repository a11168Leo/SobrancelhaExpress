
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useState } from 'react'
import api from '../../api/api.js'

function AdminNotificacoes() {
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
        <h1>NotificaÃ§Ãµes</h1>
        <p className="page-subtitle">AtualizaÃ§Ãµes importantes do dia.</p>
      </div>

      <div className="stats-grid">
        {notificacoes.map((item) => (
          <article className="card" key={item._id} style={{ display: 'grid', gap: '0.6rem' }}>
            <h3>{item.title}</h3>
            <p>{item.message}</p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                className="btn btn-admin-notificacoes"
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
                className="btn btn-admin-notificacoes"
                type="button"
                onClick={async () => {
                  await api.delete(`/notifications/${item._id}`)
                  setNotificacoes((prev) => prev.filter((n) => n._id !== item._id))
                }}
              >
                Remover
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default AdminNotificacoes




