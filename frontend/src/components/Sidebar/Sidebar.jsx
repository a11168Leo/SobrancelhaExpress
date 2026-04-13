/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/COMPONENTS/SIDEBAR/SIDEBAR.JSX */
/* ======================================== */

// Importacoes
import { useEffect, useState } from 'react'
import '../../styles/components/Sidebar.css'
import logo from '../../assets/logo/logo.svg'

// Funcao: Sidebar
function Sidebar({ onNavigate, currentPage, user }) {

// Estado do componente
  const [active, setActive] = useState(currentPage || 'dashboard')
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const role = user?.role || 'admin'
  const itemsTop = role === 'cliente' ? [{ key: 'agenda', label: 'Agenda' }] : [{ key: 'dashboard', label: 'Dashboard' }]
  const itemsUpper = role === 'admin'
    ? [
        { key: 'agenda', label: 'Agenda' },
        { key: 'cliente', label: 'Cliente' },
        { key: 'catalogo', label: 'Catálogo' },
      ]
    : role === 'profissional'
    ? [
        { key: 'agenda', label: 'Agenda' },
        { key: 'catalogo', label: 'Catálogo' },
      ]
    : [
        { key: 'agenda', label: 'Agenda' },
        { key: 'catalogo', label: 'Catálogo' },
      ]
  const itemsMiddle = role === 'admin'
    ? [
        { key: 'financeiro', label: 'Financeiro' },
        { key: 'relatorio', label: 'Relatório' },
        { key: 'equipe', label: 'Gerir Equipe' },
      ]
    : role === 'profissional'
    ? [{ key: 'equipe', label: 'Gerir Equipe' }]
    : []
  const itemsBottom = [
    { key: 'perfil', label: 'Perfil' },
    { key: 'config', label: 'Configurações' },
  ]
  const mobilePrimaryItems = role === 'admin'
    ? [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'agenda', label: 'Calendario' },
        { key: 'catalogo', label: 'Catalogo' },
        { key: 'relatorio', label: 'Relatorio' },
      ]
    : [
        { key: 'agenda', label: 'Calendario' },
        { key: 'catalogo', label: 'Catalogo' },
      ]

// Bloco: pageMap
  const pageMap = {
    dashboard: 'dashboard',
    agenda: 'agenda',
    cliente: 'cliente',
    catalogo: 'catalogo-servicos',
    financeiro: 'financeiro',
    relatorio: 'relatorio',
    equipe: 'gerir-equipe',
    perfil: 'perfil',
    config: 'config',
  }

// Bloco: activePageMap
  const activePageMap = {
    dashboard: 'dashboard',
    agenda: 'agenda',
    cliente: 'cliente',
    'catalogo-servicos': 'catalogo',
    financeiro: 'financeiro',
    relatorio: 'relatorio',
    'gerir-equipe': 'equipe',
    perfil: 'perfil',
    config: 'config',
  }

  useEffect(() => {
    setActive(activePageMap[currentPage] || 'dashboard')
  }, [currentPage])

// Manipuladores de eventos
  const handleItemClick = (key) => {
    setActive(key)
    setShowMobileMenu(false)
    if (onNavigate && pageMap[key]) {
      onNavigate(pageMap[key])
    }
  }

// Renderizadores auxiliares
  const renderIcon = (key, filled) => {
    if (key === 'dashboard') {
      return filled ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
        </svg>
      )
    }

    if (key === 'agenda') {
      return filled ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M9.5 7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5m3 0h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5M2 10.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z" />
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
        </svg>
      )
    }

    if (key === 'cliente') {

// Renderizacao principal
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
        </svg>
      )
    }

    if (key === 'catalogo') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
        </svg>
      )
    }

    if (key === 'financeiro') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M4 9.42h1.063C5.4 12.323 7.317 14 10.34 14c.622 0 1.167-.068 1.659-.185v-1.3c-.484.119-1.045.17-1.659.17-2.1 0-3.455-1.198-3.775-3.264h4.017v-.928H6.497v-.936q-.002-.165.008-.329h4.078v-.927H6.618c.388-1.898 1.719-2.985 3.723-2.985.614 0 1.175.05 1.659.177V2.194A6.6 6.6 0 0 0 10.341 2c-2.928 0-4.82 1.569-5.244 4.3H4v.928h1.01v1.265H4v.928z" />
        </svg>
      )
    }

    if (key === 'relatorio') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M0 0h1v15h15v1H0zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07"
          />
        </svg>
      )
    }

    if (key === 'equipe') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
        </svg>
      )
    }

    if (key === 'perfil') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
        </svg>
      )
    }

    if (key === 'config') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
        </svg>
      )
    }

    if (key === 'sair') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"
          />
          <path
            fillRule="evenodd"
            d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"
          />
        </svg>
      )
    }

    return null
  }

  const renderItem = (item) => {
    const isActive = active === item.key
    return (
      <button
        key={item.key}
        type="button"
        className={`side-item ${isActive ? 'active' : ''}`}
        onClick={() => handleItemClick(item.key)}
        aria-label={item.label}
      >
        <span className="side-icon">{renderIcon(item.key, isActive)}</span>
        <span className="side-tooltip">{item.label}</span>
      </button>
    )
  }

  const renderMobileItem = (item) => {
    const isActive = active === item.key
    return (
      <button
        key={item.key}
        type="button"
        className={`mobile-nav-item ${isActive ? 'active' : ''}`}
        onClick={() => handleItemClick(item.key)}
        aria-label={item.label}
      >
        <span className="mobile-nav-icon">{renderIcon(item.key, isActive)}</span>
        <span className="mobile-nav-label">{item.label}</span>
      </button>
    )
  }

  const mobileMenuItems = [
    { key: 'equipe', label: 'Gerir Equipe', description: 'Aceder a equipa e profissionais.' },
    { key: 'financeiro', label: 'Financeiro', description: 'Ver ganhos, entradas e saidas.' },
    { key: 'perfil', label: 'Perfil', description: 'Abrir os dados do profissional.' },
    { key: 'config', label: 'Configuracoes', description: 'Ajustar preferencias da conta.' },
  ]

  return (
    <>
      <aside className="sidebar" aria-label="Navegacao lateral">
        <div className="side-group">{itemsTop.map(renderItem)}</div>
        <div className="side-sep"></div>
        <div className="side-group">{itemsUpper.map(renderItem)}</div>
        <div className="side-sep"></div>
        <div className="side-group">{itemsMiddle.map(renderItem)}</div>
        <div className="side-sep"></div>
        <div className="side-group">{itemsBottom.map(renderItem)}</div>
        <div className="side-spacer"></div>
        <button type="button" className="side-item logout" aria-label="Sair">
          <span className="side-icon">{renderIcon('sair')}</span>
          <span className="side-tooltip">Sair</span>
        </button>
      </aside>

      <nav className="mobile-bottom-nav" aria-label="Navegacao principal mobile">
        <div className="mobile-bottom-nav-shell">
          <div className="mobile-bottom-nav-side mobile-bottom-nav-side-left">
            {mobilePrimaryItems.slice(0, 2).map(renderMobileItem)}
          </div>

          <button
            type="button"
            className="mobile-bottom-nav-logo"
            onClick={() => setShowMobileMenu(true)}
            aria-label="Abrir menu rapido do profissional"
          >
            <img src={logo} alt="Sobrancelha Express" />
          </button>

          <div className="mobile-bottom-nav-side mobile-bottom-nav-side-right">
            {mobilePrimaryItems.slice(2).map(renderMobileItem)}
          </div>
        </div>
      </nav>

      {showMobileMenu && (
        <>
          <button
            type="button"
            className="mobile-menu-backdrop"
            aria-label="Fechar menu rapido"
            onClick={() => setShowMobileMenu(false)}
          />

          <section className={`mobile-quick-sheet ${showMobileMenu ? 'is-open' : ''}`} aria-label="Opcoes do profissional">
            <div className="mobile-quick-sheet-handle" aria-hidden="true" />

            <div className="mobile-quick-sheet-header">
              <div className="mobile-quick-sheet-brand">
                <span className="mobile-quick-sheet-logo">
                  <img src={logo} alt="Sobrancelha Express" />
                </span>
                <div>
                  <strong>Menu profissional</strong>
                  <p>Escolha uma acao rapida para continuar.</p>
                </div>
              </div>

              <button
                type="button"
                className="mobile-quick-sheet-close"
                onClick={() => setShowMobileMenu(false)}
                aria-label="Fechar menu rapido"
              >
                x
              </button>
            </div>

            <div className="mobile-quick-sheet-grid">
              {mobileMenuItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`mobile-quick-sheet-item ${active === item.key ? 'active' : ''}`}
                  onClick={() => handleItemClick(item.key)}
                >
                  <span className="mobile-quick-sheet-item-icon">{renderIcon(item.key, active === item.key)}</span>
                  <span className="mobile-quick-sheet-item-text">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  )
}

// Exportacao principal
export default Sidebar
