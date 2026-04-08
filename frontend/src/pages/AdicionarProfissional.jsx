/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/PAGES/ADICIONARPROFISSIONAL.JSX */
/* ======================================== */

// Importacoes
import { useState } from 'react'
import '../styles/pages/AdicionarProfissional.css'
import { fetchJson } from '../services/api'

// Bloco: AdicionarProfissional
const AdicionarProfissional = ({ onNavigate }) => {

// Estado do componente
  const [activeTab, setActiveTab] = useState('perfil')
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    password: '',
    dataInicio: '',
    ano: '',
    servicos: [],
    locais: [],
    availability: {}
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(null)

// Manipuladores de eventos
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleServicoToggle = (servico) => {
    setFormData(prev => ({
      ...prev,
      servicos: prev.servicos.includes(servico)
        ? prev.servicos.filter(s => s !== servico)
        : [...prev.servicos, servico]
    }))
  }

  const handleLocalToggle = (local) => {
    setFormData(prev => ({
      ...prev,
      locais: prev.locais.includes(local)
        ? prev.locais.filter(l => l !== local)
        : [...prev.locais, local]
    }))
  }

  const handleAvailabilityToggle = (local, day) => {
    setFormData(prev => {
      const current = prev.availability[local] || []
      const newAvail = current.includes(day) ? current.filter(d => d !== day) : [...current, day]
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [local]: newAvail
        }
      }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    if (!formData.nome || !formData.sobrenome || !formData.email || !formData.password) {
      setSubmitError('Nome, sobrenome, email e senha são obrigatórios.')
      setSubmitting(false)
      return
    }

    try {
      const payload = {
        name: `${formData.nome} ${formData.sobrenome}`,
        email: formData.email,
        password: formData.password,
        phone: formData.telefone,
        salonName: formData.locais.join(', '),
        specialties: formData.servicos,
        about: `Início: ${formData.dataInicio || 'N/A'} ${formData.ano || ''}`,
        role: 'profissional',
        availability: formData.availability
      }

      await fetchJson('/auth/professionals', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      setSubmitSuccess('Profissional criado com sucesso!')
      onNavigate('gerir-equipe', { refresh: true })
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const categoriasServicos = {
    'Design de Sobrancelhas': ['Design Básico', 'Design Premium', 'Correção de Design'],
    'Laminação': ['Laminação Clássica', 'Laminação com Tintura', 'Laminação Premium'],
    'Micropigmentação': ['Micropigmentação de Sobrancelhas', 'Micropigmentação de Cílios'],
    'Tintura': ['Tintura de Sobrancelhas', 'Tintura de Cílios'],
    'Depilação': ['Depilação com Cera', 'Depilação com Fio']
  }

// Renderizadores auxiliares
  const renderPerfilTab = () => (
    <div className="tab-content">
      <div className="section-header">
        <h2>Perfil</h2>
        <p>Adicione o perfil pessoal do membro da equipe</p>
      </div>

      <div className="profile-picture-section">
        <div className="profile-picture">
          <svg className="person-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <button className="edit-picture-btn" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="form-section">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nome">Nome*</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="sobrenome">Sobrenome*</label>
            <input
              type="text"
              id="sobrenome"
              name="sobrenome"
              value={formData.sobrenome}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail*</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha*</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefone">Número de telefone</label>
          <div className="phone-input">
            <span className="phone-prefix">+351</span>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              placeholder="912 345 678"
            />
          </div>
        </div>
      </div>

      <div className="work-details-section">
        <h3>Detalhes do trabalho</h3>
        <p>Gerencie a data de início do membro da equipe</p>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dataInicio">Data de início</label>
            <input
              type="date"
              id="dataInicio"
              name="dataInicio"
              value={formData.dataInicio}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="ano">Ano</label>
            <input
              type="number"
              id="ano"
              name="ano"
              value={formData.ano}
              onChange={handleInputChange}
              min="2000"
              max="2030"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderServicosTab = () => (
    <div className="tab-content">
      <div className="section-header">
        <h2>Serviços</h2>
        <p>Escolha os serviços que este profissional oferece</p>
      </div>

      <div className="search-section">
        <div className="search-input">
          <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input type="text" placeholder="Pesquisar serviços..." />
        </div>
      </div>

      <div className="services-section">
        {Object.entries(categoriasServicos).map(([categoria, servicos]) => (
          <div key={categoria} className="service-category">
            <h4>{categoria}</h4>
            <div className="services-list">
              {servicos.map(servico => (
                <label key={servico} className="service-item">
                  <input
                    type="checkbox"
                    checked={formData.servicos.includes(servico)}
                    onChange={() => handleServicoToggle(servico)}
                  />
                  <span>{servico}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderLocaisTab = () => (
    <div className="tab-content">
      <div className="section-header">
        <h2>Trabalha em</h2>
        <p>Escolha as unidades onde este colaborador trabalha</p>
      </div>

      <div className="locations-section">
        <div className="location-item">
          <input
            type="checkbox"
            id="cascais"
            checked={formData.locais.includes('Cascais')}
            onChange={() => handleLocalToggle('Cascais')}
          />
          <div className="store-image">
            {/* Placeholder para foto da loja de Cascais */}
            <div className="store-placeholder">🏪</div>
          </div>
          <label htmlFor="cascais">
            <div className="location-info">
              <div className="location-content">
                <h4>Loja de Cascais</h4>
                <p>Unidade principal em Cascais</p>
              </div>
              <div className="availability-section">
                <h5>Disponibilidades</h5>
                <div className="days-list">
                  {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(day => (
                    <label key={day} className="day-item">
                      <input
                        type="checkbox"
                        checked={(formData.availability['Cascais'] || []).includes(day)}
                        onChange={() => handleAvailabilityToggle('Cascais', day)}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </label>
        </div>

        <div className="location-item">
          <input
            type="checkbox"
            id="almada"
            checked={formData.locais.includes('Almada')}
            onChange={() => handleLocalToggle('Almada')}
          />
          <div className="store-image">
            {/* Placeholder para foto da loja de Almada */}
            <div className="store-placeholder">🏪</div>
          </div>
          <label htmlFor="almada">
            <div className="location-info">
              <div className="location-content">
                <h4>Loja de Almada</h4>
                <p>Unidade secundária em Almada</p>
              </div>
              <div className="availability-section">
                <h5>Disponibilidades</h5>
                <div className="days-list">
                  {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(day => (
                    <label key={day} className="day-item">
                      <input
                        type="checkbox"
                        checked={(formData.availability['Almada'] || []).includes(day)}
                        onChange={() => handleAvailabilityToggle('Almada', day)}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  )

// Renderizacao principal
  return (
    <section className="add-professional-page">
      <div className="page-header">
        <button className="back-icon-button" onClick={() => onNavigate('gerir-equipe')}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <h1>Adicionar profissional</h1>
      </div>

      <div className="content-container">
        <nav className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            Perfil
          </button>
          <button
            className={`tab-button ${activeTab === 'servicos' ? 'active' : ''}`}
            onClick={() => setActiveTab('servicos')}
          >
            Serviços
          </button>
          <button
            className={`tab-button ${activeTab === 'locais' ? 'active' : ''}`}
            onClick={() => setActiveTab('locais')}
          >
            Locais
          </button>
        </nav>

        <div className="tab-content-container">
          {activeTab === 'perfil' && renderPerfilTab()}
          {activeTab === 'servicos' && renderServicosTab()}
          {activeTab === 'locais' && renderLocaisTab()}
        </div>
      </div>

      <div className="page-footer">
        {submitError && <p className="form-error">{submitError}</p>}
        {submitSuccess && <p className="form-success">{submitSuccess}</p>}
        <button className="add-button" type="button" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Salvando...' : 'Adicionar'}
        </button>
      </div>
    </section>
  )
}

// Exportacao principal
export default AdicionarProfissional
