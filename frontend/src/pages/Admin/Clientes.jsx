/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/PAGES/CLIENTES.JSX */
/* ======================================== */

// Importacoes
import { useEffect, useMemo, useState } from 'react'
import '../../styles/pages/Profissional/Clientes.css'
import { fetchJson } from '../../services/api'

// Bloco: EMPTY_CLIENT_FORM
const EMPTY_CLIENT_FORM = {
  name: '',
  email: '',
  phone: '',
}

// Funcao: formatLastVisit
function formatLastVisit(value) {
  if (!value) return 'Nunca visitou'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Nao definido'

  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Funcao: Clientes
function Clientes() {

// Estado do componente
  const [clients, setClients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateClientModal, setShowCreateClientModal] = useState(false)
  const [clientForm, setClientForm] = useState(EMPTY_CLIENT_FORM)
  const [clientFormError, setClientFormError] = useState(null)
  const [creatingClient, setCreatingClient] = useState(false)
  const [createdClientCredentials, setCreatedClientCredentials] = useState(null)

// Efeito: carregamento inicial
  useEffect(() => {
    async function loadData() {
      try {
        const [clientsResponse, appointmentsResponse] = await Promise.all([
          fetchJson('/auth/clients'),
          fetchJson('/appointments/calendar'),
        ])

        const clientItems = Array.isArray(clientsResponse) ? clientsResponse : clientsResponse?.users || []
        const appointmentItems = Array.isArray(appointmentsResponse) ? appointmentsResponse : appointmentsResponse?.appointments || []

        setClients(clientItems)
        setAppointments(appointmentItems)
        setError(null)
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

// Renderizadores auxiliares
  const latestVisitMap = useMemo(() => {
    const map = new Map()
    const now = Date.now()

    appointments.forEach((appointment) => {
      const clientId = String(appointment?.client?._id || appointment?.client?.id || appointment?.client || '')
      const startTime = appointment?.startTime ? new Date(appointment.startTime) : null

      if (!clientId || !startTime || Number.isNaN(startTime.getTime())) {
        return
      }

      if (startTime.getTime() > now) {
        return
      }

      const currentLatest = map.get(clientId)
      if (!currentLatest || startTime.getTime() > currentLatest.getTime()) {
        map.set(clientId, startTime)
      }
    })

    return map
  }, [appointments])

  const filteredClients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    const items = clients.map((client, index) => {
      const id = String(client._id || client.id || index)
      return {
        id,
        name: client.name || 'Sem nome',
        email: client.email || 'Sem email',
        phone: client.phone || 'Sem telefone',
        lastVisit: latestVisitMap.get(id) || null,
      }
    })

    return items
      .filter((client) => {
        if (!normalizedSearch) return true

        return [client.name, client.email, client.phone]
          .some((value) => value.toLowerCase().includes(normalizedSearch))
      })
      .sort((first, second) => first.name.localeCompare(second.name, 'pt-PT', { sensitivity: 'base' }))
  }, [clients, latestVisitMap, searchTerm])

// Manipuladores de eventos
  const openCreateClientModal = () => {
    setClientForm(EMPTY_CLIENT_FORM)
    setClientFormError(null)
    setCreatedClientCredentials(null)
    setShowCreateClientModal(true)
  }

  const closeCreateClientModal = () => {
    setShowCreateClientModal(false)
    setCreatingClient(false)
    setClientFormError(null)
  }

  const updateClientField = (event) => {
    const { name, value } = event.target
    setClientForm((current) => ({ ...current, [name]: value }))
  }

  const createClient = async (event) => {
    event.preventDefault()

    if (!clientForm.name.trim() || !clientForm.email.trim()) {
      setClientFormError('Preencha nome e email do cliente.')
      return
    }

    setCreatingClient(true)
    setClientFormError(null)

    try {
      const response = await fetchJson('/auth/clients/temp', {
        method: 'POST',
        body: JSON.stringify({
          name: clientForm.name.trim(),
          email: clientForm.email.trim(),
          phone: clientForm.phone.trim(),
        }),
      })

      const createdUser = response?.user || response
      const temporaryPassword = response?.temporaryPassword || ''

      setClients((current) => [...current, createdUser])
      setCreatedClientCredentials({
        name: createdUser.name,
        email: createdUser.email,
        temporaryPassword,
        emailSent: Boolean(response?.emailSent),
      })
      setClientForm(EMPTY_CLIENT_FORM)
    } catch (submitError) {
      setClientFormError(submitError.message)
    } finally {
      setCreatingClient(false)
    }
  }

  if (loading) {
    return <section className="clients-page" aria-label="Clientes"><p>A carregar clientes...</p></section>
  }

  if (error) {
    return <section className="clients-page" aria-label="Clientes"><p>Erro ao carregar clientes: {error}</p></section>
  }

// Renderizacao principal
  return (
    <section className="clients-page" aria-label="Clientes">
      <div className="clients-heading">
        <div>
          <h1>Clientes</h1>
          <p>Consulte todos os clientes registados e acompanhe o ultimo atendimento.</p>
        </div>

        <button className="clients-add-button" type="button" onClick={openCreateClientModal}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
            <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5" />
          </svg>
          <span>Adicionar cliente</span>
        </button>
      </div>

      <div className="clients-toolbar-shell">
        <div className="clients-toolbar">
          <label className="clients-search" htmlFor="clients-search">
            <span className="clients-search-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
            </span>
            <input
              id="clients-search"
              type="search"
              placeholder="Pesquisar clientes"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="clients-list-divider" aria-hidden="true" />

      <div className="clients-table" role="table" aria-label="Tabela de clientes">
        <div className="clients-table-header" role="row">
          <div className="clients-table-cell" role="columnheader">Nome</div>
          <div className="clients-table-cell" role="columnheader">Contato</div>
          <div className="clients-table-cell" role="columnheader">Ultima visita</div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="clients-empty-state">
            <p>Nenhum cliente encontrado.</p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div key={client.id} className="clients-table-row" role="row">
              <span className="clients-table-cell">
                <div className="clients-name-block">
                  <strong>{client.name}</strong>
                </div>
              </span>
              <span className="clients-table-cell">
                <div className="clients-contact-block">
                  <span className="clients-email">{client.email}</span>
                  <span className="clients-phone">{client.phone}</span>
                </div>
              </span>
              <span className="clients-table-cell clients-last-visit">{formatLastVisit(client.lastVisit)}</span>
            </div>
          ))
        )}
      </div>

      {showCreateClientModal && (
        <div className="clients-modal-backdrop" onClick={closeCreateClientModal}>
          <div className="clients-modal" onClick={(event) => event.stopPropagation()}>
            <div className="clients-modal-header">
              <div>
                <h2>Novo cliente</h2>
                <p>Crie o acesso rapidamente e entregue a senha temporaria ao cliente.</p>
              </div>
              <button type="button" className="clients-modal-close" onClick={closeCreateClientModal} aria-label="Fechar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                </svg>
              </button>
            </div>

            <form className="clients-modal-form" onSubmit={createClient}>
              <label className="clients-modal-field">
                <span>Nome</span>
                <input type="text" name="name" value={clientForm.name} onChange={updateClientField} placeholder="Nome completo do cliente" />
              </label>

              <label className="clients-modal-field">
                <span>Email</span>
                <input type="email" name="email" value={clientForm.email} onChange={updateClientField} placeholder="email@cliente.com" />
              </label>

              <label className="clients-modal-field">
                <span>Telefone</span>
                <input type="tel" name="phone" value={clientForm.phone} onChange={updateClientField} placeholder="Contacto do cliente" />
              </label>

              {clientFormError && <p className="clients-modal-feedback is-error">{clientFormError}</p>}

              {createdClientCredentials && (
                <div className="clients-temp-password-card">
                  <span>Senha temporaria gerada</span>
                  <strong>{createdClientCredentials.temporaryPassword}</strong>
                  <p>
                    Cliente: {createdClientCredentials.name} - {createdClientCredentials.email}
                  </p>
                  <small>{createdClientCredentials.emailSent ? 'A senha temporaria foi enviada automaticamente por email.' : 'Email automatico nao configurado. Entregue esta senha manualmente ao cliente.'}</small>
                  <small>O cliente pode entrar com esta senha temporaria e depois alterar a senha na conta.</small>
                </div>
              )}

              <div className="clients-modal-actions">
                <button type="button" className="clients-secondary-button" onClick={closeCreateClientModal}>Fechar</button>
                <button type="submit" className="clients-primary-button" disabled={creatingClient}>
                  {creatingClient ? 'A criar...' : 'Criar cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

// Exportacao principal
export default Clientes
