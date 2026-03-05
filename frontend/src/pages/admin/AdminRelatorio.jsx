
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api from '../../api/api.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
)

function AdminRelatorio() {
  const [data, setData] = useState(null)
  const [professionals, setProfessionals] = useState([])
  const [financials, setFinancials] = useState([])
  const [professionalId, setProfessionalId] = useState('')
  const [range, setRange] = useState({
    startA: dayjs().startOf('month').format('YYYY-MM-DD'),
    endA: dayjs().endOf('month').format('YYYY-MM-DD'),
    startB: dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
    endB: dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
  })

  const ranges = useMemo(() => {
    const startA = dayjs(range.startA).startOf('day').toISOString()
    const endA = dayjs(range.endA).endOf('day').toISOString()
    const startB = dayjs(range.startB).startOf('day').toISOString()
    const endB = dayjs(range.endB).endOf('day').toISOString()
    return { startA, endA, startB, endB }
  }, [range])

  useEffect(() => {
    const load = async () => {
      const [reportRes, profRes, financialRes] = await Promise.all([
        api.get(
          `/financial/report/compare?startA=${ranges.startA}&endA=${ranges.endA}&startB=${ranges.startB}&endB=${ranges.endB}${
            professionalId ? `&professionalId=${professionalId}` : ''
          }`
        ),
        api.get('/team/professionals'),
        api.get('/financial'),
      ])
      setData(reportRes.data)
      setProfessionals(profRes.data.users || [])
      setFinancials(financialRes.data.financials || [])
    }

    load().catch(() => {})
  }, [ranges, professionalId])

  return (
    <section className="page">
      <div>
        <h1>RelatÃ³rio</h1>
        <p className="page-subtitle">Comparativo por perÃ­odo e por profissional.</p>
      </div>

      <div className="card" style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          <label>PerÃ­odo atual</label>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <input
              className="search"
              type="date"
              value={range.startA}
              onChange={(e) => setRange((prev) => ({ ...prev, startA: e.target.value }))}
            />
            <input
              className="search"
              type="date"
              value={range.endA}
              onChange={(e) => setRange((prev) => ({ ...prev, endA: e.target.value }))}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          <label>PerÃ­odo anterior</label>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <input
              className="search"
              type="date"
              value={range.startB}
              onChange={(e) => setRange((prev) => ({ ...prev, startB: e.target.value }))}
            />
            <input
              className="search"
              type="date"
              value={range.endB}
              onChange={(e) => setRange((prev) => ({ ...prev, endB: e.target.value }))}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          <label>Profissional</label>
          <select
            className="search"
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
          >
            <option value="">Todas as profissionais</option>
            {professionals.map((prof) => (
              <option key={prof._id || prof.id} value={prof._id || prof.id}>
                {prof.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <article className="card">
          <h3>PerÃ­odo atual</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            EUR {Number(data?.periodA?.total || 0).toFixed(2)}
          </div>
          <p>{dayjs(range.startA).format('DD MMM')} a {dayjs(range.endA).format('DD MMM')}</p>
        </article>
        <article className="card">
          <h3>PerÃ­odo anterior</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            EUR {Number(data?.periodB?.total || 0).toFixed(2)}
          </div>
          <p>{dayjs(range.startB).format('DD MMM')} a {dayjs(range.endB).format('DD MMM')}</p>
        </article>
        <article className="card">
          <h3>VariaÃ§Ã£o</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            {data?.percent === null ? 'N/A' : `${data?.percent}%`}
          </div>
          <p>DiferenÃ§a: EUR {Number(data?.difference || 0).toFixed(2)}</p>
        </article>
      </div>

      <div className="card">
        <h3>Comparativo visual</h3>
        <Bar
          data={{
            labels: ['PerÃ­odo atual', 'PerÃ­odo anterior'],
            datasets: [
              {
                label: 'Receita',
                data: [
                  Number(data?.periodA?.total || 0),
                  Number(data?.periodB?.total || 0),
                ],
                backgroundColor: ['#d988b3', '#5f9a8f'],
                borderRadius: 8,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: { ticks: { callback: (value) => `EUR ${value}` } },
            },
          }}
        />
      </div>

      <div className="card">
        <h3>Receita diÃ¡ria (perÃ­odo atual)</h3>
        <Line
          data={{
            labels: (() => {
              const start = dayjs(range.startA)
              const end = dayjs(range.endA)
              const days = []
              let current = start
              while (current.isBefore(end) || current.isSame(end, 'day')) {
                days.push(current.format('DD/MM'))
                current = current.add(1, 'day')
              }
              return days
            })(),
            datasets: [
              {
                label: 'Receita',
                data: (() => {
                  const start = dayjs(range.startA).startOf('day')
                  const end = dayjs(range.endA).endOf('day')
                  const grouped = new Map()
                  financials
                    .filter((item) => {
                      const created = dayjs(item.createdAt)
                      return created.isAfter(start) && created.isBefore(end)
                    })
                    .forEach((item) => {
                      const key = dayjs(item.createdAt).format('DD/MM')
                      grouped.set(key, (grouped.get(key) || 0) + Number(item.amount || 0))
                    })
                  const labels = []
                  let current = start
                  while (current.isBefore(end) || current.isSame(end, 'day')) {
                    labels.push(grouped.get(current.format('DD/MM')) || 0)
                    current = current.add(1, 'day')
                  }
                  return labels
                })(),
                borderColor: '#d988b3',
                backgroundColor: 'rgba(217, 136, 179, 0.2)',
                tension: 0.35,
                fill: true,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: { ticks: { callback: (value) => `EUR ${value}` } },
            },
          }}
        />
      </div>

      <div className="card">
        <h3>Resumo por profissional</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Profissional</th>
              <th>Atendimentos</th>
              <th>Receita</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const start = dayjs(range.startA).startOf('day')
              const end = dayjs(range.endA).endOf('day')
              const byProf = new Map()
              financials
                .filter((item) => {
                  const created = dayjs(item.createdAt)
                  return created.isAfter(start) && created.isBefore(end)
                })
                .forEach((item) => {
                  const profId = item.professional?._id || item.professional
                  if (!byProf.has(profId)) {
                    byProf.set(profId, { count: 0, total: 0 })
                  }
                  const current = byProf.get(profId)
                  current.count += 1
                  current.total += Number(item.amount || 0)
                })

              const rows = professionals.map((prof) => {
                const stats = byProf.get(prof._id || prof.id) || { count: 0, total: 0 }
                return (
                  <tr key={prof._id || prof.id}>
                    <td>{prof.name}</td>
                    <td>{stats.count}</td>
                    <td>EUR {stats.total.toFixed(2)}</td>
                  </tr>
                )
              })

              return rows.length ? rows : (
                <tr>
                  <td colSpan={3}>Sem dados no perÃ­odo.</td>
                </tr>
              )
            })()}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminRelatorio



