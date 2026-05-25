import { useEffect, useMemo, useState } from 'react'
import { fetchJson } from '../../services/api'
import '../../styles/pages/Clients/ClientGaleria.css'

function getShortcode(url) {
  const m = String(url).match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)
  return m ? m[1] : null
}

function StarRow({ rating, size = 16 }) {
  return (
    <div className="cg-stars" aria-label={`${rating} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= rating ? '#c95184' : 'none'}
          stroke={n <= rating ? '#c95184' : '#d4b8c8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ review }) {
  const initial = (review.client?.name || 'C')[0].toUpperCase()
  const d = new Date(review.createdAt)
  const dateStr = d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="cg-review-card">
      <div className="cg-review-top">
        <div className="cg-review-avatar">{initial}</div>
        <div className="cg-review-meta">
          <strong className="cg-review-name">{review.client?.name || 'Cliente'}</strong>
          <span className="cg-review-date">{dateStr}</span>
        </div>
        <StarRow rating={review.rating} size={14} />
      </div>
      {review.comment && <p className="cg-review-comment">"{review.comment}"</p>}
      <div className="cg-review-footer">
        <span className="cg-review-prof">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          {review.professional?.name || 'Profissional'}
        </span>
        {review.unit && (
          <span className="cg-review-unit">{review.unit.charAt(0).toUpperCase() + review.unit.slice(1)}</span>
        )}
      </div>
    </div>
  )
}

export default function ClientGaleria() {
  const [reviews, setReviews] = useState([])
  const [igPosts, setIgPosts] = useState([])
  const [unitFilter, setUnitFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [reviewsRes, igRes] = await Promise.all([
        fetchJson('/reviews'),
        fetchJson('/settings/instagram-posts'),
      ])
      setReviews(reviewsRes?.reviews || [])
      setIgPosts(igRes?.posts || [])
    }
    load().catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (unitFilter === 'all') return reviews
    return reviews.filter(r => r.unit === unitFilter)
  }, [reviews, unitFilter])

  const avgRating = useMemo(() => {
    if (filtered.length === 0) return 0
    return filtered.reduce((acc, r) => acc + r.rating, 0) / filtered.length
  }, [filtered])

  const ratingBuckets = useMemo(() => {
    const b = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    for (const r of filtered) b[r.rating] = (b[r.rating] || 0) + 1
    return b
  }, [filtered])

  return (
    <section className="cg-page">
      {/* Hero */}
      <div className="cg-hero">
        <div className="cg-hero-blob" aria-hidden="true" />
        <div className="cg-hero-text">
          <p className="cg-hero-eyebrow">Sobrancelhas Express</p>
          <h1 className="cg-hero-title">O que dizem as nossas clientes</h1>
          <p className="cg-hero-sub">Avaliações reais de clientes verificadas, após visita ao salão.</p>
        </div>

        {/* Rating snapshot */}
        <div className="cg-rating-snapshot">
          <div className="cg-rating-big">
            <span className="cg-rating-number">{avgRating.toFixed(1)}</span>
            <StarRow rating={Math.round(avgRating)} size={20} />
            <span className="cg-rating-count">{filtered.length} {filtered.length === 1 ? 'avaliação' : 'avaliações'}</span>
          </div>
          <div className="cg-rating-bars">
            {[5, 4, 3, 2, 1].map(n => (
              <div key={n} className="cg-rating-bar-row">
                <span className="cg-rating-bar-label">{n}</span>
                <div className="cg-rating-bar-track">
                  <div
                    className="cg-rating-bar-fill"
                    style={{ width: filtered.length ? `${(ratingBuckets[n] / filtered.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className="cg-rating-bar-count">{ratingBuckets[n]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros de unidade */}
      <div className="cg-filters">
        {[['all', 'Todas as unidades'], ['cascais', 'Cascais'], ['almada', 'Almada']].map(([id, label]) => (
          <button
            key={id}
            className={`cg-filter-btn${unitFilter === id ? ' cg-filter-btn--active' : ''}`}
            onClick={() => setUnitFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid de avaliações */}
      {loading ? (
        <div className="cg-loading">
          <div className="cg-spinner" />
          <p>A carregar avaliações...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="cg-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e07db0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <p>Ainda não há avaliações para esta unidade.</p>
          <span>Seja a primeira a partilhar a sua experiência!</span>
        </div>
      ) : (
        <div className="cg-reviews-grid">
          {filtered.map(r => <ReviewCard key={r._id} review={r} />)}
        </div>
      )}

      {/* Galeria do Instagram */}
      {igPosts.length > 0 && (
        <div className="cg-gallery-section">
          <div className="cg-section-header">
            <h2 className="cg-section-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#c95184" style={{ verticalAlign: 'middle', marginRight: 8 }}>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Os nossos trabalhos
            </h2>
            <p className="cg-section-sub">Inspire-se com os nossos resultados partilhados no Instagram</p>
          </div>
          <div className="cg-ig-grid">
            {igPosts.map((url) => {
              const sc = getShortcode(url)
              if (!sc) return null
              return (
                <div key={sc} className="cg-ig-item">
                  <iframe
                    src={`https://www.instagram.com/p/${sc}/embed/`}
                    width="100%"
                    height="480"
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency
                    allow="encrypted-media"
                    title={`Post Instagram ${sc}`}
                    loading="lazy"
                    className="cg-ig-embed"
                  />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cg-ig-link"
                    aria-label="Ver post no Instagram"
                  >
                    Ver no Instagram
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
