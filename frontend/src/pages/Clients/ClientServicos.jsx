
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useMemo, useState } from 'react'
import { fetchJson, getServiceUrl } from '../../services/api'

const cascaisMapsLink =
  'https://www.google.com/maps/search/?api=1&query=R.%20do%20Mercado%2051%20loja%202%2C%202785-630%20Sao%20Domingos%20de%20Rana'
const almadaMapsLink =
  'https://www.google.com/maps/search/?api=1&query=Avenida%20da%20Fundacao%2008%20Loja7%2C%202805-180%20Almada'
const weeklyHours = [
  ['Segunda-feira', '09h - 18h'],
  ['Terca-feira', '09h - 18h'],
  ['Quarta-feira', '09h - 18h'],
  ['Quinta-feira', '09h - 18h'],
  ['Sexta-feira', '09h - 18h'],
  ['Sabado', '09h - 18h'],
  ['Domingo', 'Fechado'],
]

const unitOptions = [
  { id: 'cascais', label: 'Cascais', matcher: 'cascais' },
  { id: 'almada', label: 'Almada', matcher: 'almada' },
]

function ClientServicos({ onNavigate, isGuest = false }) {
  const [services, setServices] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [selectedUnit, setSelectedUnit] = useState('cascais')
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('')
  const [professionalServices, setProfessionalServices] = useState([])
  const [portfolioIndex, setPortfolioIndex] = useState(0)
  const [categoryNameById, setCategoryNameById] = useState({})
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      const [servicesRes, professionalsRes, categoriesRes] = await Promise.all([
        fetchJson('/services'),
        fetchJson('/auth/professionals'),
        fetchJson('/categories'),
      ])
      setServices(servicesRes?.services || [])
      const professionalList = professionalsRes?.users || []
      setProfessionals(professionalList)
      const categoryMap = Object.fromEntries(
        (categoriesRes?.categories || []).map((item) => [item._id, item.name])
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
      const res = await fetchJson(`/services?professionalId=${selectedProfessionalId}`)
      setProfessionalServices(res?.services || [])
    }
    loadProfessionalServices().catch(() => {})
  }, [selectedProfessionalId])

  useEffect(() => {
    setPortfolioIndex(0)
  }, [selectedProfessionalId])

  useEffect(() => {
    setCategoryFilter('all')
  }, [selectedUnit])

  const professionalsByUnit = useMemo(() => {
    const unitMatch = unitOptions.find((item) => item.id === selectedUnit)?.matcher || 'cascais'

    return professionals.filter((item) =>
      String(item.salonName || item.unit || '')
        .toLowerCase()
        .includes(unitMatch)
    )
  }, [professionals, selectedUnit])

  useEffect(() => {
    if (professionalsByUnit.length === 0) {
      setSelectedProfessionalId('')
      return
    }

    const hasSelectedProfessional = professionalsByUnit.some(
      (item) => (item._id || item.id) === selectedProfessionalId
    )

    if (!hasSelectedProfessional) {
      setSelectedProfessionalId(professionalsByUnit[0]._id || professionalsByUnit[0].id || '')
    }
  }, [professionalsByUnit, selectedProfessionalId])

  const categories = useMemo(() => {
    const professionalIds = new Set(
      professionalsByUnit.map((item) => String(item._id || item.id))
    )

    const list = Array.from(
      new Set(
        services
          .filter((item) => {
            const serviceUnits = Array.isArray(item.units)
              ? item.units.map((unit) => String(unit || '').toLowerCase()).filter(Boolean)
              : []
            const serviceUnit = String(item.unit || '').toLowerCase()
            if (serviceUnits.length > 0) return serviceUnits.includes(selectedUnit)
            if (serviceUnit) return serviceUnit === selectedUnit
            return professionalIds.has(String(item.professional || ''))
          })
          .map((item) => item.category)
          .filter(Boolean)
      )
    )
    return list.sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [services, professionalsByUnit, selectedUnit])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const professionalIds = new Set(
      professionalsByUnit.map((item) => String(item._id || item.id))
    )

    return services.filter((item) => {
      const serviceUnits = Array.isArray(item.units)
        ? item.units.map((unit) => String(unit || '').toLowerCase()).filter(Boolean)
        : []
      const serviceUnit = String(item.unit || '').toLowerCase()
      if (serviceUnits.length > 0) {
        if (!serviceUnits.includes(selectedUnit)) return false
      } else if (serviceUnit) {
        if (serviceUnit !== selectedUnit) return false
      } else if (!professionalIds.has(String(item.professional || ''))) {
        return false
      }
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      if (!term) return true
      return (
        (item.name || '').toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term)
      )
    })
  }, [services, professionalsByUnit, search, categoryFilter])

  const selectedProfessional = useMemo(
    () =>
      professionalsByUnit.find(
        (item) => (item._id || item.id) === selectedProfessionalId
      ) || null,
    [professionalsByUnit, selectedProfessionalId]
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

  const professionalSpecialties = useMemo(() => {
    if (selectedProfessional?.specialties?.length) {
      return selectedProfessional.specialties
    }
    return professionalServiceLabels
  }, [selectedProfessional, professionalServiceLabels])

  const portfolioImages = useMemo(() => {
    return professionalServices
      .map((item) => ({
        name: item.name || 'Servico',
        imageUrl: item.imageUrl
          ? (item.imageUrl.startsWith('http') ? item.imageUrl : getServiceUrl(item.imageUrl))
          : '',
      }))
      .filter((item) => Boolean(item.imageUrl))
  }, [professionalServices])

  useEffect(() => {
    if (portfolioImages.length <= 1) return undefined
    const interval = window.setInterval(() => {
      setPortfolioIndex((prev) => (prev + 1) % portfolioImages.length)
    }, 3200)

    return () => window.clearInterval(interval)
  }, [portfolioImages.length])

  return (
    <section className="page">
      <div className="client-services-hero">
        <div>
          <h1>Serviços</h1>
          <p className="page-subtitle">Escolha a unidade e veja os servicos disponiveis em cada salao.</p>
        </div>
      </div>

      <div className="card client-services-toolbar-card">
        <div className="client-services-toolbar">
          <div className="client-services-toolbar-spacer" aria-hidden="true" />

          <div className="client-unit-tabs" role="tablist" aria-label="Selecionar unidade do salao">
            {unitOptions.map((unit) => (
              <button
                key={unit.id}
                type="button"
                role="tab"
                aria-selected={selectedUnit === unit.id}
                className={`client-unit-tab${selectedUnit === unit.id ? ' active' : ''}`}
                onClick={() => setSelectedUnit(unit.id)}
              >
                {unit.label}
              </button>
            ))}
          </div>

          <div className="client-services-search-wrap">
            <input
              className="search client-services-search"
              type="search"
              placeholder="Buscar servico"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="client-services-mobile-actions">
          <input
            className="search client-services-search"
            type="search"
            placeholder="Buscar servico"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
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
                onClick={() => onNavigate?.(isGuest ? 'login' : 'client-agendamentos')}
              >
                {isGuest ? 'Entrar para agendar' : 'Quero este servico'}
              </button>
            </article>
          ))}
          {filtered.length === 0 && <p style={{ margin: 0 }}>Nenhum servico encontrado para esta unidade.</p>}
        </div>
      </div>

      <div className="card client-section client-team-card" id="sobre">
        <h3>Nossa equipa - {unitOptions.find((unit) => unit.id === selectedUnit)?.label}</h3>
        <div className="client-team-layout">
          <aside className="client-team-aside">
            {professionalsByUnit.map((item) => {
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
                      src={item.avatar.startsWith('http') ? item.avatar : getServiceUrl(item.avatar)}
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
            {professionalsByUnit.length === 0 && (
              <p style={{ margin: 0, color: 'var(--client-muted)' }}>Sem profissionais listadas nesta unidade.</p>
            )}
          </aside>

          <div className="client-team-content">
            {selectedProfessional ? (
              <>
                <div className="client-team-about">
                  <h4>Sobre</h4>
                  <p>{selectedProfessional.about || 'Profissional especializada em beleza e bem-estar.'}</p>
                  <p style={{ marginTop: '0.45rem' }}>
                    <strong>Salao:</strong> {selectedProfessional.salonName || 'Sobrancelhas Express'}
                  </p>
                </div>

                <div className="client-team-services">
                  <h4>Especialidades</h4>
                  <div className="client-team-service-list">
                    {professionalSpecialties.map((label) => (
                      <span key={label} className="client-team-service-chip">{label}</span>
                    ))}
                    {professionalSpecialties.length === 0 && (
                      <>
                        <span className="client-team-service-chip">Tratamento Facial</span>
                        <span className="client-team-service-chip">Tratamento corporal</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="client-team-portfolio">
                  <div className="client-team-portfolio-head">
                    <h4>Portfolio</h4>
                    {portfolioImages.length > 1 && (
                      <div className="client-team-portfolio-actions">
                        <button
                          type="button"
                          onClick={() =>
                            setPortfolioIndex((prev) => (prev - 1 + portfolioImages.length) % portfolioImages.length)
                          }
                          aria-label="Foto anterior"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => setPortfolioIndex((prev) => (prev + 1) % portfolioImages.length)}
                          aria-label="Proxima foto"
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </div>

                  {portfolioImages.length > 0 ? (
                    <div className="client-portfolio-carousel">
                      <div
                        className="client-portfolio-track"
                        style={{ transform: `translateX(-${portfolioIndex * 100}%)` }}
                      >
                        {portfolioImages.map((item) => (
                          <figure key={`${item.name}-${item.imageUrl}`} className="client-portfolio-slide">
                            <img src={item.imageUrl} alt={item.name} />
                            <figcaption>{item.name}</figcaption>
                          </figure>
                        ))}
                      </div>
                      <div className="client-portfolio-dots">
                        {portfolioImages.map((item, index) => (
                          <button
                            key={`${item.imageUrl}-${index}`}
                            type="button"
                            className={index === portfolioIndex ? 'active' : ''}
                            onClick={() => setPortfolioIndex(index)}
                            aria-label={`Ir para foto ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: 'var(--client-muted)' }}>
                      Portfolio em atualizacao. As fotos dos servicos da profissional aparecerao aqui.
                    </p>
                  )}
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

      <div className="client-section" id="localizacao">
        <h3>Localizacao</h3>
        <div className="client-location-units">
          <article id="localizacao-almada" className="client-location-unit client-location-unit-card">
            <h4>Sobrancelhas Express Almada</h4>
            <p className="client-location-address-line">
              <span aria-hidden="true">|</span>
              <a
                href={almadaMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="client-location-link"
              >
                Avenida da Fundacao 08 Loja7, 2805-180 Almada
              </a>
            </p>
            <p className="client-location-address-line">
              <span aria-hidden="true">|</span>
              <a href="tel:+351964045871" className="client-location-link">
                +351 964 045 871
              </a>
            </p>
            <div className="client-location-split">
              <div className="client-location-info">
                <h5>Horarios</h5>
                <div className="client-hours-list" aria-label="Horarios de funcionamento de Almada">
                  {weeklyHours.map(([day, hours]) => (
                    <div key={`almada-${day}`} className="client-hours-row">
                      <span>{day}</span>
                      <span>{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="client-location-map-wrap">
                <iframe
                  title="Mapa da unidade de Almada"
                  className="client-location-map"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=Avenida%20da%20Fundacao%2008%20Loja7%2C%202805-180%20Almada&output=embed"
                />
              </div>
            </div>
          </article>

          <article id="localizacao-cascais" className="client-location-unit client-location-unit-card">
            <h4>Sobrancelhas Express Cascais</h4>
            <p className="client-location-address-line">
              <span aria-hidden="true">|</span>
              <a
                href={cascaisMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="client-location-link"
              >
                R. do Mercado 51 loja 2, 2785-630 Sao Domingos de Rana
              </a>
            </p>
            <p className="client-location-address-line">
              <span aria-hidden="true">|</span>
              <a href="tel:+351938332778" className="client-location-link">
                +351 938 332 778
              </a>
            </p>
            <div className="client-location-split">
              <div className="client-location-map-wrap">
                <iframe
                  title="Mapa da unidade de Cascais"
                  className="client-location-map"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=R.%20do%20Mercado%2051%20loja%202%2C%202785-630%20Sao%20Domingos%20de%20Rana&output=embed"
                />
              </div>

              <div className="client-location-info">
                <h5>Horarios</h5>
                <div className="client-hours-list" aria-label="Horarios de funcionamento de Cascais">
                  {weeklyHours.map(([day, hours]) => (
                    <div key={`cascais-${day}`} className="client-hours-row">
                      <span>{day}</span>
                      <span>{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default ClientServicos



