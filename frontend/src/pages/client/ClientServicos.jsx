import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api, { API_BASE_URL } from '../../api/api.js'

const salons = [
  {
    name: 'Sobrancelha Express Centro',
    address: 'Rua Principal, 150 - Centro',
    phone: '+351 910 000 111',
  },
  {
    name: 'Sobrancelha Express Norte',
    address: 'Avenida Norte, 88 - Porto',
    phone: '+351 910 000 222',
  },
  {
    name: 'Sobrancelha Express Sul',
    address: 'Praca do Sul, 45 - Lisboa',
    phone: '+351 910 000 333',
  },
]

function ClientServicos() {
  const [services, setServices] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('')
  const [professionalServices, setProfessionalServices] = useState([])
  const [categoryNameById, setCategoryNameById] = useState({})
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const [servicesRes, professionalsRes, categoriesRes] = await Promise.all([
        api.get('/services'),
        api.get('/auth/professionals'),
        api.get('/categories'),
      ])
      setServices(servicesRes.data.services || [])
      const professionalList = professionalsRes.data.users || []
      setProfessionals(professionalList)
      if (professionalList.length > 0) {
        setSelectedProfessionalId(professionalList[0]._id || professionalList[0].id || '')
      }
      const categoryMap = Object.fromEntries(
        (categoriesRes.data.categories || []).map((item) => [item._id, item.name])
      )
      setCategoryNameById(categoryMap)
    }
    load().catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedProfessionalId) {
      setProfessionalServices([])
      return
    }
    const loadProfessionalServices = async () => {
      const res = await api.get(`/services?professionalId=${selectedProfessionalId}`)
      setProfessionalServices(res.data.services || [])
    }
    loadProfessionalServices().catch(() => {})
  }, [selectedProfessionalId])

  useEffect(() => {
    const category = params.get('categoria')
    if (category) {
      setCategoryFilter(category)
    } else {
      setCategoryFilter('all')
    }
  }, [params])

  const categories = useMemo(() => {
    const list = Array.from(
      new Set(services.map((item) => item.category).filter(Boolean))
    )
    return list.sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [services])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return services.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      if (!term) return true
      return (
        (item.name || '').toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term)
      )
    })
  }, [services, search, categoryFilter])

  const selectedProfessional = useMemo(
    () =>
      professionals.find(
        (item) => (item._id || item.id) === selectedProfessionalId
      ) || null,
    [professionals, selectedProfessionalId]
  )

  const professionalServiceLabels = useMemo(() => {
    const labels = new Set()
    for (const item of professionalServices) {
      const categoryId =
        typeof item.category === 'string' ? item.category : item.category?._id
      const categoryName =
        (categoryId && categoryNameById[categoryId]) ||
        (typeof item.category === 'object' ? item.category?.name : '') ||
        ''
      labels.add(categoryName || item.name || 'Servico')
    }
    return Array.from(labels)
  }, [professionalServices, categoryNameById])

  return (
    <section className="page">
      <div className="client-services-hero">
        <div>
          <h1>Servicos</h1>
          <p className="page-subtitle">Escolha seu atendimento e avance para o agendamento.</p>
        </div>
        <div>
          <button
            className="btn"
            type="button"
            onClick={() => {
              const token = localStorage.getItem('token') || sessionStorage.getItem('token')
              if (!token) {
                navigate('/login')
                return
              }
              navigate('/cliente/agendamentos')
            }}
          >
            Marcar agendamento
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input
            className="search"
            type="search"
            placeholder="Buscar servico"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="search"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="client-catalog-grid">
          {filtered.map((item) => (
            <article key={item._id} className="client-service-card">
              <h3>{item.name}</h3>
              <p style={{ margin: 0, color: 'var(--client-muted)', fontSize: '0.92rem' }}>
                {item.description || 'Atendimento personalizado para seu estilo.'}
              </p>
              <div className="client-service-meta">
                <span>{item.category || 'Categoria livre'}</span>
                <span>{item.maxDurationMinutes || item.durationMinutes || 0} min</span>
              </div>
              <div className="client-service-price">EUR {Number(item.price || 0).toFixed(2)}</div>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
                  if (!token) {
                    navigate('/login')
                    return
                  }
                  navigate('/cliente/agendamentos')
                }}
              >
                Quero este servico
              </button>
            </article>
          ))}
          {filtered.length === 0 && <p style={{ margin: 0 }}>Nenhum servico encontrado.</p>}
        </div>
      </div>

      <div className="card client-section" id="sobre">
        <h3>Nossa equipa:</h3>
        <div className="client-team-layout">
          <aside className="client-team-aside">
            {professionals.map((item) => {
              const id = item._id || item.id
              return (
                <button
                  key={id}
                  type="button"
                  className={`client-team-prof-btn${id === selectedProfessionalId ? ' active' : ''}`}
                  onClick={() => setSelectedProfessionalId(id)}
                >
                  {item.avatar ? (
                    <img
                      src={item.avatar.startsWith('http') ? item.avatar : `${API_BASE_URL}${item.avatar}`}
                      alt={item.name}
                      className="client-team-prof-avatar"
                    />
                  ) : (
                    <div className="client-team-prof-avatar fallback">
                      {item.name?.[0]?.toUpperCase() || 'P'}
                    </div>
                  )}
                  <span>{item.name}</span>
                </button>
              )
            })}
            {professionals.length === 0 && (
              <p style={{ margin: 0, color: 'var(--client-muted)' }}>Sem profissionais listadas.</p>
            )}
          </aside>

          <div className="client-team-content">
            {selectedProfessional ? (
              <>
                <div className="client-team-name-row">
                  {selectedProfessional.avatar ? (
                    <img
                      src={
                        selectedProfessional.avatar.startsWith('http')
                          ? selectedProfessional.avatar
                          : `${API_BASE_URL}${selectedProfessional.avatar}`
                      }
                      alt={selectedProfessional.name}
                      className="client-team-avatar"
                    />
                  ) : (
                    <div className="client-team-avatar fallback">
                      {selectedProfessional.name?.[0]?.toUpperCase() || 'P'}
                    </div>
                  )}
                  <h4>{selectedProfessional.name}</h4>
                </div>

                <div className="client-team-about">
                  <h4>Sobre</h4>
                  <p>{selectedProfessional.about || 'Profissional especializada em beleza e bem-estar.'}</p>
                </div>

                <div className="client-team-services">
                  <h4>Servicos</h4>
                  <div className="client-team-service-list">
                    {professionalServiceLabels.map((label) => (
                      <span key={label} className="client-team-service-chip">{label}</span>
                    ))}
                    {professionalServiceLabels.length === 0 && (
                      <>
                        <span className="client-team-service-chip">Tratamento Facial</span>
                        <span className="client-team-service-chip">Tratamento corporal</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p style={{ margin: 0, color: 'var(--client-muted)' }}>
                Selecione uma profissional para ver o perfil.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="card client-section" id="localizacao">
        <h3>Localizacao</h3>
        <div className="client-location-grid">
          {salons.map((salon) => (
            <article key={salon.name} className="client-service-card">
              <h3>{salon.name}</h3>
              <p style={{ margin: 0, color: 'var(--client-muted)' }}>{salon.address}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="card client-section" id="contato">
        <h3>Contato</h3>
        <div className="client-contact-grid">
          {salons.map((salon) => (
            <article key={salon.name} className="client-service-card">
              <h3>{salon.name}</h3>
              <p style={{ margin: 0, color: 'var(--client-muted)' }}>{salon.phone}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ClientServicos
