/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/COMPONENTS/HEADER/HEADER.JSX */
/* ======================================== */

// Importacoes
import { useRef, useState } from 'react'
import '../../styles/components/Header.css'
import logo from '../../assets/logo/logo.svg'

// Funcao: Header
function Header({ onNavigate, user, onLogout }) {
  const userName = user?.name || 'Bem-vindo'
  const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''

// Estado do componente
  const [notifications, setNotifications] = useState(3)
  const [show, setShow] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const closeTimerRef = useRef(null)

// Manipuladores de eventos
  const togglePanel = () => setShow((prev) => !prev)
  const closePanel = () => setShow(false)
  const clearNotifications = () => setNotifications(0)
  const openNotifications = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    setShowNotifications(true)
  }

  const scheduleCloseNotifications = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)

    closeTimerRef.current = setTimeout(() => {
      setShowNotifications(false)
      closeTimerRef.current = null
    }, 220)
  }

  const openSettingsPage = () => {
    closePanel()
    if (onNavigate) {
      onNavigate('config')
    }
  }

// Renderizacao principal
  return (
    <>
      <header className="app-header">
        <div className="nav-inner">
          <div className="logo-area">
            <img className="logo-mark" src={logo} alt="Sobrancelha Express" />
            <span className="logo-text">Ola, {userName}</span>
          </div>

          <form className="search" role="search" aria-label="Pesquisar">
            <input
              type="search"
              name="q"
              placeholder="Pesquisar"
              aria-label="Pesquisar"
            />
          </form>

          <div className="actions" aria-label="Estatisticas e carteira">
            <button
              className="icon-button"
              type="button"
              aria-label="Estatisticas"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M0 0h1v15h15v1H0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5"
                />
              </svg>
            </button>

            <div
              className="notify-wrapper"
              onMouseEnter={openNotifications}
              onMouseLeave={scheduleCloseNotifications}
            >
              <button
                className="icon-button"
                type="button"
                aria-label="Notificacoes"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
                </svg>
                {notifications > 0 && (
                  <span
                    className="badge"
                    aria-label={`${notifications} notificacoes`}
                  >
                    {notifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <aside className="notify-panel" aria-label="Notificacoes">
                  <div className="notify-header">
                    <span>Notificacoes</span>
                    <button
                      className="notify-clear"
                      type="button"
                      onClick={clearNotifications}
                    >
                      Limpar todas
                    </button>
                  </div>
                  {notifications === 0 ? (
                    <p className="notify-empty">Sem notificacoes.</p>
                  ) : (
                    <ul className="notify-list">
                      <li>Voce tem uma nova mensagem.</li>
                      <li>Um novo agendamento foi criado.</li>
                      <li>Atualizacao do sistema disponivel.</li>
                    </ul>
                  )}
                </aside>
              )}
            </div>

            <button
              className="profile-button"
              type="button"
              aria-label="Perfil"
              onClick={togglePanel}
            >
              <span className="profile-circle">ME</span>
            </button>
          </div>
        </div>
      </header>

      {show && (
        <>
          <div className="panel-backdrop" onClick={closePanel}></div>
          <aside className="profile-panel" aria-label="Perfil">
            <div className="panel-header">
              <div className="panel-profile">
                <span className="profile-circle large">ME</span>
                <div>
                  <span className="panel-name">{userName}</span>
                  {userRole && <span className="panel-role">{userRole}</span>}
                </div>
              </div>
              <button className="panel-close" type="button" onClick={closePanel}>
                Fechar
              </button>
            </div>

            <div className="panel-menu">
              <button className="panel-menu-item" type="button">Meu perfil</button>
              <button className="panel-menu-item" type="button" onClick={openSettingsPage}>
                Configuracoes pessoais
              </button>
            </div>

            <div className="panel-divider"></div>

            <button className="panel-logout" type="button" aria-label="Sair" onClick={onLogout}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
                />
                <path
                  fillRule="evenodd"
                  d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
                />
              </svg>
              <span>Sair</span>
            </button>
          </aside>
        </>
      )}
    </>
  )
}

// Exportacao principal
export default Header
