
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useState } from 'react'
import api from '../../api/api.js'

function AdminEquipe() {
  const [profissionais, setProfissionais] = useState([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [error, setError] = useState('')

  const load = async () => {
    const res = await api.get('/team/professionals')
    setProfissionais(res.data.users || [])
  }

  useEffect(() => {
    load().catch(() => {})
  }, [])

  const addProfissional = async () => {
    setError('')
    try {
      const res = await api.post('/auth/users', {
        ...form,
        role: 'profissional',
      })
      setProfissionais((prev) => [res.data.user, ...prev])
      setForm({ name: '', email: '', phone: '', password: '' })
    } catch {
      setError('NÃ£o foi possÃ­vel adicionar o profissional.')
    }
  }

  const removeProfissional = async (id) => {
    const ok = window.confirm('Deseja remover este profissional?')
    if (!ok) return
    await api.delete(`/auth/users/${id}`)
    setProfissionais((prev) => prev.filter((item) => item._id !== id && item.id !== id))
  }

  return (
    <section className="page">
      <div>
        <h1>Gerir equipe</h1>
        <p className="page-subtitle">Adicione e gerencie profissionais do salÃ£o.</p>
      </div>

      <div className="card" style={{ display: 'grid', gap: '1rem' }}>
        <h3>Novo profissional</h3>
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
        {error && <p style={{ color: '#b12a5b', margin: 0 }}>{error}</p>}
        <button className="btn btn-admin-equipe" type="button" onClick={addProfissional}>
          Adicionar profissional
        </button>
      </div>

      <div className="card">
        <h3>Profissionais cadastrados</h3>
        <table className="table table-compact">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>AÃ§Ãµes</th>
            </tr>
          </thead>
          <tbody>
            {profissionais.map((item) => (
              <tr key={item._id || item.id}>
                <td>{item.name}</td>
                <td title={item.email}>{item.email}</td>
                <td>{item.phone || '-'}</td>
                <td>
                  <button className="btn btn-admin-equipe" type="button" onClick={() => removeProfissional(item._id || item.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminEquipe




