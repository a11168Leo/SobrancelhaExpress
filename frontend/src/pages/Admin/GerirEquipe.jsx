/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/PAGES/GERIREQUIPE.JSX */
/* ======================================== */

// Importacoes
import { useEffect, useMemo, useState } from 'react'
import Dropdown from 'react-bootstrap/Dropdown'
import Offcanvas from 'react-bootstrap/Offcanvas'
import adjustmentIcon from '../../assets/icons/ajustamento.png'
import '../../styles/pages/Profissional/GerirEquipe.css'
import { fetchJson, getServiceUrl } from '../../services/api'

// Bloco: unitOptions
const unitOptions = [
  { id: 'cascais', value: 'Cascais', label: 'Loja de Cascais', description: 'Unidade principal em Cascais' },
  { id: 'almada', value: 'Almada', label: 'Loja de Almada', description: 'Unidade secundaria em Almada' },
]

// Funcao: resolveAvatarUrl
function resolveAvatarUrl(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed
  return getServiceUrl(trimmed.startsWith('/') ? trimmed : `/${trimmed}`)
}

// Funcao: splitName
function splitName(name = '') {
  const [nome = '', ...rest] = name.trim().split(/\s+/).filter(Boolean)
  return { nome, sobrenome: rest.join(' ') }
}

// Funcao: parseAbout
function parseAbout(about = '') {
  const match = about.match(/Inicio:\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|N\/A)\s*(.*)$/i)
  if (!match) return { dataInicio: '', ano: '', sobreLivre: about || '' }
  return { dataInicio: match[1] === 'N/A' ? '' : match[1], ano: (match[2] || '').trim(), sobreLivre: '' }
}

// Funcao: formFromProfessional
function formFromProfessional(professional) {
  const { nome, sobrenome } = splitName(professional?.name)
  const { dataInicio, ano, sobreLivre } = parseAbout(professional?.about || '')
  return {
    nome,
    sobrenome,
    contactoPrincipal: professional?.contactName || '',
    email: professional?.email === 'nao informado' ? '' : professional?.email || '',
    telefone: professional?.phone === 'nao informado' ? '' : professional?.phone || '',
    dataInicio,
    ano,
    servicos: Array.isArray(professional?.specialties) ? professional.specialties : [],
    locais: String(professional?.unit || '').split(',').map((item) => item.trim()).filter(Boolean),
    sobreLivre,
  }
}

// Funcao: payloadFromForm
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
  }
}

function resolveDefaultServiceUnit(selectedProfessional) {
  const normalized = String(selectedProfessional?.unit || '').toLowerCase()
  if (normalized.includes('almada')) return 'almada'
  return 'cascais'
}

function toggleServiceUnitSelection(currentUnits, unitValue) {
  if (currentUnits.includes(unitValue)) {
    return currentUnits.length > 1
      ? currentUnits.filter((item) => item !== unitValue)
      : currentUnits
  }

  return [...currentUnits, unitValue]
}

// Funcao: GerirEquipe
function GerirEquipe({ onNavigate, reloadKey = 0 }) {

// Estado do componente
  const [professionals, setProfessionals] = useState([])
  const [catalogServices, setCatalogServices] = useState([])
  const [catalogCategories, setCatalogCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUnit, setSelectedUnit] = useState('Todos')
  const [selectedSituation, setSelectedSituation] = useState('Todos')
  const [pendingUnit, setPendingUnit] = useState('Todos')
  const [pendingSituation, setPendingSituation] = useState('Todos')
  const [sortOption, setSortOption] = useState('name-asc')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState(null)
  const [editSuccess, setEditSuccess] = useState(null)
  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [serviceSubmitting, setServiceSubmitting] = useState(false)
  const [serviceError, setServiceError] = useState(null)
  const [copyFeedback, setCopyFeedback] = useState(null)
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', durationMinutes: '', category: '', units: ['cascais'] })
  const [editForm, setEditForm] = useState({ nome: '', sobrenome: '', contactoPrincipal: '', email: '', telefone: '', dataInicio: '', ano: '', servicos: [], locais: [], sobreLivre: '' })

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

        setProfessionals(users.map((u, index) => ({
          id: u._id ?? u.id ?? index,
          name: u.name ?? 'Sem nome',
          role: u.role ?? 'Profissional',
          unit: u.salonName ?? u.unit ?? 'Nao informado',
          contactName: u.contactName ?? '',
          email: u.email ?? 'nao informado',
          phone: u.phone ?? 'nao informado',
          situation: u.active === false || u.status === 'inativo' ? 'Nao ativo' : 'Ativo',
          about: u.about ?? '',
          avatar: resolveAvatarUrl(u.avatar ?? u.avatarUrl ?? u.photo ?? u.photoUrl ?? u.image ?? ''),
          specialties: Array.isArray(u.specialties) ? u.specialties : [],
        })))
        setCatalogServices(services)
        setCatalogCategories(categories)
        setError(null)
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [reloadKey])

  const topLevelCategories = useMemo(() => catalogCategories.filter((category) => Number(category.level) === 0), [catalogCategories])

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
    return groups
  }, [catalogCategories, catalogServices])

  const unitFilters = ['Todos', ...Array.from(new Set(professionals.map((p) => p.unit))).filter(Boolean)]
  const situationFilters = ['Todos', 'Ativo', 'Nao ativo']

  const filteredProfessionals = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    const visible = professionals.filter((professional) => {
      const matchesUnit = selectedUnit === 'Todos' || professional.unit === selectedUnit
      const matchesSituation = selectedSituation === 'Todos' || professional.situation === selectedSituation
      const matchesSearch = normalized.length === 0 || [professional.name, professional.role, professional.email, professional.phone].some((value) => value.toLowerCase().includes(normalized))
      return matchesUnit && matchesSituation && matchesSearch
    })
    return [...visible].sort((a, b) => {
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name, 'pt-PT', { sensitivity: 'base' })
      if (sortOption === 'name-desc') return b.name.localeCompare(a.name, 'pt-PT', { sensitivity: 'base' })
      const aLast = a.name.trim().split(' ').slice(-1)[0] || ''
      const bLast = b.name.trim().split(' ').slice(-1)[0] || ''
      if (sortOption === 'surname-asc') return aLast.localeCompare(bLast, 'pt-PT', { sensitivity: 'base' })
      return bLast.localeCompare(aLast, 'pt-PT', { sensitivity: 'base' })
    })
  }, [professionals, searchTerm, selectedUnit, selectedSituation, sortOption])

  const openProfessional = (professional) => {
    setSelectedProfessional(professional)
    setEditForm(formFromProfessional(professional))
    setIsEditing(false)
    setEditError(null)
    setEditSuccess(null)
    setServiceModalOpen(false)
    setServiceError(null)
    setCopyFeedback(null)
  }

  const closeProfessional = () => {
    setSelectedProfessional(null)
    setIsEditing(false)
    setEditError(null)
    setEditSuccess(null)
    setServiceModalOpen(false)
    setServiceError(null)
    setCopyFeedback(null)
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setEditForm((current) => ({ ...current, [name]: value }))
  }

  const updateServiceField = (event) => {
    const { name, value } = event.target
    setServiceForm((current) => ({ ...current, [name]: value }))
  }

  const toggleServiceUnit = (unitValue) => {
    setServiceForm((current) => ({
      ...current,
      units: toggleServiceUnitSelection(current.units, unitValue),
    }))
  }

  const toggleServico = (servico) => {
    setEditForm((current) => ({
      ...current,
      servicos: current.servicos.includes(servico) ? current.servicos.filter((item) => item !== servico) : [...current.servicos, servico],
    }))
  }

  const toggleLocal = (local) => {
    setEditForm((current) => ({
      ...current,
      locais: current.locais.includes(local) ? current.locais.filter((item) => item !== local) : [...current.locais, local],
    }))
  }

  const openServiceModal = () => {
    setServiceForm({
      name: '',
      description: '',
      price: '',
      durationMinutes: '',
      category: topLevelCategories[0]?._id ?? topLevelCategories[0]?.id ?? '',
      units: [resolveDefaultServiceUnit(selectedProfessional)],
    })
    setServiceError(null)
    setServiceModalOpen(true)
  }

  const closeServiceModal = () => {
    setServiceModalOpen(false)
    setServiceError(null)
  }

  const copyText = async (label, value) => {
    const normalized = String(value || '').trim()
    if (!normalized || normalized === 'nao informado' || normalized === 'Nao informado') {
      setCopyFeedback(`Nao ha ${label.toLowerCase()} disponivel para copiar.`)
      return
    }

    try {
      await navigator.clipboard.writeText(normalized)
      setCopyFeedback(`${label} copiado com sucesso.`)
    } catch (_error) {
      setCopyFeedback(`Nao foi possivel copiar ${label.toLowerCase()}.`)
    }
  }

  const saveProfessional = async () => {
    if (!selectedProfessional) return
    if (!editForm.nome.trim() || !editForm.email.trim()) {
      setEditError('Nome e e-mail sao obrigatorios.')
      return
    }
    setEditSubmitting(true)
    setEditError(null)
    setEditSuccess(null)
    try {
      const payload = payloadFromForm(editForm)
      const response = await fetchJson(`/auth/professionals/${selectedProfessional.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      const user = response?.user ?? response
      const updatedProfessional = {
        id: user._id ?? user.id ?? selectedProfessional.id,
        name: user.name ?? payload.name,
        role: user.role ?? selectedProfessional.role,
        unit: user.salonName ?? payload.salonName ?? 'Nao informado',
        contactName: user.contactName ?? payload.contactName ?? '',
        email: user.email ?? payload.email,
        phone: user.phone ?? payload.phone,
        situation: user.active === false || user.status === 'inativo' ? 'Nao ativo' : selectedProfessional.situation,
        about: user.about ?? payload.about,
        avatar: resolveAvatarUrl(user.avatar ?? selectedProfessional.avatar),
        specialties: Array.isArray(user.specialties) ? user.specialties : payload.specialties,
      }
      setProfessionals((current) => current.map((professional) => (professional.id === updatedProfessional.id ? updatedProfessional : professional)))
      setSelectedProfessional(updatedProfessional)
      setEditForm(formFromProfessional(updatedProfessional))
      setIsEditing(false)
      setEditSuccess('Informacoes atualizadas com sucesso.')
    } catch (submitError) {
      setEditError(submitError.message)
    } finally {
      setEditSubmitting(false)
    }
  }

  const createService = async () => {
    if (!serviceForm.name.trim() || !serviceForm.price || !serviceForm.durationMinutes || !serviceForm.category) {
      setServiceError('Preencha nome, preco, duracao e categoria.')
      return
    }
    if (!serviceForm.units.length) {
      setServiceError('Selecione pelo menos uma unidade para o servico.')
      return
    }
    setServiceSubmitting(true)
    setServiceError(null)
    try {
      const response = await fetchJson('/services/public', {
        method: 'POST',
        body: JSON.stringify({
          name: serviceForm.name.trim(),
          description: serviceForm.description.trim(),
          price: Number(serviceForm.price),
          durationMinutes: Number(serviceForm.durationMinutes),
          category: serviceForm.category,
          units: serviceForm.units,
        }),
      })
      const service = response?.service ?? response
      const serviceName = service.name ?? service.nome ?? serviceForm.name.trim()
      setCatalogServices((current) => [...current, service])
      setEditForm((current) => ({ ...current, servicos: current.servicos.includes(serviceName) ? current.servicos : [...current.servicos, serviceName] }))
      closeServiceModal()
    } catch (submitError) {
      setServiceError(submitError.message)
    } finally {
      setServiceSubmitting(false)
    }
  }

  if (loading) return <section className="team-page" aria-label="Gerir Equipe"><p>Carregando profissionais...</p></section>
  if (error) return <section className="team-page" aria-label="Gerir Equipe"><div className="team-heading"><h1>Erro</h1><p>{error}</p></div></section>

// Renderizacao principal
  return (
    <section className="team-page" aria-label="Gerir Equipe">
      <div className="team-heading">
        <h1>Nossa Equipe</h1>
        <button className="team-add-professional-button" type="button" aria-label="Adicionar profissional" onClick={() => onNavigate('adicionar-profissional')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
            <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5" />
          </svg>
          <span>Adicionar</span>
        </button>
      </div>

      <div className="team-toolbar-shell">
        <div className="team-toolbar">
          <div className="team-search-filter-group">
            <label className="team-search" htmlFor="team-search">
              <span className="team-search-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" /></svg>
              </span>
              <input id="team-search" type="search" placeholder="Pesquisar colaboradores" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            </label>
            <button className={`team-filter-button ${selectedUnit !== 'Todos' || selectedSituation !== 'Todos' ? 'active' : ''}`} type="button" onClick={() => { setPendingUnit(selectedUnit); setPendingSituation(selectedSituation); setShowFilters(true) }}>
              <span>Filtros</span>
              <img src={adjustmentIcon} alt="" className="team-filter-button-image" aria-hidden="true" />
            </button>
          </div>
          <Dropdown align="end" className="team-order-dropdown">
            <Dropdown.Toggle className="team-order-button" id="team-order-dropdown">
              <span>{sortOption === 'name-asc' ? 'Nome (A-Z)' : sortOption === 'name-desc' ? 'Nome (Z-A)' : sortOption === 'surname-asc' ? 'Sobrenome (A-Z)' : 'Sobrenome (Z-A)'}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="team-order-menu">
              {['name-asc', 'name-desc', 'surname-asc', 'surname-desc'].map((option) => (
                <Dropdown.Item as="button" key={option} active={option === sortOption} onClick={() => setSortOption(option)}>
                  {option === 'name-asc' ? 'Nome (A-Z)' : option === 'name-desc' ? 'Nome (Z-A)' : option === 'surname-asc' ? 'Sobrenome (A-Z)' : 'Sobrenome (Z-A)'}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <div className="team-list-divider" aria-hidden="true" />

      <div className="team-table" role="table" aria-label="Tabela de profissionais">
        <div className="team-table-header" role="row">
          <button type="button" className="team-table-sort" onClick={() => setSortOption((current) => (current === 'name-asc' ? 'name-desc' : 'name-asc'))} role="columnheader">Profissional</button>
          <div className="team-table-cell">Contato</div>
          <div className="team-table-cell">Unidade</div>
          <div className="team-table-cell">Situacao</div>
        </div>
        {filteredProfessionals.map((professional) => (
          <div key={professional.id} className="team-table-row" role="button" tabIndex={0} onClick={() => openProfessional(professional)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProfessional(professional) } }}>
            <span className="team-table-cell"><div className="professional-info"><div className="professional-avatar">{professional.avatar ? <img src={professional.avatar} alt={professional.name} onError={(event) => { event.currentTarget.style.display = 'none' }} /> : null}<div className="avatar-placeholder avatar-placeholder-fallback">{professional.name.charAt(0).toUpperCase()}</div></div><div className="professional-details"><div className="professional-name">{professional.name}</div><div className="professional-role">{professional.role}</div>{professional.specialties.length > 0 && <small className="text-muted">{professional.specialties.join(', ')}</small>}</div></div></span>
            <span className="team-table-cell"><div className="professional-contact"><span className="professional-email">{professional.email}</span><span className="professional-phone">{professional.phone}</span></div></span>
            <span className="team-table-cell team-table-unit">{professional.unit}</span>
            <span className="team-table-cell"><span className={`team-status-badge ${professional.situation === 'Ativo' ? 'is-active' : 'is-inactive'}`}>{professional.situation}</span></span>
          </div>
        ))}
      </div>

      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="end" className="team-offcanvas team-filter-offcanvas">
        <Offcanvas.Header closeButton className="team-offcanvas-header"><Offcanvas.Title>Filtros</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body className="team-offcanvas-body">
          <div className="filter-group"><label>Unidade:</label><select value={pendingUnit} onChange={(event) => setPendingUnit(event.target.value)}>{unitFilters.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
          <div className="filter-group"><label>Situação:</label><select value={pendingSituation} onChange={(event) => setPendingSituation(event.target.value)}>{situationFilters.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
          <button type="button" className="btn btn-primary" onClick={() => { setSelectedUnit(pendingUnit); setSelectedSituation(pendingSituation); setShowFilters(false) }}>Aplicar</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setPendingUnit('Todos'); setPendingSituation('Todos'); setSelectedUnit('Todos'); setSelectedSituation('Todos') }}>Limpar</button>
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas show={Boolean(selectedProfessional)} onHide={closeProfessional} placement="end" className="team-professional-offcanvas">
        <Offcanvas.Header closeButton className="team-professional-offcanvas-header"><Offcanvas.Title>{isEditing ? 'Editar profissional' : 'Detalhes da profissional'}</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body className="team-professional-offcanvas-body">
          {selectedProfessional && (
            <div className="team-professional-overlay-stack">
              <div className="team-professional-panel">
                <div className="team-professional-panel-header">
                  <div className="team-professional-panel-avatar">{selectedProfessional.avatar ? <img src={selectedProfessional.avatar} alt={selectedProfessional.name} onError={(event) => { event.currentTarget.style.display = 'none' }} /> : null}<div className="avatar-placeholder avatar-placeholder-fallback">{selectedProfessional.name.charAt(0).toUpperCase()}</div></div>
                  <div className="team-professional-panel-identity"><h2>{selectedProfessional.name}</h2><p>{selectedProfessional.role}</p></div>
                  <div className="team-professional-highlights" aria-label="Resumo rapido">
                    <div className="team-professional-highlight-card"><strong>{selectedProfessional.specialties.length}</strong><span>Servicos</span></div>
                    <div className="team-professional-highlight-card"><strong>{selectedProfessional.unit.split(',').map((item) => item.trim()).filter(Boolean).length || 1}</strong><span>Unidades</span></div>
                    <div className="team-professional-highlight-card"><strong>{selectedProfessional.situation}</strong><span>Status</span></div>
                  </div>
                </div>
                <div className="team-professional-divider" aria-hidden="true" />
                <div className="team-professional-layout">
                  <aside className="team-professional-sidebar" aria-label="Secoes de detalhes"><button type="button" className="team-professional-nav-item is-active"><span>Pessoal</span></button></aside>
                  <div className="team-professional-content">
                    <div className="team-professional-quick-actions">
                      <button type="button" className="team-professional-quick-action" onClick={() => copyText('E-mail', selectedProfessional.email)}>
                        <strong>Copiar e-mail</strong>
                        <span>{selectedProfessional.email}</span>
                      </button>
                      <button type="button" className="team-professional-quick-action" onClick={() => copyText('Telefone', selectedProfessional.phone)}>
                        <strong>Copiar telefone</strong>
                        <span>{selectedProfessional.phone}</span>
                      </button>
                    </div>
                    <div className="team-professional-content-header">
                      <span className="team-professional-panel-label">Pessoal</span>
                      {isEditing ? <div className="team-professional-edit-actions"><button type="button" className="team-professional-secondary-button" onClick={() => { setEditForm(formFromProfessional(selectedProfessional)); setIsEditing(false); setEditError(null); setEditSuccess(null) }}>Cancelar</button><button type="button" className="team-professional-edit-button" onClick={saveProfessional} disabled={editSubmitting}><span>{editSubmitting ? 'Salvando...' : 'Salvar'}</span></button></div> : <button type="button" className="team-professional-edit-button" onClick={() => { setEditForm(formFromProfessional(selectedProfessional)); setIsEditing(true); setEditError(null); setEditSuccess(null) }}><span>Editar</span></button>}
                    </div>
                    {copyFeedback && <p className="team-form-feedback is-info">{copyFeedback}</p>}
                    {editError && <p className="team-form-feedback is-error">{editError}</p>}
                    {editSuccess && <p className="team-form-feedback is-success">{editSuccess}</p>}
                    {isEditing ? (
                      <div className="team-edit-form">
                        <section className="team-edit-section"><div className="team-edit-section-header"><h3>Perfil</h3><p>Edite os dados principais da profissional.</p></div><div className="team-edit-grid two-columns"><label className="team-edit-field"><span>Nome</span><input type="text" name="nome" value={editForm.nome} onChange={updateField} /></label><label className="team-edit-field"><span>Sobrenome</span><input type="text" name="sobrenome" value={editForm.sobrenome} onChange={updateField} /></label></div><div className="team-edit-grid two-columns"><label className="team-edit-field"><span>Contacto principal</span><input type="text" name="contactoPrincipal" value={editForm.contactoPrincipal} onChange={updateField} /></label><label className="team-edit-field"><span>Telefone</span><input type="tel" name="telefone" value={editForm.telefone} onChange={updateField} /></label></div><label className="team-edit-field"><span>E-mail</span><input type="email" name="email" value={editForm.email} onChange={updateField} /></label><div className="team-edit-grid two-columns"><label className="team-edit-field"><span>Data de inicio</span><input type="date" name="dataInicio" value={editForm.dataInicio} onChange={updateField} /></label><label className="team-edit-field"><span>Ano</span><input type="number" min="2000" max="2035" name="ano" value={editForm.ano} onChange={updateField} /></label></div><label className="team-edit-field"><span>Sobre</span><textarea name="sobreLivre" rows="4" value={editForm.sobreLivre} onChange={updateField} /></label></section>
                        <section className="team-edit-section"><div className="team-edit-section-header"><h3>Servicos</h3><p>Atualize os servicos associados a esta profissional.</p></div><div className="team-service-tools"><button type="button" className="team-professional-edit-button" onClick={openServiceModal}><span>Adicionar novo servico</span></button></div><div className="team-services-categories">{Object.entries(groupedCatalogServices).map(([category, services]) => <div key={category} className="team-services-category"><h4>{category}</h4><div className="team-services-options">{services.map((service) => <label key={service} className="team-check-option"><input type="checkbox" checked={editForm.servicos.includes(service)} onChange={() => toggleServico(service)} /><span>{service}</span></label>)}</div></div>)}</div></section>
                        <section className="team-edit-section"><div className="team-edit-section-header"><h3>Locais</h3><p>Defina em quais unidades a profissional trabalha.</p></div><div className="team-location-options">{unitOptions.map((location) => <label key={location.id} className="team-location-card"><input type="checkbox" checked={editForm.locais.includes(location.value)} onChange={() => toggleLocal(location.value)} /><div className="team-location-card-content"><strong>{location.label}</strong><span>{location.description}</span></div></label>)}</div></section>
                      </div>
                    ) : (
                      <>
                        <div className="team-professional-panel-section"><span className="team-professional-panel-label">Nome</span><p>{selectedProfessional.name}</p></div>
                        <div className="team-professional-panel-section"><span className="team-professional-panel-label">Funcao</span><p>{selectedProfessional.role}</p></div>
                        <div className="team-professional-panel-section"><span className="team-professional-panel-label">Contacto principal</span><p>{selectedProfessional.contactName || 'Nao informado'}</p></div>
                        <div className="team-professional-panel-section"><span className="team-professional-panel-label">E-mail</span><p>{selectedProfessional.email}</p></div>
                        <div className="team-professional-panel-section"><span className="team-professional-panel-label">Telefone</span><p>{selectedProfessional.phone}</p></div>
                        <div className="team-professional-panel-section"><span className="team-professional-panel-label">Unidade</span><p>{selectedProfessional.unit}</p></div>
                        <div className="team-professional-panel-section"><span className="team-professional-panel-label">Situacao</span><span className={`team-status-badge ${selectedProfessional.situation === 'Ativo' ? 'is-active' : 'is-inactive'}`}>{selectedProfessional.situation}</span></div>
                        <div className="team-professional-panel-section"><span className="team-professional-panel-label">Especialidades</span><p>{selectedProfessional.specialties.length > 0 ? selectedProfessional.specialties.join(', ') : 'Nao informado'}</p></div>
                        <div className="team-professional-panel-section"><span className="team-professional-panel-label">Sobre</span><p>{selectedProfessional.about || 'Sem informacoes adicionais.'}</p></div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {serviceModalOpen && (
                <div className="team-floating-service-backdrop" onClick={closeServiceModal}>
                  <div className="team-floating-service-modal" onClick={(event) => event.stopPropagation()}>
                    <div className="team-floating-service-header"><div><h3>Novo serviço</h3><p>Use a base de dados de servicos como referencia para criar um novo item.</p></div><button type="button" className="team-floating-close" onClick={closeServiceModal}>x</button></div>
                    {serviceError && <p className="team-form-feedback is-error">{serviceError}</p>}
                    <div className="team-edit-form">
                      <label className="team-edit-field"><span>Nome do servico</span><input type="text" name="name" value={serviceForm.name} onChange={updateServiceField} /></label>
                      <label className="team-edit-field"><span>Descricao</span><textarea name="description" rows="4" value={serviceForm.description} onChange={updateServiceField} /></label>
                      <div className="team-edit-grid two-columns"><label className="team-edit-field"><span>Preco</span><input type="number" min="0" step="0.01" name="price" value={serviceForm.price} onChange={updateServiceField} /></label><label className="team-edit-field"><span>Duracao em minutos</span><input type="number" min="1" step="1" name="durationMinutes" value={serviceForm.durationMinutes} onChange={updateServiceField} /></label></div>
                      <div className="team-edit-field team-service-unit-field"><span>Unidades</span><div className="team-service-unit-options">{unitOptions.map((location) => <button key={location.id} type="button" className={`team-service-unit-option ${serviceForm.units.includes(location.id) ? 'is-selected' : ''}`} onClick={() => toggleServiceUnit(location.id)}><strong>{location.value}</strong><small>{location.description}</small></button>)}</div></div>
                      <label className="team-edit-field"><span>Categoria</span><select name="category" value={serviceForm.category} onChange={updateServiceField}><option value="">Selecione uma categoria</option>{topLevelCategories.map((category) => <option key={category._id ?? category.id} value={category._id ?? category.id}>{category.name ?? category.nome}</option>)}</select></label>
                    </div>
                    <div className="team-floating-service-actions"><button type="button" className="team-professional-secondary-button" onClick={closeServiceModal}>Cancelar</button><button type="button" className="team-professional-edit-button" onClick={createService} disabled={serviceSubmitting}><span>{serviceSubmitting ? 'Criando...' : 'Criar servico'}</span></button></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </section>
  )
}

// Exportacao principal
export default GerirEquipe
