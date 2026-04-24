
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useState } from 'react'
import { fetchFormData, fetchJson, getServiceUrl } from '../../services/api'

function ClientPerfil() {
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const res = await fetchJson('/auth/me')
      setUser(res?.user || null)
      setForm({ name: res?.user?.name || '', phone: res?.user?.phone || '' })
      if (res?.user?.avatar) {
        const avatarUrl = getServiceUrl(res.user.avatar)
        setAvatarPreview(avatarUrl)
      }
    }
    load().catch(() => {})
  }, [])

  const saveProfile = async () => {
    const res = await fetchJson('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(form),
    })
    setUser(res?.user || null)
    setMessage('Perfil atualizado com sucesso.')
    setTimeout(() => setMessage(''), 2500)
  }

  const savePassword = async () => {
    await fetchJson('/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify(passwords),
    })
    setPasswords({ currentPassword: '', newPassword: '' })
    setMessage('Senha atualizada com sucesso.')
    setTimeout(() => setMessage(''), 2500)
  }

  const saveAvatar = async () => {
    if (!avatarFile) return
    const body = new FormData()
    body.append('image', avatarFile)
    const res = await fetchFormData('/auth/me/avatar', {
      method: 'PATCH',
      body,
    })
    setUser(res?.user || null)
    setMessage('Avatar atualizado com sucesso.')
    setTimeout(() => setMessage(''), 2500)
  }

  return (
    <section className="page">
      <div>
        <h1>Perfil</h1>
        <p className="page-subtitle">Atualize seus dados e sua senha.</p>
      </div>

      <div className="card" style={{ display: 'grid', gap: '0.8rem' }}>
        <h3>Dados da conta</h3>
        {avatarPreview && (
          <img
            src={avatarPreview}
            alt="Avatar"
            style={{ width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0] || null
            setAvatarFile(file)
            if (file) setAvatarPreview(URL.createObjectURL(file))
          }}
        />
        <button className="btn" type="button" onClick={saveAvatar}>
          Atualizar avatar
        </button>

        <input
          className="search"
          placeholder="Nome"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <input
          className="search"
          placeholder="Telefone"
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
        />
        <button className="btn" type="button" onClick={saveProfile}>
          Salvar perfil
        </button>
      </div>

      <div className="card" style={{ display: 'grid', gap: '0.8rem' }}>
        <h3>Senha</h3>
        <input
          className="search"
          type="password"
          placeholder="Senha atual"
          value={passwords.currentPassword}
          onChange={(event) =>
            setPasswords((prev) => ({ ...prev, currentPassword: event.target.value }))
          }
        />
        <input
          className="search"
          type="password"
          placeholder="Nova senha"
          value={passwords.newPassword}
          onChange={(event) => setPasswords((prev) => ({ ...prev, newPassword: event.target.value }))}
        />
        <button className="btn" type="button" onClick={savePassword}>
          Atualizar senha
        </button>
      </div>

      {message && <p style={{ color: '#5f9a8f' }}>{message}</p>}
      {user && <p style={{ color: 'var(--client-muted)' }}>Email: {user.email}</p>}
    </section>
  )
}

export default ClientPerfil




