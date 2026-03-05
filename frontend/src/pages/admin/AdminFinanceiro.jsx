
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api from '../../api/api.js'

function AdminFinanceiro() {
  const [entradas, setEntradas] = useState([])
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(0)

  const range = useMemo(() => {
    const start = dayjs().startOf('month').toISOString()
    const end = dayjs().endOf('month').toISOString()
    return { start, end }
  }, [])

  useEffect(() => {
    const load = async () => {
      const [listRes, reportRes] = await Promise.all([
        api.get('/financial'),
        api.get(`/financial/report?start=${range.start}&end=${range.end}`),
      ])

      const items = listRes.data.financials || []
      setEntradas(items)
      setTotal(reportRes.data.total || 0)
      setOpen(items.filter((item) => item.status === 'open').reduce((sum, item) => sum + item.amount, 0))
    }

    load().catch(() => {})
  }, [range])

  return (
    <section className="page">
      <div>
        <h1>Financeiro</h1>
        <p className="page-subtitle">LanÃ§amentos e status de pagamentos.</p>
      </div>

      <div className="stats-grid">
        <article className="card">
          <h3>Faturamento do mÃªs</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            EUR {Number(total).toFixed(2)}
          </div>
          <p>PerÃ­odo atual</p>
        </article>
        <article className="card">
          <h3>Pagamentos em aberto</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            EUR {Number(open).toFixed(2)}
          </div>
          <p>{entradas.filter((item) => item.status === 'open').length} lanÃ§amentos pendentes</p>
        </article>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>DescriÃ§Ã£o</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {entradas.map((item) => (
              <tr key={item._id}>
                <td>{dayjs(item.createdAt).format('DD/MM')}</td>
                <td>{item.notes || 'Atendimento'}</td>
                <td>EUR {Number(item.amount).toFixed(2)}</td>
                <td>
                  <span className="pill">{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminFinanceiro



