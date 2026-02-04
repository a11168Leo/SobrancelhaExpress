import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api from '../../api/api.js'

function ProfessionalDashboard() {
  const [appointments, setAppointments] = useState([])
  const [financials, setFinancials] = useState([])
  const [services, setServices] = useState([])

  useEffect(() => {
    const load = async () => {
      const me = await api.get('/auth/me')
      const [appointmentsRes, financialRes, servicesRes] = await Promise.all([
        api.get(`/appointments/professional/${me.data.user.id}`),
        api.get('/financial'),
        api.get(`/services?professionalId=${me.data.user.id}`),
      ])
      setAppointments(appointmentsRes.data.appointments || [])
      setFinancials(financialRes.data.financials || [])
      setServices(servicesRes.data.services || [])
    }
    load().catch(() => {})
  }, [])

  const stats = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    const todayCount = appointments.filter(
      (item) => dayjs(item.startTime).format('YYYY-MM-DD') === today
    ).length
    const month = dayjs().format('YYYY-MM')
    const monthTotal = financials
      .filter((item) => dayjs(item.createdAt).format('YYYY-MM') === month)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
    return { todayCount, monthTotal }
  }, [appointments, financials])

  return (
    <section className="page">
      <div>
        <h1>Dashboard</h1>
        <p className="page-subtitle">Resumo da sua agenda e faturamento.</p>
      </div>

      <div className="stats-grid">
        <article className="card">
          <h3>Agendamentos hoje</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.todayCount}</div>
          <p>Seu total diário</p>
        </article>
        <article className="card">
          <h3>Faturamento do mês</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            EUR {stats.monthTotal.toFixed(2)}
          </div>
          <p>Seu total no período</p>
        </article>
        <article className="card">
          <h3>Serviços ativos</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{services.length}</div>
          <p>Catálogo pessoal</p>
        </article>
      </div>
    </section>
  )
}

export default ProfessionalDashboard
