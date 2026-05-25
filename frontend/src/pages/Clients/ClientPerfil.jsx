import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchFormData, fetchJson, getServiceUrl } from '../../services/api'
import '../../styles/pages/Clients/ClientPerfil.css'

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function statusLabel(s) {
  if (s === 'completed') return 'Concluído'
  if (s === 'cancelled') return 'Cancelado'
  return 'Agendado'
}

function statusClass(s) {
  if (s === 'completed') return 'cperfil-status-badge--completed'
  if (s === 'cancelled') return 'cperfil-status-badge--cancelled'
  return 'cperfil-status-badge--scheduled'
}

function formatTime(dateStr) {
  const d = new Date(dateStr)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export default function ClientPerfil() {
  const [user, setUser]           = useState(null)
  const [appointments, setAppts]  = useState([])
  const [tab, setTab]             = useState('overview')
  const [statusFilter, setFilter] = useState('all')
  const [form, setForm]           = useState({ name: '', phone: '' })
  const [passwords, setPwd]       = useState({ currentPassword: '', newPassword: '' })
  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarFile, setAvatarFile]       = useState(null)
  const [saving, setSaving]       = useState(false)
  const [feedback, setFeedback]   = useState(null)
  const [reviewCount, setReviewCount] = useState(0)
  const avatarInputRef            = useRef(null)

  useEffect(() => {
    const load = async () => {
      const [meRes, apptRes] = await Promise.all([
        fetchJson('/auth/me').catch(() => null),
        fetchJson('/auth/me').then(r => {
          const id = r?.user?._id || r?.user?.id
          return id ? fetchJson(`/appointments/client/${id}`).catch(() => null) : null
        }).catch(() => null),
      ])
      const u = meRes?.user || null
      setUser(u)
      setForm({ name: u?.name || '', phone: u?.phone || '' })
      if (u?.avatar) setAvatarPreview(getServiceUrl(u.avatar))
      setAppts(apptRes?.appointments || [])
      const reviewsRes = await fetchJson('/reviews/mine').catch(() => null)
      setReviewCount(reviewsRes?.reviewedAppointmentIds?.length || 0)
    }
    load()
  }, [])

  const showFeedback = (msg, type = 'ok') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await fetchJson('/auth/me', { method: 'PATCH', body: JSON.stringify(form) })
      if (avatarFile) {
        const body = new FormData()
        body.append('image', avatarFile)
        await fetchFormData('/auth/me/avatar', { method: 'PATCH', body })
        setAvatarFile(null)
      }
      showFeedback('Perfil atualizado com sucesso!')
    } catch { showFeedback('Erro ao atualizar perfil.', 'err') }
    finally { setSaving(false) }
  }

  const handleSavePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      showFeedback('Preencha os dois campos de senha.', 'err')
      return
    }
    setSaving(true)
    try {
      await fetchJson('/auth/me/password', { method: 'PATCH', body: JSON.stringify(passwords) })
      setPwd({ currentPassword: '', newPassword: '' })
      showFeedback('Senha atualizada com sucesso!')
    } catch { showFeedback('Senha atual incorreta.', 'err') }
    finally { setSaving(false) }
  }

  const sorted = useMemo(() =>
    [...appointments].sort((a,b) => new Date(b.startTime) - new Date(a.startTime))
  , [appointments])

  const filtered = useMemo(() =>
    statusFilter === 'all' ? sorted : sorted.filter(a => a.status === statusFilter)
  , [sorted, statusFilter])

  const nextAppt = useMemo(() =>
    sorted.find(a => a.status === 'scheduled' && new Date(a.startTime) >= new Date())
  , [sorted])

  const stats = useMemo(() => ({
    total:     appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    upcoming:  appointments.filter(a => a.status === 'scheduled' && new Date(a.startTime) >= new Date()).length,
  }), [appointments])

  const firstName = (user?.name || user?.email || 'U').split(' ')[0]
  const initial   = firstName[0].toUpperCase()

  return (
    <div className="cperfil-page">

      {/* HERO */}
      <div className="cperfil-hero">
        <div className="cperfil-hero-top">
          <div className="cperfil-avatar-wrap" onClick={() => avatarInputRef.current?.click()} title="Alterar foto">
            {avatarPreview
              ? <img src={avatarPreview} alt="Avatar" className="cperfil-avatar" />
              : <div className="cperfil-avatar-fallback">{initial}</div>
            }
            <div className="cperfil-avatar-overlay">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="cperfil-avatar-input"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)) }
              }}
            />
          </div>

          <div className="cperfil-hero-info">
            <h1 className="cperfil-hero-name">{user?.name || 'Utilizador'}</h1>
            <p className="cperfil-hero-email">{user?.email}</p>
            <span className="cperfil-hero-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Cliente verificada
            </span>
            {(user?.rewardPoints > 0 || reviewCount > 0) && (
              <span className="cperfil-points-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
                {user?.rewardPoints || reviewCount * 10} pontos de fidelidade
              </span>
            )}
          </div>
        </div>

        <div className="cperfil-hero-stats">
          <div className="cperfil-stat">
            <span className="cperfil-stat-value">{stats.total}</span>
            <span className="cperfil-stat-label">Total</span>
          </div>
          <div className="cperfil-stat-divider" />
          <div className="cperfil-stat">
            <span className="cperfil-stat-value">{stats.upcoming}</span>
            <span className="cperfil-stat-label">Próximos</span>
          </div>
          <div className="cperfil-stat-divider" />
          <div className="cperfil-stat">
            <span className="cperfil-stat-value">{stats.completed}</span>
            <span className="cperfil-stat-label">Concluídos</span>
          </div>
          <div className="cperfil-stat-divider" />
          <div className="cperfil-stat">
            <span className="cperfil-stat-value">{reviewCount}</span>
            <span className="cperfil-stat-label">Avaliações</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="cperfil-tabs">
        <button className={`cperfil-tab ${tab === 'overview' ? 'is-active' : ''}`} onClick={() => setTab('overview')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Visão geral
        </button>
        <button className={`cperfil-tab ${tab === 'appointments' ? 'is-active' : ''}`} onClick={() => setTab('appointments')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Agendamentos
        </button>
        <button className={`cperfil-tab ${tab === 'edit' ? 'is-active' : ''}`} onClick={() => setTab('edit')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Editar dados
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="cperfil-content">

        {/* TAB: VISÃO GERAL */}
        {tab === 'overview' && (
          <>
            {/* Próximo agendamento */}
            {nextAppt ? (
              <div className="cperfil-next-card">
                <div className="cperfil-next-header">
                  <div className="cperfil-next-dot" />
                  <span>Próximo agendamento</span>
                </div>
                <div className="cperfil-next-body">
                  <div>
                    <p className="cperfil-next-service">{nextAppt.service?.name || 'Serviço'}</p>
                    <div className="cperfil-next-meta">
                      <span className="cperfil-next-chip">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                        </svg>
                        {nextAppt.professional?.name || 'Profissional'}
                      </span>
                      <span className="cperfil-next-chip">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {formatTime(nextAppt.startTime)}
                      </span>
                    </div>
                  </div>
                  <div className="cperfil-next-date">
                    <span className="cperfil-next-date-day">{new Date(nextAppt.startTime).getDate()}</span>
                    <span className="cperfil-next-date-rest">
                      {MONTHS[new Date(nextAppt.startTime).getMonth()]} · {new Date(nextAppt.startTime).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="cperfil-next-card">
                <div className="cperfil-next-header">
                  <div className="cperfil-next-dot" style={{ background: '#8d7b83', boxShadow: 'none' }} />
                  <span>Nenhum agendamento futuro</span>
                </div>
                <div className="cperfil-next-body">
                  <p style={{ color: 'var(--client-muted)', fontSize: '0.9rem', margin: 0 }}>
                    Explore os nossos serviços e agende o seu próximo horário.
                  </p>
                </div>
              </div>
            )}

            {/* Últimos 3 agendamentos */}
            {sorted.slice(0, 3).length > 0 && (
              <>
                <h3 className="cperfil-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Histórico recente
                </h3>
                <div className="cperfil-appt-list">
                  {sorted.slice(0, 3).map(a => <ApptCard key={a._id} appt={a} />)}
                </div>
              </>
            )}
          </>
        )}

        {/* TAB: AGENDAMENTOS */}
        {tab === 'appointments' && (
          <>
            <div className="cperfil-appt-filters">
              {['all','scheduled','completed','cancelled'].map(s => (
                <button
                  key={s}
                  className={`cperfil-filter-btn ${statusFilter === s ? 'is-active' : ''}`}
                  onClick={() => setFilter(s)}
                >
                  {s === 'all' ? 'Todos' : s === 'scheduled' ? 'Agendados' : s === 'completed' ? 'Concluídos' : 'Cancelados'}
                </button>
              ))}
            </div>

            {filtered.length > 0 ? (
              <div className="cperfil-appt-list">
                {filtered.map(a => <ApptCard key={a._id} appt={a} />)}
              </div>
            ) : (
              <div className="cperfil-appt-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <p>Nenhum agendamento encontrado.</p>
              </div>
            )}
          </>
        )}

        {/* TAB: EDITAR DADOS */}
        {tab === 'edit' && (
          <>
            <div className="cperfil-card">
              <h3 className="cperfil-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                Dados pessoais
              </h3>
              <div className="cperfil-form-grid">
                <div className="cperfil-field">
                  <label>Nome completo</label>
                  <div className="cperfil-input-wrap">
                    <svg className="cperfil-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>
                <div className="cperfil-field">
                  <label>Telefone</label>
                  <div className="cperfil-input-wrap">
                    <svg className="cperfil-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="912 345 678"
                    />
                  </div>
                </div>
                <div className="cperfil-field cperfil-field--full">
                  <label>Email (não editável)</label>
                  <div className="cperfil-input-wrap">
                    <svg className="cperfil-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 7 10-7"/>
                    </svg>
                    <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                  </div>
                </div>
              </div>
              <button className="cperfil-save-btn" onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'A guardar...' : 'Guardar alterações'}
              </button>
            </div>

            <div className="cperfil-card">
              <h3 className="cperfil-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                Alterar senha
              </h3>
              <div className="cperfil-form-grid">
                <div className="cperfil-field">
                  <label>Senha atual</label>
                  <div className="cperfil-input-wrap">
                    <svg className="cperfil-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    <input
                      type="password"
                      value={passwords.currentPassword}
                      onChange={e => setPwd(p => ({ ...p, currentPassword: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="cperfil-field">
                  <label>Nova senha</label>
                  <div className="cperfil-input-wrap">
                    <svg className="cperfil-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12l2 2 4-4"/><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    <input
                      type="password"
                      value={passwords.newPassword}
                      onChange={e => setPwd(p => ({ ...p, newPassword: e.target.value }))}
                      placeholder="Nova senha segura"
                    />
                  </div>
                </div>
              </div>
              <button className="cperfil-save-btn" onClick={handleSavePassword} disabled={saving}>
                {saving ? 'A atualizar...' : 'Atualizar senha'}
              </button>
            </div>

            {feedback && (
              <div className={`cperfil-feedback cperfil-feedback--${feedback.type}`}>
                {feedback.type === 'ok'
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                }
                {feedback.msg}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

function ApptCard({ appt }) {
  const d = new Date(appt.startTime)
  return (
    <div className="cperfil-appt-card">
      <div className="cperfil-appt-date-block">
        <span className="cperfil-appt-day">{d.getDate()}</span>
        <span className="cperfil-appt-month">{MONTHS[d.getMonth()]}</span>
      </div>
      <div className="cperfil-appt-info">
        <p className="cperfil-appt-service">{appt.service?.name || 'Serviço'}</p>
        <span className="cperfil-appt-sub">com {appt.professional?.name || 'Profissional'}</span>
      </div>
      <div className="cperfil-appt-right">
        <span className="cperfil-appt-time">{formatTime(appt.startTime)}</span>
        <span className={`cperfil-status-badge ${statusClass(appt.status)}`}>
          {statusLabel(appt.status)}
        </span>
      </div>
    </div>
  )
}
