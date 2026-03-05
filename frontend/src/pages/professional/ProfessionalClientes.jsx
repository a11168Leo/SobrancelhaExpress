
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api from '../../api/api.js'

function ProfessionalClientes() {
  const [clientes, setClientes] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      const me = await api.get('/auth/me')
      const [clientsRes, appointmentsRes] = await Promise.all([
        api.get('/team/clients'),
        api.get(`/appointments/professional/${me.data.user.id}`),
      ])
      setClientes(clientsRes.data.users || [])
      setAppointments(appointmentsRes.data.appointments || [])
      setLoading(false)
    }

    load().catch(() => {
      setError('Nao foi possivel carregar os clientes.')
      setLoading(false)
    })
  }, [])

  const appointmentMapByClient = useMemo(() => {
    const map = new Map()
    for (const item of appointments) {
      const client = item.client
      if (!client?._id) continue
      const current = map.get(client._id)
      if (!current || new Date(item.startTime) > new Date(current.lastVisit)) {
        map.set(client._id, {
          lastService: item.service?.name || '-',
          lastVisit: item.startTime,
          duration: item.service?.maxDurationMinutes || item.service?.durationMinutes || 0,
        })
      }
    }
    return map
  }, [appointments])

  const clients = useMemo(() => {
    return clientes.map((client) => {
      const stats = appointmentMapByClient.get(client._id)
      return {
        id: client._id,
        name: client.name || 'Cliente',
        email: client.email || '-',
        phone: client.phone || '-',
        lastService: stats?.lastService || '-',
        lastVisit: stats?.lastVisit || null,
        duration: stats?.duration || 0,
      }
    })
  }, [appointmentMapByClient, clientes])

  const handleCreateClient = async () => {
    setFormError('')
    if (!form.name || !form.email || !form.password) {
      setFormError('Preencha nome, email e senha.')
      return
    }

    setSaving(true)
    try {
      const res = await api.post('/auth/users', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'cliente',
      })

      const created = res.data.user
      setClientes((prev) => [
        {
          _id: created._id || created.id,
          name: created.name,
          email: created.email,
          phone: created.phone || '',
        },
        ...prev,
      ])
      setForm({ name: '', email: '', phone: '', password: '' })
    } catch (err) {
      setFormError(err.response?.data?.message || 'Nao foi possivel criar o cliente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page">
      <div>
        <h1>Clientes</h1>
        <p className="page-subtitle">Clientes do salao e criacao rapida por profissional.</p>
      </div>

      <div className="card" style={{ display: 'grid', gap: '1rem' }}>
        <h3>Novo cliente</h3>
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          <input
            className="search"
            placeholder="Nome completo"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            className="search"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
            className="search"
            placeholder="Telefone"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <input
            className="search"
            placeholder="Senha"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
        </div>
        {formError && <p style={{ color: '#b12a5b', margin: 0 }}>{formError}</p>}
        <button className="btn btn-profissional-clientes" type="button" onClick={handleCreateClient} disabled={saving}>
          {saving ? 'Salvando...' : 'Adicionar cliente'}
        </button>
      </div>

      <div className="card">
        {loading && <p style={{ margin: 0 }}>Carregando clientes...</p>}
        {!loading && error && <p style={{ margin: 0, color: '#b12a5b' }}>{error}</p>}

        {!loading && !error && (
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Ultimo servico</th>
                <th>Duracao</th>
                <th>Ultima visita</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.phone || '-'}</td>
                  <td>{item.lastService}</td>
                  <td>{item.duration ? `${item.duration} min` : '-'}</td>
                  <td>{item.lastVisit ? dayjs(item.lastVisit).format('DD/MM/YYYY') : '-'}</td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6}>Sem clientes no momento.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export default ProfessionalClientes





