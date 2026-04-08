// ========================================
// COMPONENTE DE PERFIL PROFISSIONAL
// ========================================

// ========================================
// IMPORTACOES E CONSTANTES
// ========================================

import { useEffect, useMemo, useRef, useState } from 'react'
import '../styles/pages/Perfil.css'
import { fetchFormData, fetchJson, getServiceUrl } from '../services/api'

// Constantes: Opcoes de unidades disponiveis
const unitOptions = [
  {
    id: 'cascais',
    value: 'Cascais',
    label: 'Loja de Cascais',
    description: 'R. do Mercado 51 loja 2, 2785-630 Sao Domingos de Rana',
  },
  {
    id: 'almada',
    value: 'Almada',
    label: 'Loja de Almada',
    description: 'Avenida da Fundacao 08 Loja 7, 2805-180 Almada',
  },
]

// Constantes: Disponibilidade padrao semanal
const defaultAvailability = [
  { day: 'segunda', label: 'Segunda-feira', enabled: true, start: '09:00', end: '18:00' },
  { day: 'terca', label: 'Terca-feira', enabled: true, start: '09:00', end: '18:00' },
  { day: 'quarta', label: 'Quarta-feira', enabled: true, start: '09:00', end: '18:00' },
  { day: 'quinta', label: 'Quinta-feira', enabled: true, start: '09:00', end: '18:00' },
  { day: 'sexta', label: 'Sexta-feira', enabled: true, start: '09:00', end: '18:00' },
  { day: 'sabado', label: 'Sabado', enabled: true, start: '09:00', end: '13:00' },
  { day: 'domingo', label: 'Domingo', enabled: false, start: '', end: '' },
]

// ========================================
// FUNCOES AUXILIARES
// ========================================

// Funcao: Resolve URL do avatar
function resolveAvatarUrl(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed
  return getServiceUrl(trimmed.startsWith('/') ? trimmed : `/${trimmed}`)
}

// Funcao: Divide nome em nome e sobrenome
function splitName(name = '') {
  const [nome = '', ...rest] = name.trim().split(/\s+/).filter(Boolean)
  return { nome, sobrenome: rest.join(' ') }
}

// Funcao: Parse da informacao "about" do profissional
function parseAbout(about = '') {
  const [firstLine = '', ...rest] = String(about).split('\n')
  const match = firstLine.match(/Inicio:\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|N\/A)\s*(.*)$/i)
  if (!match) {
    return { dataInicio: '', ano: '', sobreLivre: String(about).trim() }
  }

  return {
    dataInicio: match[1] === 'N/A' ? '' : match[1],
    ano: (match[2] || '').trim(),
    sobreLivre: rest.join('\n').trim(),
  }
}

// ========================================
// FUNCOES DE CONVERSAO DE DADOS
// ========================================

// Funcao: Converte dados do profissional para formulario
function formFromProfessional(professional) {
  const { nome, sobrenome } = splitName(professional?.name)
  const { dataInicio, ano, sobreLivre } = parseAbout(professional?.about || '')
  const availabilityMap = new Map(
    Array.isArray(professional?.availability)
      ? professional.availability.map((item) => [String(item?.day || '').trim(), item])
      : []
  )

  return {
    nome,
    sobrenome,
    email: professional?.email === 'nao informado' ? '' : professional?.email || '',
    telefone: professional?.phone === 'nao informado' ? '' : professional?.phone || '',
    contactoPrincipal: professional?.contactName || '',
    dataInicio,
    ano,
    sobreLivre,
    servicos: Array.isArray(professional?.specialties) ? professional.specialties : [],
    locais: String(professional?.unit || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    disponibilidade: defaultAvailability.map((day) => {
      const saved = availabilityMap.get(day.day)
      return {
        ...day,
        enabled: saved?.enabled ?? day.enabled,
        start: saved?.start ?? day.start,
        end: saved?.end ?? day.end,
      }
    }),
  }
}

// Funcao: Converte dados do formulario para payload da API
function payloadFromForm(formData) {
  const workInfo = `Inicio: ${formData.dataInicio || 'N/A'} ${formData.ano || ''}`.trim()
  return {
    name: `${formData.nome} ${formData.sobrenome}`.trim(),
    email: formData.email.trim(),
    phone: formData.telefone.trim(),
    contactName: formData.contactoPrincipal.trim(),
    salonName: formData.locais.join(', '),
    specialties: formData.servicos,
    about: formData.sobreLivre.trim() ? `${workInfo}\n${formData.sobreLivre.trim()}` : workInfo,
    availability: formData.disponibilidade.map(({ day, enabled, start, end }) => ({ day, enabled, start, end })),
  }
}

// Funcao: Formata data de inicio para exibicao
function formatSince(dataInicio, ano) {
  if (!dataInicio && !ano) return 'Sem data definida'
  if (dataInicio && ano) return `${dataInicio} - ${ano}`
  return dataInicio || ano
}

// ========================================
// COMPONENTE PRINCIPAL: PERFIL
// ========================================

function Perfil() {
  // ========================================
  // ESTADO DO COMPONENTE
  // ========================================

  const fileInputRef = useRef(null)
  const [professionals, setProfessionals] = useState([])
  const [catalogServices, setCatalogServices] = useState([])
  const [catalogCategories, setCatalogCategories] = useState([])
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('')
  const [profileForm, setProfileForm] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    contactoPrincipal: '',
    dataInicio: '',
    ano: '',
    sobreLivre: '',
    servicos: [],
    locais: [],
    disponibilidade: defaultAvailability,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  // ========================================
  // EFEITOS E HOOKS
  // ========================================

  // Efeito: Carrega dados iniciais (profissionais, servicos, categorias)
  useEffect(() => {
    async function loadData() {
      try {
        const [professionalsData, servicesData, categoriesData] = await Promise.all([
          fetchJson('/auth/professionals'),
          fetchJson('/services'),
          fetchJson('/categories'),
        ])

        const users = Array.isArray(professionalsData) ? professionalsData : professionalsData?.users || []
        const services = Array.isArray(servicesData) ? servicesData : servicesData?.services || []
        const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories || []

        const normalizedProfessionals = users.map((user, index) => ({
          id: user._id ?? user.id ?? String(index),
          name: user.name ?? 'Sem nome',
          role: user.role ?? 'profissional',
          email: user.email ?? '',
          phone: user.phone ?? '',
          contactName: user.contactName ?? '',
          about: user.about ?? '',
          unit: user.salonName ?? user.unit ?? '',
          avatar: resolveAvatarUrl(user.avatar ?? user.avatarUrl ?? user.photo ?? user.photoUrl ?? ''),
          specialties: Array.isArray(user.specialties) ? user.specialties : [],
          availability: Array.isArray(user.availability) ? user.availability : [],
        }))

        setProfessionals(normalizedProfessionals)
        setCatalogServices(services)
        setCatalogCategories(categories)

        if (normalizedProfessionals[0]) {
          setSelectedProfessionalId(String(normalizedProfessionals[0].id))
          setProfileForm(formFromProfessional(normalizedProfessionals[0]))
          setAvatarPreview(normalizedProfessionals[0].avatar || '')
        }

        setError(null)
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const selectedProfessional = useMemo(
    () => professionals.find((professional) => String(professional.id) === String(selectedProfessionalId)) || null,
    [professionals, selectedProfessionalId]
  )

  const groupedCatalogServices = useMemo(() => {
    const categoryMap = new Map(catalogCategories.map((category) => [String(category._id ?? category.id), category]))
    const groups = {}

    catalogServices.forEach((service) => {
      const serviceName = service.name ?? service.nome ?? 'Sem nome'
      const categoryId = String(service.category ?? service.categoryId ?? '')
      const categoryName = categoryMap.get(categoryId)?.name ?? 'Sem categoria'

      if (!groups[categoryName]) groups[categoryName] = []
      if (!groups[categoryName].includes(serviceName)) groups[categoryName].push(serviceName)
    })

    return Object.fromEntries(Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'pt-PT', { sensitivity: 'base' })))
  }, [catalogCategories, catalogServices])

  const filteredServiceGroups = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) return groupedCatalogServices

    return Object.fromEntries(
      Object.entries(groupedCatalogServices)
        .map(([category, services]) => [
          category,
          services.filter(
            (service) =>
              service.toLowerCase().includes(normalizedSearch) ||
              category.toLowerCase().includes(normalizedSearch)
          ),
        ])
        .filter(([, services]) => services.length > 0)
    )
  }, [groupedCatalogServices, searchTerm])

  const selectedCategories = useMemo(
    () =>
      Object.entries(groupedCatalogServices)
        .filter(([, services]) => services.some((service) => profileForm.servicos.includes(service)))
        .map(([category]) => category),
    [groupedCatalogServices, profileForm.servicos]
  )

  // ========================================
  // FUNCOES DE MANIPULACAO DE EVENTOS
  // ========================================

  // Funcao: Sincroniza profissional selecionado
  const syncSelectedProfessional = (professional) => {
    setSelectedProfessionalId(String(professional.id))
    setProfileForm(formFromProfessional(professional))
    setAvatarPreview(professional.avatar || '')
    setFeedback(null)
    setError(null)
    setSearchTerm('')
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setProfileForm((current) => ({ ...current, [name]: value }))
  }

  const toggleServico = (servico) => {
    setProfileForm((current) => ({
      ...current,
      servicos: current.servicos.includes(servico)
        ? current.servicos.filter((item) => item !== servico)
        : [...current.servicos, servico],
    }))
  }

  const removeCategory = (categoryName) => {
    const servicesToRemove = groupedCatalogServices[categoryName] || []
    setProfileForm((current) => ({
      ...current,
      servicos: current.servicos.filter((service) => !servicesToRemove.includes(service)),
    }))
  }

  const toggleLocal = (local) => {
    setProfileForm((current) => ({
      ...current,
      locais: current.locais.includes(local)
        ? current.locais.filter((item) => item !== local)
        : [...current.locais, local],
    }))
  }

  const updateAvailability = (day, field, value) => {
    setProfileForm((current) => ({
      ...current,
      disponibilidade: current.disponibilidade.map((item) =>
        item.day === day ? { ...item, [field]: value } : item
      ),
    }))
  }

  // Funcao: Salva perfil no backend
  const saveProfile = async () => {
    if (!selectedProfessional) return

    if (!profileForm.nome.trim() || !profileForm.email.trim()) {
      setError('Nome e e-mail sao obrigatorios.')
      setFeedback(null)
      return
    }

    setSaving(true)
    setError(null)
    setFeedback(null)

    try {
      const payload = payloadFromForm(profileForm)
      const response = await fetchJson(`/auth/professionals/${selectedProfessional.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      const user = response?.user ?? response
      const updatedProfessional = {
        ...selectedProfessional,
        id: user._id ?? user.id ?? selectedProfessional.id,
        name: user.name ?? payload.name,
        role: user.role ?? selectedProfessional.role,
        email: user.email ?? payload.email,
        phone: user.phone ?? payload.phone,
        contactName: user.contactName ?? payload.contactName,
        about: user.about ?? payload.about,
        unit: user.salonName ?? payload.salonName,
        avatar: resolveAvatarUrl(user.avatar ?? selectedProfessional.avatar),
        specialties: Array.isArray(user.specialties) ? user.specialties : payload.specialties,
        availability: Array.isArray(user.availability) ? user.availability : payload.availability,
      }

      setProfessionals((current) =>
        current.map((professional) =>
          String(professional.id) === String(updatedProfessional.id) ? updatedProfessional : professional
        )
      )
      setProfileForm(formFromProfessional(updatedProfessional))
      setAvatarPreview(updatedProfessional.avatar || '')
      setFeedback('Perfil atualizado com sucesso.')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  // Funcao: Faz upload de foto do avatar
  const handleAvatarInput = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !selectedProfessional) return

    const localPreview = URL.createObjectURL(file)
    setAvatarPreview(localPreview)
    setUploadingAvatar(true)
    setError(null)
    setFeedback(null)

    try {
      const body = new FormData()
      body.append('image', file)

      const response = await fetchFormData(`/auth/professionals/${selectedProfessional.id}/avatar`, {
        method: 'PATCH',
        body,
      })

      const user = response?.user ?? response
      const nextAvatar = resolveAvatarUrl(user.avatar)
      const updatedProfessional = {
        ...selectedProfessional,
        name: user.name ?? selectedProfessional.name,
        email: user.email ?? selectedProfessional.email,
        phone: user.phone ?? selectedProfessional.phone,
        contactName: user.contactName ?? selectedProfessional.contactName,
        about: user.about ?? selectedProfessional.about,
        unit: user.salonName ?? selectedProfessional.unit,
        specialties: Array.isArray(user.specialties) ? user.specialties : selectedProfessional.specialties,
        availability: Array.isArray(user.availability) ? user.availability : selectedProfessional.availability,
        avatar: nextAvatar,
      }

      setProfessionals((current) =>
        current.map((professional) =>
          String(professional.id) === String(selectedProfessional.id)
            ? updatedProfessional
            : professional
        )
      )
      setAvatarPreview(nextAvatar || localPreview)
      setFeedback('Foto atualizada com sucesso.')
      setSelectedProfessionalId(String(updatedProfessional.id))
    } catch (uploadError) {
      setAvatarPreview(selectedProfessional.avatar || '')
      setError(uploadError.message)
    } finally {
      URL.revokeObjectURL(localPreview)
      event.target.value = ''
      setUploadingAvatar(false)
    }
  }

  // ========================================
  // RENDERIZACAO JSX
  // ========================================

  // Estado: Carregando dados
  if (loading) {
    return (
      <section className="profile-page" aria-label="Perfil">
        <p>Carregando perfil...</p>
      </section>
    )
  }

  // Estado: Erro sem profissional
  if (error && !selectedProfessional) {
    return (
      <section className="profile-page" aria-label="Perfil">
        <div className="profile-page-heading">
          <h1>Perfil</h1>
          <p>{error}</p>
        </div>
      </section>
    )
  }

  // Estado: Nenhum profissional encontrado
  if (!selectedProfessional) {
    return (
      <section className="profile-page" aria-label="Perfil">
        <div className="profile-page-heading">
          <h1>Perfil</h1>
          <p>Nenhuma profissional encontrada para editar.</p>
        </div>
      </section>
    )
  }

  // ========================================
  // JSX PRINCIPAL
  // ========================================

  const initials = `${profileForm.nome.charAt(0)}${profileForm.sobrenome.charAt(0)}`.trim() || selectedProfessional.name.charAt(0)

  return (
    <section className="profile-page" aria-label="Perfil">
      {/* ======================================== */}
      {/* CABECALHO DA PAGINA */}
      {/* ======================================== */}
      <div className="profile-page-heading">
        <div>
          <h1>Perfil profissional</h1>
          <p>Edite foto, dados principais, bio e as categorias em que esta profissional atende.</p>
        </div>

        {/* Seletor de profissional */}
        <div className="profile-picker">
          <label htmlFor="profile-professional-picker">Profissional</label>
          <select
            id="profile-professional-picker"
            value={selectedProfessionalId}
            onChange={(event) => {
              const nextProfessional = professionals.find(
                (professional) => String(professional.id) === event.target.value
              )
              if (nextProfessional) syncSelectedProfessional(nextProfessional)
            }}
          >
            {professionals.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ======================================== */}
      {/* CARTAO HERO - Avatar e estatisticas */}
      {/* ======================================== */}
      <div className="profile-hero-card">
        <div className="profile-avatar-stack">
          <div className="profile-avatar-shell">
            {avatarPreview ? <img src={avatarPreview} alt={selectedProfessional.name} /> : null}
            <div className="profile-avatar-fallback">{initials.slice(0, 2).toUpperCase()}</div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="profile-avatar-input"
            onChange={handleAvatarInput}
          />

          <button
            type="button"
            className="profile-avatar-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? 'Enviando foto...' : 'Editar foto'}
          </button>
        </div>

        <div className="profile-hero-content">
          <span className="profile-eyebrow">Resumo</span>
          <h2>{selectedProfessional.name}</h2>
          <p>{profileForm.sobreLivre || 'Adicione uma descricao para apresentar experiencia, estilo de atendimento e especialidades.'}</p>

          <div className="profile-highlight-grid">
            <article className="profile-highlight-card">
              <strong>{profileForm.servicos.length}</strong>
              <span>Servicos ativos</span>
            </article>
            <article className="profile-highlight-card">
              <strong>{selectedCategories.length}</strong>
              <span>Categorias</span>
            </article>
            <article className="profile-highlight-card">
              <strong>{profileForm.locais.length || 0}</strong>
              <span>Unidades</span>
            </article>
            <article className="profile-highlight-card">
              <strong>{formatSince(profileForm.dataInicio, profileForm.ano)}</strong>
              <span>Inicio</span>
            </article>
          </div>
        </div>
      </div>

      {(feedback || error) && (
        <p className={`profile-feedback ${error ? 'is-error' : 'is-success'}`}>
          {error || feedback}
        </p>
      )}

      {/* ======================================== */}
      {/* LAYOUT PRINCIPAL - Colunas e secoes */}
      {/* ======================================== */}
      <div className="profile-layout">
        {/* Coluna principal - Dados pessoais e disponibilidade */}
        <div className="profile-main-column">
          {/* Secao: Dados principais */}
          <section className="profile-section">
            <div className="profile-section-header">
              <div>
                <span className="profile-eyebrow">Dados principais</span>
                <h3>Informacoes da profissional</h3>
              </div>
            </div>

            <div className="profile-form-grid two-columns">
              <label className="profile-field">
                <span>Nome</span>
                <input type="text" name="nome" value={profileForm.nome} onChange={updateField} />
              </label>
              <label className="profile-field">
                <span>Sobrenome</span>
                <input type="text" name="sobrenome" value={profileForm.sobrenome} onChange={updateField} />
              </label>
            </div>

            <div className="profile-form-grid two-columns">
              <label className="profile-field">
                <span>E-mail</span>
                <input type="email" name="email" value={profileForm.email} onChange={updateField} />
              </label>
              <label className="profile-field">
                <span>Telefone</span>
                <input type="tel" name="telefone" value={profileForm.telefone} onChange={updateField} />
              </label>
            </div>

            <div className="profile-form-grid two-columns">
              <label className="profile-field">
                <span>Contato principal</span>
                <input type="text" name="contactoPrincipal" value={profileForm.contactoPrincipal} onChange={updateField} />
              </label>
              <label className="profile-field">
                <span>Ano de referencia</span>
                <input type="number" min="2000" max="2035" name="ano" value={profileForm.ano} onChange={updateField} />
              </label>
            </div>

            <div className="profile-form-grid">
              <label className="profile-field">
                <span>Data de inicio</span>
                <input type="date" name="dataInicio" value={profileForm.dataInicio} onChange={updateField} />
              </label>
            </div>
          </section>

          {/* Secao: Apresentacao/Bio */}
          <section className="profile-section">
            <div className="profile-section-header">
              <div>
                <span className="profile-eyebrow">Apresentacao</span>
                <h3>Bio e posicionamento</h3>
              </div>
            </div>

            <label className="profile-field">
              <span>Sobre a profissional</span>
              <textarea
                name="sobreLivre"
                rows="6"
                value={profileForm.sobreLivre}
                onChange={updateField}
                placeholder="Descreva experiencia, estilo, atendimento e o que diferencia esta profissional."
              />
            </label>
          </section>

          {/* Secao: Disponibilidade semanal */}
          <section className="profile-section">
            <div className="profile-section-header">
              <div>
                <span className="profile-eyebrow">Disponibilidade</span>
                <h3>Agenda semanal da profissional</h3>
              </div>
              <p className="profile-section-copy">
                Base inicial do salao: segunda a sexta das 09:00 as 18:00 e sabado ate as 13:00.
              </p>
            </div>

            <div className="profile-availability-list">
              {profileForm.disponibilidade.map((day) => (
                <div key={day.day} className="profile-availability-row">
                  <label className="profile-availability-day">
                    <input
                      type="checkbox"
                      checked={day.enabled}
                      onChange={(event) => updateAvailability(day.day, 'enabled', event.target.checked)}
                    />
                    <span>{day.label}</span>
                  </label>

                  <div className="profile-availability-times">
                    <label className="profile-field">
                      <span>Inicio</span>
                      <input
                        type="time"
                        value={day.start}
                        disabled={!day.enabled}
                        onChange={(event) => updateAvailability(day.day, 'start', event.target.value)}
                      />
                    </label>
                    <label className="profile-field">
                      <span>Fim</span>
                      <input
                        type="time"
                        value={day.end}
                        disabled={!day.enabled}
                        onChange={(event) => updateAvailability(day.day, 'end', event.target.value)}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Coluna lateral - Unidades e categorias */}
        <aside className="profile-side-column">
          {/* Secao: Unidades de atendimento */}
          <section className="profile-section">
            <div className="profile-section-header">
              <div>
                <span className="profile-eyebrow">Atendimento</span>
                <h3>Unidades</h3>
              </div>
            </div>

            <div className="profile-location-list">
              {unitOptions.map((location) => (
                <label key={location.id} className={`profile-location-card ${profileForm.locais.includes(location.value) ? 'is-selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={profileForm.locais.includes(location.value)}
                    onChange={() => toggleLocal(location.value)}
                  />
                  <div>
                    <strong>{location.label}</strong>
                    <span>{location.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Secao: Categorias ativas */}
          <section className="profile-section">
            <div className="profile-section-header">
              <div>
                <span className="profile-eyebrow">Categorias</span>
                <h3>Categorias ativas</h3>
              </div>
            </div>

            <div className="profile-selected-tags">
              {selectedCategories.length > 0 ? (
                selectedCategories.map((category) => (
                  <button key={category} type="button" className="profile-tag" onClick={() => removeCategory(category)}>
                    <span>{category}</span>
                    <small>Remover</small>
                  </button>
                ))
              ) : (
                <p className="profile-empty-copy">Ainda nao ha categorias selecionadas.</p>
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* Secao: Gerenciamento de servicos */}
      <section className="profile-section profile-services-section">
        <div className="profile-section-header profile-card-header-split">
          <div>
            <span className="profile-eyebrow">Servicos</span>
            <h3>Adicionar ou retirar categorias e servicos</h3>
          </div>

          <label className="profile-service-search">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14" />
            </svg>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Pesquisar categoria ou servico"
            />
          </label>
        </div>

        <div className="profile-service-groups">
          {Object.keys(filteredServiceGroups).length > 0 ? (
            Object.entries(filteredServiceGroups).map(([category, services]) => (
              <article key={category} className="profile-service-group">
                <div className="profile-service-group-header">
                  <div>
                    <h4>{category}</h4>
                    <p>{services.length} opcoes disponiveis</p>
                  </div>
                  {selectedCategories.includes(category) && (
                    <button type="button" className="profile-inline-action" onClick={() => removeCategory(category)}>
                      Retirar categoria
                    </button>
                  )}
                </div>

                <div className="profile-service-options">
                  {services.map((service) => (
                    <label
                      key={service}
                      className={`profile-service-option ${profileForm.servicos.includes(service) ? 'is-selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={profileForm.servicos.includes(service)}
                        onChange={() => toggleServico(service)}
                      />
                      <span>{service}</span>
                    </label>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="profile-empty-state">
              <p>Nenhum servico encontrado com esse termo.</p>
            </div>
          )}
        </div>
      </section>

      {/* Acoes finais - Botao de salvar */}
      <div className="profile-actions">
        <button type="button" className="profile-primary-action" onClick={saveProfile} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar alteracoes'}
        </button>
      </div>
    </section>
  )
}

export default Perfil

// ========================================
// ESTRUTURA GERAL DO COMPONENTE:
// 1. Constantes e utilitários (unidades, disponibilidade padrão, funções auxiliares)
// 2. Funções de conversão (form ↔ API payload)
// 3. Estado do componente (dados, loading, error)
// 4. Efeitos e hooks (useEffect para carregamento, useMemo para cálculos)
// 5. Funções de manipulação (eventos, salvar, upload)
// 6. Renderização JSX (estados de loading/error, layout principal)
// ========================================
