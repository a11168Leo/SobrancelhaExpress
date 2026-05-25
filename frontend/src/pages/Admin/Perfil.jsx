import { useEffect, useMemo, useRef, useState } from 'react'
import '../../styles/pages/Profissional/Perfil.css'
import { fetchFormData, fetchJson, getServiceUrl } from '../../services/api'

// ── Constantes ────────────────────────────────────────────────
const UNITS = [
  {
    id: 'cascais',
    label: 'Cascais',
    address: 'R. do Mercado 51 loja 2, 2785-630 São Domingos de Rana',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'almada',
    label: 'Almada',
    address: 'Avenida da Fundação 08 Loja 7, 2805-180 Almada',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
]

const DAYS_TEMPLATE = [
  { day: 'segunda', label: 'Segunda', enabled: true,  start: '09:00', end: '18:00' },
  { day: 'terca',   label: 'Terça',   enabled: true,  start: '09:00', end: '18:00' },
  { day: 'quarta',  label: 'Quarta',  enabled: true,  start: '09:00', end: '18:00' },
  { day: 'quinta',  label: 'Quinta',  enabled: true,  start: '09:00', end: '18:00' },
  { day: 'sexta',   label: 'Sexta',   enabled: true,  start: '09:00', end: '18:00' },
  { day: 'sabado',  label: 'Sábado',  enabled: true,  start: '09:00', end: '13:00' },
  { day: 'domingo', label: 'Domingo', enabled: false, start: '',      end: ''      },
]

// ── Helpers ───────────────────────────────────────────────────
function resolveAvatarUrl(value) {
  if (typeof value !== 'string') return ''
  const t = value.trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t) || t.startsWith('data:')) return t
  return getServiceUrl(t.startsWith('/') ? t : `/${t}`)
}

function splitName(name = '') {
  const [nome = '', ...rest] = name.trim().split(/\s+/).filter(Boolean)
  return { nome, sobrenome: rest.join(' ') }
}

function parseAbout(about = '') {
  const [firstLine = '', ...rest] = String(about).split('\n')
  const match = firstLine.match(/Inicio:\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|N\/A)\s*(.*)$/i)
  if (!match) return { dataInicio: '', ano: '', sobreLivre: String(about).trim() }
  return {
    dataInicio: match[1] === 'N/A' ? '' : match[1],
    ano: (match[2] || '').trim(),
    sobreLivre: rest.join('\n').trim(),
  }
}

function buildUnitAvail(entries, unitId) {
  const map = new Map(
    entries.filter(e => e.unit === unitId || (!e.unit && unitId === 'cascais'))
      .map(e => [e.day, e])
  )
  return DAYS_TEMPLATE.map(d => {
    const saved = map.get(d.day)
    return { ...d, enabled: saved?.enabled ?? d.enabled, start: saved?.start ?? d.start, end: saved?.end ?? d.end }
  })
}

function formFromProfessional(p) {
  const { nome, sobrenome } = splitName(p?.name)
  const { dataInicio, ano, sobreLivre } = parseAbout(p?.about || '')
  const rawAvail = Array.isArray(p?.availability) ? p.availability : []

  return {
    nome, sobrenome,
    email: p?.email === 'nao informado' ? '' : p?.email || '',
    telefone: p?.phone === 'nao informado' ? '' : p?.phone || '',
    contactoPrincipal: p?.contactName || '',
    instagram: p?.instagram || '',
    dataInicio, ano, sobreLivre,
    servicos: Array.isArray(p?.specialties) ? p.specialties : [],
    locais: String(p?.unit || '').split(',').map(s => s.trim()).filter(Boolean),
    disponibilidadeCascais: buildUnitAvail(rawAvail, 'cascais'),
    disponibilidadeAlmada:  buildUnitAvail(rawAvail, 'almada'),
    ferias: Array.isArray(p?.vacationPeriods) ? p.vacationPeriods.map(v => ({
      startDate: v.startDate ? new Date(v.startDate).toISOString().slice(0,10) : '',
      endDate:   v.endDate   ? new Date(v.endDate).toISOString().slice(0,10)   : '',
      label: v.label || '',
    })) : [],
  }
}

function payloadFromForm(f) {
  const workInfo = `Inicio: ${f.dataInicio || 'N/A'} ${f.ano || ''}`.trim()
  return {
    name: `${f.nome} ${f.sobrenome}`.trim(),
    email: f.email.trim(),
    phone: f.telefone.trim(),
    contactName: f.contactoPrincipal.trim(),
    instagram: f.instagram.trim(),
    salonName: f.locais.join(', '),
    specialties: f.servicos,
    about: f.sobreLivre.trim() ? `${workInfo}\n${f.sobreLivre.trim()}` : workInfo,
    availability: [
      ...f.disponibilidadeCascais.map(({ day, enabled, start, end }) => ({ day, enabled, start, end, unit: 'cascais' })),
      ...f.disponibilidadeAlmada.map( ({ day, enabled, start, end }) => ({ day, enabled, start, end, unit: 'almada'  })),
    ],
    vacationPeriods: f.ferias.filter(v => v.startDate && v.endDate),
  }
}

// ── Custom picker dropdown ────────────────────────────────────
function ProfPicker({ professionals, selectedId, onSelect }) {
  const [open, setOpen] = useState(false)
  const selected = professionals.find(p => String(p.id) === String(selectedId))
  const initials = selected ? selected.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '?'

  return (
    <div className="prf-picker-wrap" style={{ position: 'relative' }}>
      <span className="prf-picker-label">Profissional</span>
      <button type="button" className="prf-picker-btn" onClick={() => setOpen(o => !o)}>
        <span className="prf-picker-avatar">{initials}</span>
        <span className="prf-picker-name">{selected?.name ?? '—'}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <>
          <div className="prf-picker-backdrop" onClick={() => setOpen(false)} />
          <ul className="prf-picker-menu">
            {professionals.map(p => {
              const ini = p.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
              return (
                <li key={p.id}>
                  <button type="button" className={`prf-picker-item${String(p.id) === String(selectedId) ? ' prf-picker-item--active' : ''}`}
                    onClick={() => { onSelect(p); setOpen(false) }}>
                    <span className="prf-picker-avatar prf-picker-avatar--sm">{ini}</span>
                    <span>{p.name}</span>
                    {String(p.id) === String(selectedId) && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 'auto' }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────
export default function Perfil({ user }) {
  const isProfessional = user?.role === 'profissional'
  const fileInputRef = useRef(null)
  const [professionals, setProfessionals]               = useState([])
  const [catalogServices, setCatalogServices]           = useState([])
  const [catalogCategories, setCatalogCategories]       = useState([])
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('')
  const [profileForm, setProfileForm] = useState({
    nome: '', sobrenome: '', email: '', telefone: '', contactoPrincipal: '',
    instagram: '', dataInicio: '', ano: '', sobreLivre: '', servicos: [], locais: [],
    disponibilidadeCascais: DAYS_TEMPLATE,
    disponibilidadeAlmada:  DAYS_TEMPLATE,
    ferias: [],
  })
  const [tab,           setTab]           = useState('dados')
  const [searchTerm,    setSearchTerm]    = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading,       setLoading]       = useState(true)
  const [saving,        setSaving]        = useState(false)
  const [uploading,     setUploading]     = useState(false)
  const [error,         setError]         = useState(null)
  const [feedback,      setFeedback]      = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [profsRes, svcsRes, catsRes] = await Promise.all([
          fetchJson('/auth/professionals'),
          fetchJson('/services'),
          fetchJson('/categories'),
        ])
        const profs = (Array.isArray(profsRes) ? profsRes : profsRes?.users || []).map((u, i) => ({
          id: u._id ?? u.id ?? String(i),
          name: u.name ?? 'Sem nome',
          role: u.role ?? 'profissional',
          email: u.email ?? '',
          phone: u.phone ?? '',
          contactName: u.contactName ?? '',
          instagram: u.instagram ?? '',
          about: u.about ?? '',
          unit: u.salonName ?? u.unit ?? '',
          avatar: resolveAvatarUrl(u.avatar ?? u.avatarUrl ?? ''),
          specialties: Array.isArray(u.specialties) ? u.specialties : [],
          availability: Array.isArray(u.availability) ? u.availability : [],
          vacationPeriods: Array.isArray(u.vacationPeriods) ? u.vacationPeriods : [],
        }))
        setProfessionals(profs)
        setCatalogServices(Array.isArray(svcsRes) ? svcsRes : svcsRes?.services || [])
        setCatalogCategories(Array.isArray(catsRes) ? catsRes : catsRes?.categories || [])

        // Profissional vê apenas o seu próprio perfil; admin vê o primeiro da lista
        const initial = isProfessional
          ? profs.find(p => p.email === user?.email) ?? profs[0]
          : profs[0]
        if (initial) {
          setSelectedProfessionalId(String(initial.id))
          setProfileForm(formFromProfessional(initial))
          setAvatarPreview(initial.avatar)
        }
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const selectedProf = useMemo(
    () => professionals.find(p => String(p.id) === String(selectedProfessionalId)) || null,
    [professionals, selectedProfessionalId]
  )

  const groupedServices = useMemo(() => {
    const catMap = new Map(catalogCategories.map(c => [String(c._id ?? c.id), c]))
    const groups = {}
    catalogServices.forEach(s => {
      const name = s.name ?? 'Sem nome'
      const catId = String(s.category ?? s.categoryId ?? '')
      const catName = catMap.get(catId)?.name ?? 'Sem categoria'
      if (!groups[catName]) groups[catName] = []
      if (!groups[catName].includes(name)) groups[catName].push(name)
    })
    return Object.fromEntries(Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'pt-PT', { sensitivity: 'base' })))
  }, [catalogCategories, catalogServices])

  const filteredGroups = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return groupedServices
    return Object.fromEntries(
      Object.entries(groupedServices)
        .map(([cat, svcs]) => [cat, svcs.filter(s => s.toLowerCase().includes(q) || cat.toLowerCase().includes(q))])
        .filter(([, svcs]) => svcs.length > 0)
    )
  }, [groupedServices, searchTerm])

  const activeCategories = useMemo(
    () => Object.entries(groupedServices)
      .filter(([, svcs]) => svcs.some(s => profileForm.servicos.includes(s)))
      .map(([cat]) => cat),
    [groupedServices, profileForm.servicos]
  )

  // Handlers
  const syncProf = (p) => {
    setSelectedProfessionalId(String(p.id))
    setProfileForm(formFromProfessional(p))
    setAvatarPreview(p.avatar)
    setFeedback(null); setError(null); setSearchTerm('')
  }

  const updateField = e => {
    const { name, value } = e.target
    setProfileForm(f => ({ ...f, [name]: value }))
  }

  const toggleServico = s => setProfileForm(f => ({
    ...f,
    servicos: f.servicos.includes(s) ? f.servicos.filter(x => x !== s) : [...f.servicos, s],
  }))

  const removeCategory = cat => {
    const toRemove = groupedServices[cat] || []
    setProfileForm(f => ({ ...f, servicos: f.servicos.filter(s => !toRemove.includes(s)) }))
  }

  const toggleLocal = loc => setProfileForm(f => ({
    ...f,
    locais: f.locais.includes(loc) ? f.locais.filter(x => x !== loc) : [...f.locais, loc],
  }))

  const updateUnitAvail = (unitId, day, field, value) => {
    const key = unitId === 'cascais' ? 'disponibilidadeCascais' : 'disponibilidadeAlmada'
    setProfileForm(f => ({
      ...f,
      [key]: f[key].map(d => d.day === day ? { ...d, [field]: value } : d),
    }))
  }

  const saveProfile = async () => {
    if (!selectedProf) return
    if (!profileForm.nome.trim() || !profileForm.email.trim()) {
      setError('Nome e e-mail são obrigatórios.'); setFeedback(null); return
    }
    setSaving(true); setError(null); setFeedback(null)
    try {
      const res = await fetchJson(`/auth/professionals/${selectedProf.id}`, {
        method: 'PATCH', body: JSON.stringify(payloadFromForm(profileForm)),
      })
      const u = res?.user ?? res
      const updated = {
        ...selectedProf,
        name: u.name ?? profileForm.nome,
        email: u.email ?? profileForm.email,
        phone: u.phone ?? profileForm.telefone,
        contactName: u.contactName,
        about: u.about,
        unit: u.salonName ?? u.unit,
        specialties: Array.isArray(u.specialties) ? u.specialties : profileForm.servicos,
        availability: Array.isArray(u.availability) ? u.availability : [],
        avatar: resolveAvatarUrl(u.avatar ?? selectedProf.avatar),
      }
      setProfessionals(ps => ps.map(p => String(p.id) === String(updated.id) ? updated : p))
      setProfileForm(formFromProfessional(updated))
      setAvatarPreview(updated.avatar)
      setFeedback('Perfil atualizado com sucesso!')
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleAvatarInput = async e => {
    const file = e.target.files?.[0]
    if (!file || !selectedProf) return
    const preview = URL.createObjectURL(file)
    setAvatarPreview(preview)
    setUploading(true); setError(null); setFeedback(null)
    try {
      const body = new FormData()
      body.append('image', file)
      const res = await fetchFormData(`/auth/professionals/${selectedProf.id}/avatar`, { method: 'PATCH', body })
      const u = res?.user ?? res
      const nextAvatar = resolveAvatarUrl(u.avatar)
      setProfessionals(ps => ps.map(p => String(p.id) === String(selectedProf.id) ? { ...p, avatar: nextAvatar } : p))
      setAvatarPreview(nextAvatar || preview)
      setFeedback('Foto atualizada com sucesso!')
    } catch (err) {
      setAvatarPreview(selectedProf.avatar || '')
      setError(err.message)
    } finally {
      URL.revokeObjectURL(preview)
      e.target.value = ''
      setUploading(false)
    }
  }

  // ── Loading / empty states ───────────────────────────────────
  if (loading) return (
    <div className="prf-loading">
      <div className="prf-spinner" />
      <p>A carregar perfil...</p>
    </div>
  )

  if (!selectedProf) return (
    <section className="prf-page">
      <div className="prf-empty">
        <p>Nenhuma profissional encontrada.</p>
      </div>
    </section>
  )

  const initials = (`${profileForm.nome[0] ?? ''}${profileForm.sobrenome[0] ?? ''}`).toUpperCase() || selectedProf.name[0]?.toUpperCase()
  const unitCount = profileForm.locais.length

  // ── Render principal ─────────────────────────────────────────
  return (
    <section className="prf-page">

      {/* ─── Hero ─────────────────────────────────────────── */}
      <div className="prf-hero">
        <div className="prf-hero-bg" />

        <div className="prf-hero-inner">
          {/* Avatar */}
          <div className="prf-avatar-wrap" onClick={() => fileInputRef.current?.click()}>
            {avatarPreview
              ? <img src={avatarPreview} alt={selectedProf.name} className="prf-avatar-img" />
              : <span className="prf-avatar-fallback">{initials}</span>}
            <div className="prf-avatar-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            {uploading && <div className="prf-avatar-uploading" />}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="prf-avatar-input" onChange={handleAvatarInput} />
          </div>

          {/* Info */}
          <div className="prf-hero-info">
            <h1 className="prf-hero-name">{selectedProf.name}</h1>
            <p className="prf-hero-sub">Profissional · {unitCount === 0 ? 'Sem unidade' : unitCount === 1 ? profileForm.locais[0] : `${unitCount} unidades`}</p>
            <div className="prf-hero-stats">
              <div className="prf-stat">
                <strong>{profileForm.servicos.length}</strong>
                <span>Serviços</span>
              </div>
              <div className="prf-stat">
                <strong>{activeCategories.length}</strong>
                <span>Categorias</span>
              </div>
              <div className="prf-stat">
                <strong>{unitCount}</strong>
                <span>Unidades</span>
              </div>
            </div>
          </div>

          {/* Profissional picker — apenas admin com múltiplas profissionais */}
          {!isProfessional && professionals.length > 1 && (
            <ProfPicker
              professionals={professionals}
              selectedId={selectedProfessionalId}
              onSelect={syncProf}
            />
          )}
        </div>
      </div>

      {/* ─── Feedback ─────────────────────────────────────── */}
      {(feedback || error) && (
        <div className={`prf-feedback ${error ? 'prf-feedback--error' : 'prf-feedback--success'}`}>
          {error
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          }
          {error || feedback}
        </div>
      )}

      {/* ─── Tabs ─────────────────────────────────────────── */}
      <div className="prf-tabs">
        {[
          { id: 'dados',    label: 'Dados pessoais' },
          { id: 'unidades', label: 'Unidades & Disponibilidade' },
          { id: 'servicos', label: 'Serviços' },
        ].map(t => (
          <button
            key={t.id}
            className={`prf-tab${tab === t.id ? ' prf-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Tab: Dados pessoais ──────────────────────────── */}
      {tab === 'dados' && (
        <div className="prf-tab-content">
          <div className="prf-card">
            <p className="prf-card-eyebrow">Identificação</p>
            <h2 className="prf-card-title">Informações pessoais</h2>
            <div className="prf-form-grid prf-form-grid--2">
              <label className="prf-field">
                <span>Nome</span>
                <input type="text" name="nome" value={profileForm.nome} onChange={updateField} placeholder="Nome" />
              </label>
              <label className="prf-field">
                <span>Sobrenome</span>
                <input type="text" name="sobrenome" value={profileForm.sobrenome} onChange={updateField} placeholder="Sobrenome" />
              </label>
              <label className="prf-field">
                <span>E-mail</span>
                <input type="email" name="email" value={profileForm.email} onChange={updateField} placeholder="email@exemplo.com" />
              </label>
              <label className="prf-field">
                <span>Telefone</span>
                <input type="tel" name="telefone" value={profileForm.telefone} onChange={updateField} placeholder="+351 900 000 000" />
              </label>
              <label className="prf-field">
                <span>Contacto principal</span>
                <input type="text" name="contactoPrincipal" value={profileForm.contactoPrincipal} onChange={updateField} placeholder="Nome de contacto" />
              </label>
              <label className="prf-field">
                <span>Ano de referência</span>
                <input type="number" min="2000" max="2035" name="ano" value={profileForm.ano} onChange={updateField} placeholder="2020" />
              </label>
              <label className="prf-field">
                <span>Data de início</span>
                <input type="date" name="dataInicio" value={profileForm.dataInicio} onChange={updateField} />
              </label>
              <label className="prf-field">
                <span>Instagram</span>
                <div className="prf-instagram-wrap">
                  <span className="prf-instagram-at">@</span>
                  <input
                    type="text"
                    name="instagram"
                    value={profileForm.instagram.replace(/^@/, '')}
                    onChange={e => setProfileForm(f => ({ ...f, instagram: e.target.value.replace(/^@/, '') }))}
                    placeholder="username"
                    className="prf-instagram-input"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="prf-card">
            <p className="prf-card-eyebrow">Apresentação</p>
            <h2 className="prf-card-title">Bio e posicionamento</h2>
            <label className="prf-field">
              <span>Sobre a profissional</span>
              <textarea
                name="sobreLivre"
                rows="7"
                value={profileForm.sobreLivre}
                onChange={updateField}
                placeholder="Descreva a experiência, estilo de atendimento e o que diferencia esta profissional..."
              />
            </label>
          </div>
        </div>
      )}

      {/* ─── Tab: Unidades & Disponibilidade ──────────────── */}
      {tab === 'unidades' && (
        <div className="prf-tab-content">
          <div className="prf-units-grid">
            {UNITS.map(unit => {
              const isActive = profileForm.locais.includes(unit.label)
              const availKey = unit.id === 'cascais' ? 'disponibilidadeCascais' : 'disponibilidadeAlmada'
              const avail = profileForm[availKey]

              return (
                <div key={unit.id} className={`prf-unit-card${isActive ? ' prf-unit-card--active' : ''}`}>
                  {/* Unit header */}
                  <div className="prf-unit-header">
                    <div className="prf-unit-icon">{unit.icon}</div>
                    <div className="prf-unit-info">
                      <h3 className="prf-unit-name">Unidade de {unit.label}</h3>
                      <p className="prf-unit-address">{unit.address}</p>
                    </div>
                    {/* Toggle */}
                    <button
                      type="button"
                      className={`prf-unit-toggle${isActive ? ' prf-unit-toggle--on' : ''}`}
                      onClick={() => toggleLocal(unit.label)}
                      aria-label={isActive ? `Desativar ${unit.label}` : `Ativar ${unit.label}`}
                    >
                      <span className="prf-unit-toggle-knob" />
                    </button>
                  </div>

                  {/* Status badge */}
                  <div className={`prf-unit-status ${isActive ? 'prf-unit-status--on' : 'prf-unit-status--off'}`}>
                    {isActive ? 'Ativa' : 'Inativa'}
                  </div>

                  {/* Schedule */}
                  {isActive && (
                    <div className="prf-unit-schedule">
                      <p className="prf-schedule-title">Agenda semanal</p>
                      <div className="prf-schedule-list">
                        {avail.map(day => (
                          <div key={day.day} className={`prf-schedule-row${day.enabled ? '' : ' prf-schedule-row--off'}`}>
                            <label className="prf-schedule-day">
                              <input
                                type="checkbox"
                                checked={day.enabled}
                                onChange={e => updateUnitAvail(unit.id, day.day, 'enabled', e.target.checked)}
                              />
                              <span>{day.label}</span>
                            </label>
                            <div className="prf-schedule-times">
                              <label className="prf-time-field">
                                <span>Início</span>
                                <input
                                  type="time"
                                  value={day.start}
                                  disabled={!day.enabled}
                                  onChange={e => updateUnitAvail(unit.id, day.day, 'start', e.target.value)}
                                />
                              </label>
                              <span className="prf-time-sep">—</span>
                              <label className="prf-time-field">
                                <span>Fim</span>
                                <input
                                  type="time"
                                  value={day.end}
                                  disabled={!day.enabled}
                                  onChange={e => updateUnitAvail(unit.id, day.day, 'end', e.target.value)}
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isActive && (
                    <p className="prf-unit-inactive-msg">
                      Ative esta unidade para configurar a disponibilidade semanal.
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* ─── Plano de férias ──────────────────────────── */}
          <div className="prf-card">
            <p className="prf-card-eyebrow">Ausências</p>
            <h2 className="prf-card-title">Plano de férias</h2>
            <p className="prf-card-hint">Defina períodos em que a profissional não irá atender. Os horários bloqueados não aparecem na agenda de agendamentos.</p>

            <div className="prf-vacation-list">
              {profileForm.ferias.length === 0 && (
                <p className="prf-empty-msg">Sem períodos de ausência definidos.</p>
              )}
              {profileForm.ferias.map((v, i) => (
                <div key={i} className="prf-vacation-row">
                  <label className="prf-field">
                    <span>Início</span>
                    <input type="date" value={v.startDate}
                      onChange={e => setProfileForm(f => ({ ...f, ferias: f.ferias.map((x, j) => j === i ? { ...x, startDate: e.target.value } : x) }))} />
                  </label>
                  <label className="prf-field">
                    <span>Fim</span>
                    <input type="date" value={v.endDate}
                      onChange={e => setProfileForm(f => ({ ...f, ferias: f.ferias.map((x, j) => j === i ? { ...x, endDate: e.target.value } : x) }))} />
                  </label>
                  <label className="prf-field">
                    <span>Descrição</span>
                    <input type="text" value={v.label} placeholder="Ex: Férias de verão"
                      onChange={e => setProfileForm(f => ({ ...f, ferias: f.ferias.map((x, j) => j === i ? { ...x, label: e.target.value } : x) }))} />
                  </label>
                  <button type="button" className="prf-vacation-remove"
                    onClick={() => setProfileForm(f => ({ ...f, ferias: f.ferias.filter((_, j) => j !== i) }))}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="prf-vacation-add"
              onClick={() => setProfileForm(f => ({ ...f, ferias: [...f.ferias, { startDate: '', endDate: '', label: '' }] }))}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Adicionar período
            </button>
          </div>
        </div>
      )}

      {/* ─── Tab: Serviços ────────────────────────────────── */}
      {tab === 'servicos' && (
        <div className="prf-tab-content">
          {/* Active categories chips */}
          {activeCategories.length > 0 && (
            <div className="prf-card prf-card--compact">
              <p className="prf-card-eyebrow">Categorias ativas</p>
              <div className="prf-cat-chips">
                {activeCategories.map(cat => (
                  <button key={cat} type="button" className="prf-cat-chip" onClick={() => removeCategory(cat)}>
                    {cat}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Service groups */}
          <div className="prf-card">
            <div className="prf-services-header">
              <div>
                <p className="prf-card-eyebrow">Catálogo</p>
                <h2 className="prf-card-title">Serviços disponíveis</h2>
              </div>
              <label className="prf-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar serviço..."
                />
              </label>
            </div>

            <div className="prf-service-groups">
              {Object.keys(filteredGroups).length === 0 && (
                <p className="prf-empty-msg">Nenhum serviço encontrado.</p>
              )}
              {Object.entries(filteredGroups).map(([cat, svcs]) => (
                <div key={cat} className="prf-service-group">
                  <div className="prf-service-group-head">
                    <div>
                      <h4 className="prf-service-group-title">{cat}</h4>
                      <p className="prf-service-group-sub">{svcs.length} opções</p>
                    </div>
                    {activeCategories.includes(cat) && (
                      <button type="button" className="prf-remove-cat" onClick={() => removeCategory(cat)}>
                        Retirar categoria
                      </button>
                    )}
                  </div>
                  <div className="prf-service-options">
                    {svcs.map(svc => (
                      <label key={svc} className={`prf-service-option${profileForm.servicos.includes(svc) ? ' prf-service-option--on' : ''}`}>
                        <input type="checkbox" checked={profileForm.servicos.includes(svc)} onChange={() => toggleServico(svc)} />
                        <span>{svc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Save bar ─────────────────────────────────────── */}
      <div className="prf-save-bar">
        <button type="button" className="prf-save-btn" onClick={saveProfile} disabled={saving}>
          {saving
            ? <><div className="prf-btn-spinner" /> A guardar...</>
            : <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Guardar alterações
              </>
          }
        </button>
      </div>
    </section>
  )
}
