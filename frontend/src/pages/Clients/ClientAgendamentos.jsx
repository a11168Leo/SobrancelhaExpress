import { useEffect, useMemo, useState } from 'react'
import { fetchJson } from '../../services/api'
import '../../styles/pages/Clients/ClientAgendamentos.css'

const MONTH_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const WEEKDAY     = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

function statusLabel(s) {
  if (s === 'completed') return 'Finalizado'
  if (s === 'cancelled') return 'Cancelado'
  return 'Agendado'
}

function statusMod(s) {
  if (s === 'completed') return 'ca-badge--done'
  if (s === 'cancelled') return 'ca-badge--cancel'
  return 'ca-badge--scheduled'
}

function pad(n) { return String(n).padStart(2,'0') }

/* ── Star picker ─────────────────────────────────────────────── */
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  return (
    <div className="ca-star-picker" role="group" aria-label="Selecione a nota">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          className={`ca-star-btn${n <= active ? ' ca-star-btn--on' : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
        >
          <svg width="28" height="28" viewBox="0 0 24 24"
            fill={n <= active ? '#c95184' : 'none'}
            stroke={n <= active ? '#c95184' : '#d4b8c8'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  )
}

/* ── Review Modal ────────────────────────────────────────────── */
function ReviewModal({ appt, onClose, onDone }) {
  const [rating, setRating]   = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const submit = async () => {
    if (!rating) { setError('Selecione uma nota antes de enviar.'); return }
    setLoading(true)
    setError('')
    try {
      await fetchJson('/reviews', {
        method: 'POST',
        body: JSON.stringify({ appointmentId: appt._id, rating, comment }),
      })
      onDone(appt._id)
    } catch (e) {
      setError(e?.message || 'Erro ao enviar avaliação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ca-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ca-modal">
        <button className="ca-modal-close" onClick={onClose} aria-label="Fechar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="ca-modal-header">
          <div className="ca-modal-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <h3 className="ca-modal-title">Avaliar visita</h3>
            <p className="ca-modal-sub">{appt.service?.name || 'Serviço'} · {appt.professional?.name || 'Profissional'}</p>
          </div>
        </div>

        <div className="ca-modal-body">
          <label className="ca-modal-label">Como foi a sua experiência?</label>
          <StarPicker value={rating} onChange={setRating} />

          <label className="ca-modal-label" style={{ marginTop: 16 }}>Comentário <span style={{ fontWeight: 400, color: '#b09aab' }}>(opcional)</span></label>
          <textarea
            className="ca-modal-textarea"
            rows={4}
            maxLength={500}
            placeholder="Partilhe a sua experiência..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <span className="ca-modal-char">{comment.length}/500</span>

          {error && <p className="ca-modal-error">{error}</p>}
        </div>

        <div className="ca-modal-footer">
          <button className="ca-modal-cancel" onClick={onClose}>Cancelar</button>
          <button className="ca-modal-submit" onClick={submit} disabled={loading || !rating}>
            {loading ? 'A enviar...' : 'Enviar avaliação'}
          </button>
        </div>

        <div className="ca-modal-reward">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
          A sua avaliação vale <strong>+10 pontos</strong> de fidelidade!
        </div>
      </div>
    </div>
  )
}

/* ── Appointment Card ────────────────────────────────────────── */
function ApptCard({ item, reviewed, onReview }) {
  const d = new Date(item.startTime)
  const isPast = d < new Date()
  const status = item.status || 'scheduled'
  const canReview = status === 'completed' && !reviewed

  return (
    <article className={`ca-card${isPast && status === 'scheduled' ? ' ca-card--past' : ''}`}>
      {/* Data block */}
      <div className="ca-date-block">
        <span className="ca-date-day">{pad(d.getDate())}</span>
        <span className="ca-date-month">{MONTH_SHORT[d.getMonth()]}</span>
        <span className="ca-date-year">{d.getFullYear()}</span>
      </div>

      {/* Main info */}
      <div className="ca-info">
        <p className="ca-weekday">{WEEKDAY[d.getDay()]}</p>
        <h3 className="ca-service">{item.service?.name || 'Serviço'}</h3>
        <div className="ca-meta">
          <span className="ca-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {pad(d.getHours())}:{pad(d.getMinutes())}
          </span>
          <span className="ca-meta-sep">·</span>
          <span className="ca-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {item.professional?.name || 'Profissional'}
          </span>
          {item.unit && (
            <>
              <span className="ca-meta-sep">·</span>
              <span className="ca-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {item.unit.charAt(0).toUpperCase() + item.unit.slice(1)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="ca-right">
        <span className={`ca-badge ${statusMod(status)}`}>{statusLabel(status)}</span>
        {reviewed && (
          <span className="ca-reviewed-chip">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Avaliado
          </span>
        )}
        {canReview && (
          <button className="ca-review-btn" onClick={() => onReview(item)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Avaliar
          </button>
        )}
      </div>
    </article>
  )
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function ClientAgendamentos() {
  const [appointments, setAppointments] = useState([])
  const [reviewedIds, setReviewedIds]   = useState(new Set())
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch]             = useState('')
  const [loading, setLoading]           = useState(true)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [successMsg, setSuccessMsg]     = useState('')

  useEffect(() => {
    const load = async () => {
      const me = await fetchJson('/auth/me')
      const id = me?.user?._id || me?.user?.id
      if (!id) return
      const [apptRes, reviewRes] = await Promise.all([
        fetchJson(`/appointments/client/${id}`),
        fetchJson('/reviews/mine').catch(() => null),
      ])
      setAppointments(apptRes?.appointments || [])
      setReviewedIds(new Set(reviewRes?.reviewedAppointmentIds || []))
    }
    load().catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleReviewDone = (apptId) => {
    setReviewedIds(prev => new Set([...prev, apptId]))
    setReviewTarget(null)
    setSuccessMsg('Obrigada! A sua avaliação foi registada e ganhou +10 pontos de fidelidade.')
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return appointments
      .filter(a => {
        if (statusFilter !== 'all' && a.status !== statusFilter) return false
        if (!term) return true
        return (
          (a.service?.name || '').toLowerCase().includes(term) ||
          (a.professional?.name || '').toLowerCase().includes(term)
        )
      })
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  }, [appointments, statusFilter, search])

  const counts = useMemo(() => ({
    total:     appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled' || !a.status).length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }), [appointments])

  return (
    <section className="ca-page">
      {/* Header */}
      <div className="ca-header">
        <div>
          <h1 className="ca-title">Meus agendamentos</h1>
          <p className="ca-subtitle">Histórico e estado dos seus horários.</p>
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="ca-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
          {successMsg}
        </div>
      )}

      {/* Stats */}
      <div className="ca-stats">
        {[
          { key: 'all',       label: 'Total',      value: counts.total },
          { key: 'scheduled', label: 'Agendados',  value: counts.scheduled },
          { key: 'completed', label: 'Finalizados', value: counts.completed },
          { key: 'cancelled', label: 'Cancelados', value: counts.cancelled },
        ].map(({ key, label, value }) => (
          <button
            key={key}
            className={`ca-stat-pill${statusFilter === key ? ' ca-stat-pill--active' : ''}`}
            onClick={() => setStatusFilter(key)}
          >
            <strong>{value}</strong>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="ca-search-bar">
        <label className="ca-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            placeholder="Pesquisar por serviço ou profissional..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </label>
      </div>

      {/* List */}
      <div className="ca-list">
        {loading && (
          <div className="ca-empty">
            <div className="ca-spinner" />
            <p>A carregar agendamentos...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="ca-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e07db0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <p>Nenhum agendamento encontrado.</p>
            {statusFilter !== 'all' && (
              <button className="ca-clear-filter" onClick={() => { setStatusFilter('all'); setSearch('') }}>
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {!loading && filtered.map(item => (
          <ApptCard
            key={item._id}
            item={item}
            reviewed={reviewedIds.has(item._id)}
            onReview={setReviewTarget}
          />
        ))}
      </div>

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal
          appt={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onDone={handleReviewDone}
        />
      )}
    </section>
  )
}
