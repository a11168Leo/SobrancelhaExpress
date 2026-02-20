import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api, { API_BASE_URL } from '../../api/api.js'

const RECENT_VISIT_DAYS = 60

const getContactText = (client) => {
  const phone = client.phone?.trim()
  if (phone) return phone
  return client.email || '-'
}

function AdminClientes() {
  const [clientes, setClientes] = useState([])
  const [appointments, setAppointments] = useState([])
  const [search, setSearch] = useState('')
  const [visitFilter, setVisitFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      const [clientsRes, appointmentsRes] = await Promise.all([
        api.get('/team/clients'),
        api.get('/appointments/all'),
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

  const appointmentStatsByClient = useMemo(() => {
    const map = new Map()
    for (const item of appointments) {
      const clientId = item.client?._id
      if (!clientId) continue
      const current = map.get(clientId) || { count: 0, last: null }
      const nextCount = current.count + 1
      const last =
        !current.last || new Date(item.startTime) > new Date(current.last.startTime)
          ? item
          : current.last
      map.set(clientId, { count: nextCount, last })
    }
    return map
  }, [appointments])

  const rows = useMemo(() => {
    const now = dayjs()
    return clientes.map((client) => {
      const stats = appointmentStatsByClient.get(client._id) || { count: 0, last: null }
      const lastVisit = stats.last?.startTime ? dayjs(stats.last.startTime) : null
      const inactiveDays = lastVisit ? now.diff(lastVisit, 'day') : null
      const isRecent = inactiveDays !== null && inactiveDays <= RECENT_VISIT_DAYS

      return {
        id: client._id,
        name: client.name || 'Cliente',
        email: client.email || '-',
        phone: client.phone || '',
        avatar: client.avatar || '',
        contact: getContactText(client),
        totalAppointments: stats.count,
        lastService: stats.last?.service?.name || '-',
        lastVisit,
        lastVisitText: lastVisit ? lastVisit.format('DD/MM/YYYY') : '-',
        statusLabel: lastVisit ? (isRecent ? 'Ativa' : 'Inativa') : 'Sem visita',
        statusClass: lastVisit ? (isRecent ? 'active' : 'inactive') : 'empty',
      }
    })
  }, [appointmentStatsByClient, clientes])

  const summary = useMemo(() => {
    const active = rows.filter((item) => item.statusClass === 'active').length
    const withPhone = rows.filter((item) => item.phone).length
    const withoutVisits = rows.filter((item) => item.totalAppointments === 0).length
    return { active, withPhone, withoutVisits }
  }, [rows])

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const filtered = rows.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.contact.toLowerCase().includes(normalizedSearch) ||
        item.lastService.toLowerCase().includes(normalizedSearch)

      if (!matchesSearch) return false

      if (visitFilter === 'active') return item.statusClass === 'active'
      if (visitFilter === 'inactive') return item.statusClass === 'inactive'
      if (visitFilter === 'empty') return item.statusClass === 'empty'
      return true
    })

    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'pt-BR')
      if (sortBy === 'appointments') return b.totalAppointments - a.totalAppointments

      const aDate = a.lastVisit?.valueOf() || 0
      const bDate = b.lastVisit?.valueOf() || 0
      return bDate - aDate
    })

    return filtered
  }, [rows, search, visitFilter, sortBy])

  return (
    <section className="page">
      <div className="clientes-header">
        <div>
          <h1>Clientes</h1>
          <p className="page-subtitle">Base de clientes com busca, status e ultimos atendimentos.</p>
        </div>
        <div className="clientes-header-badge">{filteredRows.length} exibidos</div>
      </div>

      <div className="stats-grid">
        <article className="card">
          <h3>Total de clientes</h3>
          <div className="clientes-stat-value">{rows.length}</div>
          <p>Base cadastrada</p>
        </article>
        <article className="card">
          <h3>Clientes ativos</h3>
          <div className="clientes-stat-value">{summary.active}</div>
          <p>Visita nos ultimos {RECENT_VISIT_DAYS} dias</p>
        </article>
        <article className="card">
          <h3>Com telefone</h3>
          <div className="clientes-stat-value">{summary.withPhone}</div>
          <p>Contato rapido disponivel</p>
        </article>
        <article className="card">
          <h3>Sem visitas</h3>
          <div className="clientes-stat-value">{summary.withoutVisits}</div>
          <p>Ainda sem historico</p>
        </article>
      </div>

      <div className="card clientes-card">
        <div className="clientes-toolbar">
          <input
            className="search clientes-search"
            type="search"
            placeholder="Buscar por nome, contato ou servico"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="search clientes-filter"
            value={visitFilter}
            onChange={(event) => setVisitFilter(event.target.value)}
          >
            <option value="all">Todas</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
            <option value="empty">Sem visita</option>
          </select>
          <select
            className="search clientes-filter"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="recent">Ordenar por ultima visita</option>
            <option value="name">Ordenar por nome</option>
            <option value="appointments">Ordenar por atendimentos</option>
          </select>
        </div>

        {loading && <p className="clientes-feedback">Carregando clientes...</p>}
        {!loading && error && <p className="clientes-feedback error">{error}</p>}

        {!loading && !error && (
          <div className="clientes-table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contato</th>
                  <th>Ultimo servico</th>
                  <th>Atendimentos</th>
                  <th>Ultima visita</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="clientes-user">
                        {item.avatar ? (
                          <img
                            src={item.avatar.startsWith('http') ? item.avatar : `${API_BASE_URL}${item.avatar}`}
                            alt={item.name}
                            className="clientes-avatar"
                          />
                        ) : (
                          <div className="clientes-avatar clientes-avatar-fallback">
                            {item.name?.[0]?.toUpperCase() || 'C'}
                          </div>
                        )}
                        <div>
                          <strong>{item.name}</strong>
                          <p>{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{item.contact}</td>
                    <td>{item.lastService}</td>
                    <td>{item.totalAppointments}</td>
                    <td>{item.lastVisitText}</td>
                    <td>
                      <span className={`clientes-status ${item.statusClass}`}>{item.statusLabel}</span>
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={6}>Nenhum cliente encontrado para o filtro atual.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminClientes
