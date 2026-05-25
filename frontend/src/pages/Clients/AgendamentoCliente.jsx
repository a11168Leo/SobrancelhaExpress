import { useEffect, useMemo, useState } from 'react'
import { fetchJson, getServiceUrl } from '../../services/api'
import '../../styles/pages/Clients/AgendamentoCliente.css'

const DAY_NAMES   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}
function pad(n) { return String(n).padStart(2, '0') }

export default function AgendamentoCliente({ service, onNavigate, user }) {
  const [professionals, setProfessionals] = useState([])
  const [appointments, setAppointments]   = useState([])
  const [loading, setLoading]             = useState(true)

  const [selectedUnit,         setSelectedUnit]         = useState('cascais')
  const [anyProfessional,      setAnyProfessional]      = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState(null)
  const [weekOffset,           setWeekOffset]           = useState(0)
  const [selectedDate,         setSelectedDate]         = useState(null)
  const [selectedSlot,         setSelectedSlot]         = useState(null)

  const [profDropdownOpen, setProfDropdownOpen] = useState(false)
  const [guestName,  setGuestName]  = useState(user?.name || '')
  const [guestPhone, setGuestPhone] = useState('')
  const [clientNote, setClientNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [profsRes, calRes] = await Promise.all([
          fetchJson('/auth/professionals'),
          fetchJson('/appointments/calendar'),
        ])
        setProfessionals(profsRes?.users || [])
        setAppointments(Array.isArray(calRes) ? calRes : calRes?.appointments || [])
      } catch { /* silent */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const weekDays = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0)
    const diff = today.getDay() === 0 ? -6 : 1 - today.getDay()
    const monday = new Date(today); monday.setDate(today.getDate() + diff + weekOffset * 7)
    return Array.from({ length: 6 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d })
  }, [weekOffset])

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])

  const timeSlots = useMemo(() => {
    const manha = [], tarde = []
    for (let h = 9; h < 19; h++) {
      const group = h < 12 ? manha : tarde
      group.push({ hour: h, minute: 0 })
      if (h < 18) group.push({ hour: h, minute: 30 })
    }
    return { manha, tarde }
  }, [])

  const activeProfessional = anyProfessional ? professionals[0] : selectedProfessional

  const isSlotOccupied = (slot) => {
    if (!selectedDate || !activeProfessional) return false
    const dur = service?.durationMinutes || service?.maxDurationMinutes || 60
    const slotStart = new Date(selectedDate); slotStart.setHours(slot.hour, slot.minute, 0, 0)
    const slotEnd = new Date(slotStart.getTime() + dur * 60000)
    return appointments.some((appt) => {
      const profId = String(appt.professional?._id || appt.professional?.id || appt.professional || '')
      const selId  = String(activeProfessional._id || activeProfessional.id || '')
      if (profId !== selId) return false
      const apptStart = new Date(appt.startTime)
      const apptEnd = appt.endTime ? new Date(appt.endTime) : new Date(apptStart.getTime() + (appt.durationMinutes || 60) * 60000)
      return slotStart < apptEnd && slotEnd > apptStart
    })
  }

  /* Bloqueia slots já passados (data de hoje) */
  const isSlotPast = (slot) => {
    if (!selectedDate) return false
    const now = new Date()
    if (!isSameDay(selectedDate, now)) return false
    const slotStart = new Date(selectedDate)
    slotStart.setHours(slot.hour, slot.minute, 0, 0)
    return slotStart <= now
  }

  const isToday = selectedDate ? isSameDay(selectedDate, new Date()) : false

  /* Calcula disponibilidade de um dia para o profissional activo */
  const getDayAvailability = (day, profId) => {
    if (!profId) return null
    const TOTAL = 19 // slots de 09:00 a 18:00 a cada 30 min
    const occupied = appointments.filter(a => {
      const pid = String(a.professional?._id || a.professional?.id || a.professional || '')
      return pid === String(profId) && isSameDay(new Date(a.startTime), day)
    }).length
    const ratio = Math.min(occupied / TOTAL, 1)
    if (ratio === 0)    return 'green'   // completamente livre
    if (ratio < 0.25)   return 'green'   // quase todo livre
    if (ratio < 0.75)   return 'orange'  // parcialmente ocupado
    return 'red'                          // quase cheio ou cheio
  }

  const handleSelectProfessional = (prof) => {
    setAnyProfessional(false)
    setSelectedProfessional(prof)
    setProfDropdownOpen(false)
    setSelectedDate(null); setSelectedSlot(null); setSubmitError(null)
  }

  const handleAnyProfessional = () => {
    setAnyProfessional(true)
    setSelectedProfessional(null)
    setProfDropdownOpen(false)
    setSelectedDate(null); setSelectedSlot(null); setSubmitError(null)
  }

  const handleSelectDate = (date) => { setSelectedDate(date); setSelectedSlot(null); setSubmitError(null) }
  const handleSelectSlot = (slot) => { setSelectedSlot(slot); setSubmitError(null) }

  const profChosen = anyProfessional || selectedProfessional

  const handleSubmit = async () => {
    if (!profChosen || !selectedDate || !selectedSlot) return
    if (!user && !guestName.trim()) { setSubmitError('Indique o seu nome para confirmar.'); return }
    setSubmitting(true); setSubmitError(null)
    const startTime = new Date(selectedDate); startTime.setHours(selectedSlot.hour, selectedSlot.minute, 0, 0)
    const dur = service?.durationMinutes || service?.maxDurationMinutes || 60
    const endTime = new Date(startTime.getTime() + dur * 60000)
    const profToBook = anyProfessional ? professionals[0] : selectedProfessional
    const endpoint = user ? '/appointments' : '/appointments/public'
    try {
      await fetchJson(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          professionalId: profToBook._id || profToBook.id,
          serviceId: service?._id || service?.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          durationMinutes: dur,
          unit: selectedUnit,
          notes: [
          `Agendado via site`,
          `Local: ${selectedUnit}`,
          `Profissional: ${anyProfessional ? 'qualquer' : profToBook.name}`,
          `Nome: ${guestName || user?.name || ''}`,
          guestPhone ? `Tel: ${guestPhone}` : null,
          clientNote.trim() ? `Aviso do cliente: ${clientNote.trim()}` : null,
        ].filter(Boolean).join(' · '),
        }),
      })
      setSubmitSuccess(true)
    } catch (err) { setSubmitError(err.message || 'Erro ao criar agendamento.') }
    finally { setSubmitting(false) }
  }

  /* ── SUCESSO ── */
  if (submitSuccess) {
    const profToShow = anyProfessional ? professionals[0] : selectedProfessional
    return (
      <div className="agendamento-page">
        <div className="agendamento-success">
          <div className="agendamento-success-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2>Agendamento confirmado!</h2>
          <p>
            <strong>{service?.name}</strong> com <strong>{profToShow?.name}</strong><br />
            {selectedDate && `${pad(selectedDate.getDate())} de ${MONTH_NAMES[selectedDate.getMonth()]}`}
            {selectedSlot && ` às ${pad(selectedSlot.hour)}:${pad(selectedSlot.minute)}`}
            {' · '}{selectedUnit === 'cascais' ? 'Cascais' : 'Almada'}
          </p>
          <p className="agendamento-success-sub">Receberá uma confirmação em breve. Até já!</p>
          <button type="button" className="agendamento-btn-primary" onClick={() => onNavigate('client-servicos')}>
            Voltar aos serviços
          </button>
        </div>
      </div>
    )
  }

  /* ── PROGRESSO DO SIDEBAR ── */
  const progress = [
    { done: !!profChosen,     label: profChosen ? (anyProfessional ? 'Qualquer profissional' : selectedProfessional?.name) : 'Profissional', icon: 'prof' },
    { done: !!selectedDate,   label: selectedDate ? `${pad(selectedDate.getDate())} ${MONTH_NAMES[selectedDate.getMonth()]}` : 'Data', icon: 'cal' },
    { done: !!selectedSlot,   label: selectedSlot ? `${pad(selectedSlot.hour)}:${pad(selectedSlot.minute)}` : 'Horário', icon: 'clock' },
  ]

  return (
    <div className="agendamento-page">

      {/* Botão voltar */}
      <button type="button" className="agendamento-back" onClick={() => onNavigate('client-servicos')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Voltar
      </button>

      <div className="agendamento-layout">

        {/* ── COLUNA PRINCIPAL ── */}
        <div className="agendamento-main">

          {/* Cabeçalho do serviço */}
          {service && (
            <div className="agendamento-service-card">
              <div className="agendamento-service-info">
                <h1>{service.name}</h1>
                {service.description && <p>{service.description}</p>}
              </div>
              <div className="agendamento-service-chips">
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {service.durationMinutes || 0} min
                </span>
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  {Number(service.price || 0).toFixed(2)} €
                </span>
              </div>
            </div>
          )}

          {loading ? (
            <p className="agendamento-loading">A carregar disponibilidade...</p>
          ) : (
            <>
              {/* PASSO 1 — Profissional (dropdown) */}
              <div className="agendamento-step">
                <div className="agendamento-step-label">
                  <span className="agendamento-step-number">1</span>
                  <h2>Escolha a profissional</h2>
                </div>

                <div className="agendamento-prof-dropdown">
                  {/* Trigger */}
                  <button
                    type="button"
                    className={`agendamento-prof-trigger${profDropdownOpen ? ' is-open' : ''}`}
                    onClick={() => setProfDropdownOpen(p => !p)}
                  >
                    {/* Avatar da selecionada */}
                    {anyProfessional ? (
                      <span className="agendamento-prof-trigger-avatar agendamento-prof-trigger-avatar--any">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                      </span>
                    ) : selectedProfessional?.avatar ? (
                      <img
                        src={selectedProfessional.avatar.startsWith('http') ? selectedProfessional.avatar : getServiceUrl(selectedProfessional.avatar)}
                        alt={selectedProfessional.name}
                        className="agendamento-prof-trigger-img"
                      />
                    ) : (
                      <span className="agendamento-prof-trigger-avatar">
                        {selectedProfessional ? (selectedProfessional.name || 'P')[0].toUpperCase() : '?'}
                      </span>
                    )}
                    <span className="agendamento-prof-trigger-name">
                      {anyProfessional ? 'Qualquer disponível' : selectedProfessional?.name || 'Selecione uma profissional'}
                    </span>
                    <svg className="agendamento-prof-trigger-caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {/* Menu */}
                  {profDropdownOpen && (
                    <div className="agendamento-prof-menu">
                      <button type="button" className={`agendamento-prof-option${anyProfessional ? ' is-selected' : ''}`} onClick={handleAnyProfessional}>
                        <span className="agendamento-prof-option-avatar agendamento-prof-option-avatar--any">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                          </svg>
                        </span>
                        <div className="agendamento-prof-option-info">
                          <span className="agendamento-prof-option-name">Qualquer disponível</span>
                          <span className="agendamento-prof-option-sub">Atribuímos a profissional livre</span>
                        </div>
                        {anyProfessional && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c95184" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>

                      <div className="agendamento-prof-menu-divider" />

                      {professionals.map((prof) => {
                        const profId = prof._id || prof.id
                        const isSelected = !anyProfessional && (selectedProfessional?._id || selectedProfessional?.id) === profId
                        return (
                          <button key={profId} type="button" className={`agendamento-prof-option${isSelected ? ' is-selected' : ''}`} onClick={() => handleSelectProfessional(prof)}>
                            {prof.avatar ? (
                              <img
                                src={prof.avatar.startsWith('http') ? prof.avatar : getServiceUrl(prof.avatar)}
                                alt={prof.name}
                                className="agendamento-prof-option-img"
                              />
                            ) : (
                              <span className="agendamento-prof-option-avatar">
                                {(prof.name || 'P')[0].toUpperCase()}
                              </span>
                            )}
                            <div className="agendamento-prof-option-info">
                              <span className="agendamento-prof-option-name">{prof.name}</span>
                            </div>
                            {isSelected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c95184" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* PASSO 2 — Data */}
              {profChosen && (
                <div className="agendamento-step">
                  <div className="agendamento-step-label">
                    <span className="agendamento-step-number">2</span>
                    <h2>Escolha o dia</h2>
                  </div>
                  <div className="agendamento-week-nav">
                    <button type="button" className="agendamento-week-arrow" onClick={() => { setWeekOffset(w => Math.max(0,w-1)); setSelectedDate(null); setSelectedSlot(null) }} disabled={weekOffset === 0} aria-label="Semana anterior">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div className="agendamento-week-days">
                      {weekDays.map((day) => {
                        const isPast     = day < today
                        const isSelected = selectedDate && isSameDay(day, selectedDate)
                        const isToday    = isSameDay(day, today)
                        const profId     = activeProfessional?._id || activeProfessional?.id
                        const avail      = !isPast ? getDayAvailability(day, profId) : null
                        return (
                          <button
                            key={day.toISOString()}
                            type="button"
                            className={`agendamento-day-btn${isSelected ? ' is-selected' : ''}${isToday && !isSelected ? ' is-today' : ''}${isPast ? ' is-past' : ''}`}
                            onClick={() => !isPast && handleSelectDate(day)}
                            disabled={isPast}
                          >
                            <span className="agendamento-day-name">{DAY_NAMES[day.getDay()]}</span>
                            <span className="agendamento-day-num">{pad(day.getDate())}</span>
                            <span className="agendamento-day-month">{MONTH_NAMES[day.getMonth()]}</span>
                            {avail && (
                              <span className={`agendamento-day-avail agendamento-day-avail--${avail}`} aria-hidden="true" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                    <button type="button" className="agendamento-week-arrow" onClick={() => { setWeekOffset(w => w+1); setSelectedDate(null); setSelectedSlot(null) }} aria-label="Próxima semana">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>

                  {/* Legenda de disponibilidade */}
                  <div className="agendamento-avail-legend">
                    <span className="agendamento-avail-legend-item">
                      <span className="agendamento-avail-legend-dot agendamento-avail-legend-dot--green" />
                      Bastante disponível
                    </span>
                    <span className="agendamento-avail-legend-item">
                      <span className="agendamento-avail-legend-dot agendamento-avail-legend-dot--orange" />
                      Pouca disponibilidade
                    </span>
                    <span className="agendamento-avail-legend-item">
                      <span className="agendamento-avail-legend-dot agendamento-avail-legend-dot--red" />
                      Sem disponibilidade
                    </span>
                  </div>
                </div>
              )}

              {/* PASSO 3 — Horário */}
              {selectedDate && (
                <div className="agendamento-step">
                  <div className="agendamento-step-label">
                    <span className="agendamento-step-number">3</span>
                    <h2>Escolha o horário</h2>
                  </div>
                  {isToday && (
                    <p className="agendamento-today-notice">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      Horários já passados estão bloqueados para hoje.
                    </p>
                  )}
                  {[{ label: 'Manhã', slots: timeSlots.manha }, { label: 'Tarde', slots: timeSlots.tarde }].map(({ label, slots }) => (
                    <div key={label} className="agendamento-slots-group">
                      <span className="agendamento-slots-group-label">{label}</span>
                      <div className="agendamento-slots-grid">
                        {slots.map((slot) => {
                          const occupied   = isSlotOccupied(slot)
                          const past       = isSlotPast(slot)
                          const blocked    = occupied || past
                          const isSelected = selectedSlot?.hour === slot.hour && selectedSlot?.minute === slot.minute
                          return (
                            <button
                              key={`${slot.hour}-${slot.minute}`}
                              type="button"
                              className={`agendamento-slot${isSelected ? ' is-selected' : ''}${occupied ? ' is-occupied' : ''}${past && !occupied ? ' is-past' : ''}`}
                              onClick={() => !blocked && handleSelectSlot(slot)}
                              disabled={blocked}
                              title={past && !occupied ? 'Horário já passou' : occupied ? 'Horário ocupado' : undefined}
                            >
                              {pad(slot.hour)}:{pad(slot.minute)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PASSO 4 — Dados de contacto (guests) */}
              {selectedSlot && !user && (
                <div className="agendamento-step">
                  <div className="agendamento-step-label">
                    <span className="agendamento-step-number">4</span>
                    <h2>Os seus dados</h2>
                  </div>
                  <div className="agendamento-contact-form">
                    <label className="agendamento-field">
                      <span>Nome completo *</span>
                      <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="O seu nome" autoComplete="name" />
                    </label>
                    <label className="agendamento-field">
                      <span>Telemóvel</span>
                      <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="+351 912 345 678" autoComplete="tel" />
                    </label>
                  </div>
                </div>
              )}

              {/* PASSO aviso — Nota para a profissional */}
              {selectedSlot && (
                <div className="agendamento-step agendamento-step--note">
                  <div className="agendamento-step-label">
                    <span className="agendamento-step-number agendamento-step-number--note">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </span>
                    <div>
                      <h2>Aviso para a profissional</h2>
                      <p className="agendamento-note-hint">Opcional — partilhe se vai atrasar, tem algum pedido especial ou outra informação importante.</p>
                    </div>
                  </div>
                  <div className="agendamento-note-wrap">
                    <textarea
                      className="agendamento-note-input"
                      rows={3}
                      maxLength={300}
                      placeholder="Ex: Vou chegar 10 minutos atrasada... Tenho alergia a determinado produto..."
                      value={clientNote}
                      onChange={e => setClientNote(e.target.value)}
                    />
                    <span className="agendamento-note-char">{clientNote.length}/300</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── SIDEBAR DE RESUMO ── */}
        <aside className="agendamento-sidebar">
          <div className="agendamento-sidebar-inner">

            <div className="agendamento-sidebar-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
              Resumo do agendamento
            </div>

            {/* Serviço */}
            <div className="agendamento-sidebar-service">
              <span className="agendamento-sidebar-service-name">{service?.name || 'Serviço'}</span>
              <div className="agendamento-sidebar-service-meta">
                <span className="agendamento-sidebar-chip">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {service?.durationMinutes || 0} min
                </span>
                <span className="agendamento-sidebar-chip agendamento-sidebar-chip--price">
                  {Number(service?.price || 0).toFixed(2)} €
                </span>
              </div>
            </div>

            <div className="agendamento-sidebar-divider" />

            {/* Localização */}
            <div className="agendamento-sidebar-section">
              <span className="agendamento-sidebar-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Local
              </span>
              <div className="agendamento-unit-pills">
                <button type="button" className={`agendamento-unit-pill${selectedUnit === 'cascais' ? ' is-active' : ''}`} onClick={() => setSelectedUnit('cascais')}>
                  Cascais
                </button>
                <button type="button" className={`agendamento-unit-pill${selectedUnit === 'almada' ? ' is-active' : ''}`} onClick={() => setSelectedUnit('almada')}>
                  Almada
                </button>
              </div>
            </div>

            {/* Progresso das selecções */}
            <div className="agendamento-sidebar-progress">
              {/* Profissional */}
              <div className={`agendamento-sidebar-row${profChosen ? ' is-done' : ''}`}>
                <div className="agendamento-sidebar-row-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </div>
                <div className="agendamento-sidebar-row-content">
                  <span className="agendamento-sidebar-row-key">Profissional</span>
                  <span className="agendamento-sidebar-row-val">
                    {anyProfessional ? 'Qualquer disponível' : selectedProfessional?.name || '—'}
                  </span>
                </div>
                {profChosen && <svg className="agendamento-sidebar-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>

              {/* Data */}
              <div className={`agendamento-sidebar-row${selectedDate ? ' is-done' : ''}`}>
                <div className="agendamento-sidebar-row-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div className="agendamento-sidebar-row-content">
                  <span className="agendamento-sidebar-row-key">Data</span>
                  <span className="agendamento-sidebar-row-val">
                    {selectedDate ? `${DAY_NAMES[selectedDate.getDay()]}, ${pad(selectedDate.getDate())} ${MONTH_NAMES[selectedDate.getMonth()]}` : '—'}
                  </span>
                </div>
                {selectedDate && <svg className="agendamento-sidebar-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>

              {/* Horário */}
              <div className={`agendamento-sidebar-row${selectedSlot ? ' is-done' : ''}`}>
                <div className="agendamento-sidebar-row-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className="agendamento-sidebar-row-content">
                  <span className="agendamento-sidebar-row-key">Horário</span>
                  <span className="agendamento-sidebar-row-val">
                    {selectedSlot ? `${pad(selectedSlot.hour)}:${pad(selectedSlot.minute)}` : '—'}
                  </span>
                </div>
                {selectedSlot && <svg className="agendamento-sidebar-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            </div>

            {/* Total */}
            <div className="agendamento-sidebar-total">
              <span>Total</span>
              <strong>{Number(service?.price || 0).toFixed(2)} €</strong>
            </div>

            {/* Erro */}
            {submitError && (
              <p className="agendamento-error">{submitError}</p>
            )}

            {/* Botão confirmar */}
            <button
              type="button"
              className="agendamento-btn-primary"
              onClick={handleSubmit}
              disabled={!profChosen || !selectedDate || !selectedSlot || submitting || (!user && !guestName.trim())}
            >
              {submitting ? 'A confirmar...' : 'Confirmar agendamento'}
            </button>

            {!user && (
              <p className="agendamento-login-hint">
                Já tem conta?{' '}
                <button type="button" className="agendamento-login-link" onClick={() => onNavigate('login')}>
                  Entre para agendar mais rápido
                </button>
              </p>
            )}

          </div>
        </aside>

      </div>
    </div>
  )
}
