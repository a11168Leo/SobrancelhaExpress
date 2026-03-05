
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useState } from 'react'
import api, { API_BASE_URL } from '../../api/api.js'

function ProfessionalPerfil() {
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', about: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [message, setMessage] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/auth/me')
      setUser(res.data.user)
      setForm({
        name: res.data.user?.name || '',
        phone: res.data.user?.phone || '',
        about: res.data.user?.about || '',
      })
      if (res.data.user?.avatar) {
        const avatarUrl = res.data.user.avatar.startsWith('http')
          ? res.data.user.avatar
          : `${API_BASE_URL}${res.data.user.avatar}`
        setAvatarPreview(avatarUrl)
      }
    }
    load().catch(() => {})
  }, [])

  const saveProfile = async () => {
    const res = await api.patch('/auth/me', form)
    setUser(res.data.user)
    setMessage('Perfil atualizado com sucesso.')
    setTimeout(() => setMessage(''), 2500)
  }

  const changePassword = async () => {
    await api.patch('/auth/me/password', passwords)
    setPasswords({ currentPassword: '', newPassword: '' })
    setMessage('Senha atualizada com sucesso.')
    setTimeout(() => setMessage(''), 2500)
  }

  const createSquareImage = (file, size = 512) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d')

          const minSide = Math.min(img.width, img.height)
          const sx = (img.width - minSide) / 2
          const sy = (img.height - minSide) / 2

          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size)
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Falha ao processar imagem.'))
              return
            }
            resolve(blob)
          }, 'image/jpeg', 0.9)
        }
        img.onerror = () => reject(new Error('Falha ao carregar imagem.'))
        img.src = reader.result
      }
      reader.onerror = () => reject(new Error('Falha ao ler arquivo.'))
      reader.readAsDataURL(file)
    })

  const uploadAvatar = async () => {
    if (!avatarFile) return
    if (avatarFile.size > 2 * 1024 * 1024) {
      setAvatarError('A imagem deve ter no mÃ¡ximo 2MB.')
      return
    }

    setUploadProgress(0)
    try {
      const processedBlob = await createSquareImage(avatarFile, 512)
      const body = new FormData()
      body.append('image', processedBlob, 'avatar.jpg')
      const res = await api.patch('/auth/me/avatar', body, {
        onUploadProgress: (evt) => {
          if (!evt.total) return
          const percent = Math.round((evt.loaded * 100) / evt.total)
          setUploadProgress(percent)
        },
      })
      setUser(res.data.user)
      setMessage('Avatar atualizado com sucesso.')
      setTimeout(() => setMessage(''), 2500)
      setUploadProgress(0)
    } catch {
      setAvatarError('NÃ£o foi possÃ­vel enviar a imagem.')
    }
  }

  return (
    <section className="page">
      <div>
        <h1>Perfil</h1>
        <p className="page-subtitle">Seus dados e preferÃªncias.</p>
      </div>

      <div className="card" style={{ display: 'grid', gap: '1rem' }}>
        <h3>InformaÃ§Ãµes principais</h3>
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          <label>Foto do perfil</label>
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="PrÃ©via"
              style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null
              setAvatarFile(file)
              setAvatarError('')
              if (file) {
                const url = URL.createObjectURL(file)
                setAvatarPreview(url)
              } else {
                setAvatarPreview('')
              }
            }}
          />
          {avatarError && <p style={{ color: '#b12a5b', margin: 0 }}>{avatarError}</p>}
          {uploadProgress > 0 && (
            <div style={{ display: 'grid', gap: '0.3rem' }}>
              <div
                style={{
                  height: '8px',
                  borderRadius: '999px',
                  background: 'var(--stroke)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    background: 'var(--accent)',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                Enviando... {uploadProgress}%
              </span>
            </div>
          )}
          <button className="btn btn-profissional-perfil" type="button" onClick={uploadAvatar}>
            Atualizar avatar
          </button>
        </div>
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
        <textarea
          className="search"
          placeholder="Sobre a profissional"
          rows={4}
          value={form.about}
          onChange={(e) => setForm((prev) => ({ ...prev, about: e.target.value }))}
        />
        <button className="btn btn-profissional-perfil" type="button" onClick={saveProfile}>
          Salvar perfil
        </button>
      </div>

      <div className="card" style={{ display: 'grid', gap: '1rem' }}>
        <h3>Alterar senha</h3>
        <input
          className="search"
          placeholder="Senha atual"
          type="password"
          value={passwords.currentPassword}
          onChange={(e) => setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))}
        />
        <input
          className="search"
          placeholder="Nova senha"
          type="password"
          value={passwords.newPassword}
          onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
        />
        <button className="btn btn-profissional-perfil" type="button" onClick={changePassword}>
          Atualizar senha
        </button>
      </div>

      {message && <p style={{ color: '#5f9a8f' }}>{message}</p>}
      {user && <p style={{ color: 'var(--muted)' }}>Email: {user.email}</p>}
    </section>
  )
}

export default ProfessionalPerfil





