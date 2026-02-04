import { useEffect, useState } from 'react'
import api from '../../api/api.js'

function ProfessionalPerfil() {
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/auth/me')
      setUser(res.data.user)
      setForm({ name: res.data.user?.name || '', phone: res.data.user?.phone || '' })
    }
    load().catch(() => {})
  }, [])

  const save = async () => {
    const res = await api.patch('/auth/me', form)
    setUser(res.data.user)
    setMessage('Perfil atualizado com sucesso.')
    setTimeout(() => setMessage(''), 2500)
  }

  return (
    <section className="page">
      <div>
        <h1>Perfil</h1>
        <p className="page-subtitle">Seus dados pessoais.</p>
      </div>

      <div className="card" style={{ display: 'grid', gap: '1rem' }}>
        <input
          className="search"
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />
        <input
          className="search"
          placeholder="Telefone"
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
        />
        <button className="btn" type="button" onClick={save}>
          Salvar
        </button>
        {message && <p style={{ color: '#5f9a8f', margin: 0 }}>{message}</p>}
      </div>

      {user && <p style={{ color: 'var(--muted)' }}>Email: {user.email}</p>}
    </section>
  )
}

export default ProfessionalPerfil
