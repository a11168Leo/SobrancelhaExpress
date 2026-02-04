import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import api from '../../api/api.js'

function ProfessionalFinanceiro() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/financial')
      setItems(res.data.financials || [])
    }
    load().catch(() => {})
  }, [])

  return (
    <section className="page">
      <div>
        <h1>Financeiro</h1>
        <p className="page-subtitle">Seus recebimentos e status.</p>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{dayjs(item.createdAt).format('DD/MM')}</td>
                <td>{item.notes || 'Atendimento'}</td>
                <td>EUR {Number(item.amount || 0).toFixed(2)}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ProfessionalFinanceiro
