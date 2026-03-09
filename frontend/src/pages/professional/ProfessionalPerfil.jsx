import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api, { API_BASE_URL } from '../../api/api.js'

function ProfessionalPerfil() {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', about: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [message, setMessage] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const meRes = await api.get('/auth/me')
        const profile = meRes.data.user || {}
        const professionalId = profile.id || profile._id

        const appointmentsRes = professionalId
          ? await api.get(`/appointments/professional/${professionalId}`).catch(() => ({ data: { appointments: [] } }))
          : { data: { appointments: [] } }

        if (!mounted) return

        setUser(profile)
        setAppointments(appointmentsRes.data.appointments || [])
        setForm({
          name: profile.name || '',
          phone: profile.phone || '',
          about: profile.about || '',
        })

        if (profile.avatar) {
          const avatarUrl = profile.avatar.startsWith('http')
            ? profile.avatar
            : `${API_BASE_URL}${profile.avatar}`
          setAvatarPreview(avatarUrl)
        } else {
          setAvatarPreview('')
        }
      } catch {
        if (!mounted) return
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const upcomingCount = useMemo(() => {
    return appointments.filter((item) => dayjs(item.startTime).isAfter(dayjs()) && item.status !== 'cancelled').length
  }, [appointments])

  const completedCount = useMemo(() => {
    return appointments.filter((item) => item.status === 'completed').length
  }, [appointments])

  const rating = useMemo(() => {
    const base = 4.5
    const bonus = Math.min(0.5, completedCount / 120)
    return (base + bonus).toFixed(1)
  }, [completedCount])

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
      setAvatarError('A imagem deve ter no maximo 2MB.')
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
      setAvatarError('Nao foi possivel enviar a imagem.')
    }
  }

  const summaryAvatar = avatarPreview
    ? (
      <img src={avatarPreview} alt="Foto da profissional" />
      )
    : (
      <span>{user?.name?.[0]?.toUpperCase() || 'P'}</span>
      )

  return (
    <section className="page">
      <div>
        <h1>Meu perfil</h1>
        <p className="page-subtitle">Dados visiveis no painel e resumo do seu atendimento.</p>
      </div>

      <div className="professional-profile-summary-card">
        <div className="professional-profile-summary-top">
          <div className="professional-profile-circle">{summaryAvatar}</div>
          <div>
            <h3>{user?.name || 'Profissional'}</h3>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--muted)' }}>
              {user?.contactName || user?.phone || 'Sem contato cadastrado'}
            </p>
          </div>
        </div>

        <div className="professional-profile-meta">
          <article>
            <span>Avaliacoes</span>
            <strong>{completedCount}</strong>
            <span>Nota media {rating}</span>
          </article>
          <article>
            <span>Salao que atende</span>
            <strong>{user?.salonName || 'Sobrancelhas Express'}</strong>
            <span>Informacao exibida para clientes</span>
          </article>
          <article>
            <span>Agenda futura</span>
            <strong>{upcomingCount}</strong>
            <span>Agendamentos pendentes</span>
          </article>
        </div>
      </div>

      <div className="card" style={{ display: 'grid', gap: '1rem' }}>
        <h3>Informacoes principais</h3>
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          <label>Foto do perfil</label>
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Previa"
              style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0] || null
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
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <input
          className="search"
          placeholder="Telefone"
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
        />
        <textarea
          className="search"
          placeholder="Sobre a profissional"
          rows={4}
          value={form.about}
          onChange={(event) => setForm((prev) => ({ ...prev, about: event.target.value }))}
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
          onChange={(event) => setPasswords((prev) => ({ ...prev, currentPassword: event.target.value }))}
        />
        <input
          className="search"
          placeholder="Nova senha"
          type="password"
          value={passwords.newPassword}
          onChange={(event) => setPasswords((prev) => ({ ...prev, newPassword: event.target.value }))}
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
