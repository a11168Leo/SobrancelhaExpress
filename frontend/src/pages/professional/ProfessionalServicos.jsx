import { useEffect, useState } from 'react'
import api from '../../api/api.js'

function ProfessionalServicos() {
  const [servicos, setServicos] = useState([])

  useEffect(() => {
    const load = async () => {
      const me = await api.get('/auth/me')
      const res = await api.get(`/services?professionalId=${me.data.user.id}`)
      setServicos(res.data.services || [])
    }
    load().catch(() => {})
  }, [])

  return (
    <section className="page">
      <div>
        <h1>Serviços</h1>
        <p className="page-subtitle">Catálogo de serviços disponíveis.</p>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Serviço</th>
              <th>Preço</th>
              <th>Duração</th>
            </tr>
          </thead>
          <tbody>
            {servicos.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>EUR {Number(item.price || 0).toFixed(2)}</td>
                <td>{item.maxDurationMinutes || item.durationMinutes} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ProfessionalServicos
