import { useEffect, useMemo, useState } from 'react'
import api from '../../api/api.js'

function ProfessionalConfiguracoes() {
  const [profileForm, setProfileForm] = useState({
    contactName: '',
    name: '',
    phone: '',
    email: '',
    about: '',
    salonName: '',
    specialties: [],
  })
  const [categories, setCategories] = useState([])
  const [settings, setSettings] = useState({
    startTime: '09:00',
    endTime: '19:00',
  })
  const [profileMessage, setProfileMessage] = useState('')
  const [scheduleMessage, setScheduleMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const [meRes, settingsRes, categoriesRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/settings/business-hours').catch(() => ({ data: { startTime: '09:00', endTime: '19:00' } })),
          api.get('/categories').catch(() => ({ data: { categories: [] } })),
        ])

        if (!mounted) return

        const user = meRes.data.user || {}
        const categoryNames = Array.from(
          new Set((categoriesRes.data.categories || []).map((item) => item.name).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b, 'pt-BR'))

        setCategories(categoryNames)
        setProfileForm({
          contactName: user.contactName || '',
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || '',
          about: user.about || '',
          salonName: user.salonName || '',
          specialties: Array.isArray(user.specialties) ? user.specialties : [],
        })
        setSettings({
          startTime: settingsRes.data.startTime || '09:00',
          endTime: settingsRes.data.endTime || '19:00',
        })
        setLoading(false)
      } catch {
        if (!mounted) return
        setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const selectedSpecialtiesCount = useMemo(
    () => profileForm.specialties.length,
    [profileForm.specialties]
  )

  const toggleSpecialty = (name) => {
    setProfileForm((prev) => {
      const exists = prev.specialties.includes(name)
      return {
        ...prev,
        specialties: exists
          ? prev.specialties.filter((item) => item !== name)
          : [...prev.specialties, name],
      }
    })
  }

  const saveProfile = async () => {
    setProfileMessage('')
    try {
      await api.patch('/auth/me', {
        contactName: profileForm.contactName,
        name: profileForm.name,
        phone: profileForm.phone,
        about: profileForm.about,
        salonName: profileForm.salonName,
        specialties: profileForm.specialties,
      })
      setProfileMessage('Configuracoes pessoais salvas com sucesso.')
      window.setTimeout(() => setProfileMessage(''), 3000)
    } catch (error) {
      setProfileMessage(error.response?.data?.message || 'Nao foi possivel salvar as configuracoes pessoais.')
    }
  }

  const saveSchedule = async () => {
    setScheduleMessage('')
    if (!settings.startTime || !settings.endTime) {
      setScheduleMessage('Preencha horario inicial e final.')
      return
    }
    if (settings.startTime >= settings.endTime) {
      setScheduleMessage('O horario inicial deve ser menor que o horario final.')
      return
    }

    try {
      await api.put('/settings/business-hours', settings)
      setScheduleMessage('Agenda atualizada com sucesso.')
      window.setTimeout(() => setScheduleMessage(''), 3000)
    } catch (error) {
      setScheduleMessage(error.response?.data?.message || 'Nao foi possivel salvar os horarios.')
    }
  }

  return (
    <section className="page">
      <div>
        <h1>Configuracoes pessoais</h1>
        <p className="page-subtitle">
          Defina os dados exibidos para clientes, seu sobre mim e suas categorias de atuacao.
        </p>
      </div>

      {loading && (
        <div className="card">
          <p style={{ margin: 0 }}>Carregando configuracoes...</p>
        </div>
      )}

      {!loading && (
        <>
          <div className="card" style={{ display: 'grid', gap: '1rem' }}>
            <h3>Dados do perfil profissional</h3>

            <div className="professional-settings-grid">
              <input
                className="search"
                placeholder="Contato"
                value={profileForm.contactName}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, contactName: event.target.value }))}
              />

              <input
                className="search"
                placeholder="Razao social (nome da pessoa)"
                value={profileForm.name}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
              />

              <input
                className="search"
                placeholder="Numero de celular"
                value={profileForm.phone}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
              />

              <input
                className="search"
                placeholder="Endereco de email"
                value={profileForm.email}
                readOnly
              />

              <input
                className="search full"
                placeholder="Salao que atende"
                value={profileForm.salonName}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, salonName: event.target.value }))}
              />

              <textarea
                className="search full"
                placeholder="Sobre mim (aparece na pagina de clientes)"
                rows={4}
                value={profileForm.about}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, about: event.target.value }))}
              />
            </div>

            <div style={{ display: 'grid', gap: '0.55rem' }}>
              <strong style={{ fontSize: '0.92rem' }}>
                Categorias de especialidade ({selectedSpecialtiesCount} selecionadas)
              </strong>
              <div className="professional-specialties">
                {categories.map((category) => {
                  const active = profileForm.specialties.includes(category)
                  return (
                    <button
                      key={category}
                      type="button"
                      className={`professional-specialty-btn${active ? ' active' : ''}`}
                      onClick={() => toggleSpecialty(category)}
                    >
                      {category}
                    </button>
                  )
                })}
                {categories.length === 0 && (
                  <p style={{ margin: 0, color: 'var(--muted)' }}>
                    Nenhuma categoria cadastrada no sistema.
                  </p>
                )}
              </div>
            </div>

            <div className="professional-inline-actions">
              <button className="btn btn-profissional-configuracoes" type="button" onClick={saveProfile}>
                Salvar configuracoes pessoais
              </button>
            </div>

            {profileMessage && (
              <p style={{ margin: 0, color: profileMessage.includes('sucesso') ? '#5f9a8f' : '#b12a5b' }}>
                {profileMessage}
              </p>
            )}
          </div>

          <div className="card" style={{ display: 'grid', gap: '1rem' }}>
            <h3>Agenda</h3>
            <p className="page-subtitle">Defina o horario base de funcionamento.</p>

            <div className="professional-inline-actions">
              <input
                className="search"
                type="time"
                value={settings.startTime}
                onChange={(event) => setSettings((prev) => ({ ...prev, startTime: event.target.value }))}
              />
              <input
                className="search"
                type="time"
                value={settings.endTime}
                onChange={(event) => setSettings((prev) => ({ ...prev, endTime: event.target.value }))}
              />
              <button className="btn btn-profissional-configuracoes" type="button" onClick={saveSchedule}>
                Salvar agenda
              </button>
            </div>

            {scheduleMessage && (
              <p style={{ margin: 0, color: scheduleMessage.includes('sucesso') ? '#5f9a8f' : '#b12a5b' }}>
                {scheduleMessage}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default ProfessionalConfiguracoes
