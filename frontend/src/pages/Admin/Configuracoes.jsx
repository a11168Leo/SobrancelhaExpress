/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/PAGES/CONFIGURACOES.JSX */
/* ======================================== */

// Importacoes
import { useEffect, useState } from 'react'
import '../../styles/pages/Profissional/Configuracoes.css'
import { fetchJson } from '../../services/api'

function getShortcode(url) {
  const m = String(url).match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)
  return m ? m[1] : null
}

// Funcao: Configuracoes
function Configuracoes({ darkMode, setDarkMode }) {
  const [igPosts, setIgPosts] = useState([])
  const [igInput, setIgInput] = useState('')
  const [igSaving, setIgSaving] = useState(false)
  const [igMsg, setIgMsg] = useState('')

  useEffect(() => {
    fetchJson('/settings/instagram-posts')
      .then(res => setIgPosts(res.posts || []))
      .catch(() => {})
  }, [])

  const addPost = () => {
    const url = igInput.trim()
    if (!url) return
    if (!getShortcode(url)) {
      setIgMsg('URL inválido. Use um link de post do Instagram (ex: https://www.instagram.com/p/XXXXX/).')
      return
    }
    if (igPosts.includes(url)) {
      setIgMsg('Este post já está na lista.')
      return
    }
    setIgPosts(prev => [...prev, url])
    setIgInput('')
    setIgMsg('')
  }

  const removePost = (url) => {
    setIgPosts(prev => prev.filter(p => p !== url))
  }

  const savePosts = async () => {
    setIgSaving(true)
    setIgMsg('')
    try {
      await fetchJson('/settings/instagram-posts', {
        method: 'PUT',
        body: JSON.stringify({ posts: igPosts }),
      })
      setIgMsg('Guardado com sucesso!')
    } catch {
      setIgMsg('Erro ao guardar. Tente novamente.')
    } finally {
      setIgSaving(false)
    }
  }

  // Manipuladores de eventos
  const handleThemeChange = () => {
    setDarkMode((prev) => !prev)
  }

  // Renderizacao principal
  return (
    <section className="settings-page" aria-label="Configurações">
      <div className="settings-hero">
        <div>
          <span className="settings-eyebrow">Preferências do sistema</span>
          <h1>Configurações</h1>
          <p>
            Personalize a experiência do profissional e ajuste a aparência do painel
            de forma simples.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <article className="settings-card settings-card-highlight">
          <div className="settings-card-header">
            <div>
              <span className="settings-card-kicker">Aparência</span>
              <h2>Modo escuro</h2>
            </div>
            <span className={`settings-theme-badge ${darkMode ? 'is-dark' : 'is-light'}`}>
              {darkMode ? 'Ativo' : 'Desligado'}
            </span>
          </div>

          <p className="settings-card-description">
            Use a barra abaixo para alternar entre o visual claro e o visual escuro
            em todo o sistema.
          </p>

          <label className="theme-switch" htmlFor="dark-mode-toggle">
            <input
              id="dark-mode-toggle"
              type="checkbox"
              checked={darkMode}
              onChange={handleThemeChange}
            />
            <span className="theme-switch-track">
              <span className="theme-switch-thumb"></span>
            </span>
            <span className="theme-switch-copy">
              <strong>{darkMode ? 'Modo escuro ativado' : 'Modo claro ativado'}</strong>
              <small>
                {darkMode
                  ? 'Ideal para ambientes com pouca luz e uso noturno.'
                  : 'Visual leve para uso diário e espaços bem iluminados.'}
              </small>
            </span>
          </label>
        </article>

        <article className="settings-card">
          <div className="settings-card-header">
            <div>
              <span className="settings-card-kicker">Organização</span>
              <h2>Dicas rápidas</h2>
            </div>
          </div>

          <ul className="settings-list">
            <li>Abra o Calendário para acompanhar eventos e agendamentos em tempo real.</li>
            <li>Use "Gerir Equipa" para atualizar profissionais, serviços e locais de atendimento.</li>
            <li>O tema escolhido fica guardado automaticamente para a próxima visita.</li>
          </ul>
        </article>

        <article className="settings-card" style={{ gridColumn: '1 / -1' }}>
          <div className="settings-card-header">
            <div>
              <span className="settings-card-kicker">Galeria</span>
              <h2>Fotos do Instagram</h2>
            </div>
          </div>
          <p className="settings-card-description">
            Adicione links de posts públicos do Instagram para aparecerem na galeria do site do cliente.
            Cole o URL completo do post (ex: https://www.instagram.com/p/XXXXX/).
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="url"
              placeholder="https://www.instagram.com/p/..."
              value={igInput}
              onChange={e => setIgInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPost()}
              style={{
                flex: 1,
                height: '42px',
                border: '1px solid rgba(201,114,160,0.25)',
                borderRadius: '10px',
                padding: '0 12px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                background: 'var(--surface-secondary)',
              }}
            />
            <button
              type="button"
              onClick={addPost}
              style={{
                height: '42px',
                padding: '0 18px',
                border: 'none',
                borderRadius: '10px',
                background: 'linear-gradient(135deg,#ffa3b0,#c95184)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Adicionar
            </button>
          </div>

          {igPosts.length > 0 && (
            <ul style={{ display: 'grid', gap: '6px', margin: '0 0 12px', padding: 0, listStyle: 'none' }}>
              {igPosts.map((url, i) => {
                const sc = getShortcode(url)
                return (
                  <li
                    key={url}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'var(--surface-secondary)',
                      border: '1px solid rgba(201,114,160,0.12)',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#c95184" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sc ? `Post: ${sc}` : url}
                    </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: '#c95184', textDecoration: 'none', fontWeight: 600, flexShrink: 0 }}
                    >
                      Ver
                    </a>
                    <button
                      type="button"
                      onClick={() => removePost(url)}
                      style={{
                        border: 'none',
                        background: 'rgba(201,81,132,0.08)',
                        color: '#c95184',
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                      aria-label={`Remover post ${i + 1}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {igMsg && (
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: igMsg.includes('sucesso') ? '#2f7d55' : '#c0392b' }}>
              {igMsg}
            </p>
          )}

          <button
            type="button"
            onClick={savePosts}
            disabled={igSaving}
            style={{
              height: '42px',
              padding: '0 24px',
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg,#ffa3b0,#c95184)',
              color: '#fff',
              fontWeight: 700,
              cursor: igSaving ? 'default' : 'pointer',
              opacity: igSaving ? 0.7 : 1,
              fontSize: '14px',
            }}
          >
            {igSaving ? 'A guardar...' : 'Guardar lista'}
          </button>
        </article>
      </div>
    </section>
  )
}

// Exportacao principal
export default Configuracoes
