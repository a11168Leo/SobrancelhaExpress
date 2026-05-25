import { useEffect, useMemo, useState } from 'react'
import logo from '../assets/logo/logo.svg'
import '../styles/pages/Clients/client.css'
import ClientDashboard from '../pages/Clients/ClientDashboard'
import ClientAgendamentos from '../pages/Clients/ClientAgendamentos'
import ClientServicos from '../pages/Clients/ClientServicos'
import ClientNotificacoes from '../pages/Clients/ClientNotificacoes'
import ClientPerfil from '../pages/Clients/ClientPerfil'
import ClientConfiguracoes from '../pages/Clients/ClientConfiguracoes'
import AgendamentoCliente from '../pages/Clients/AgendamentoCliente'
import ClientGaleria from '../pages/Clients/ClientGaleria'

const cascaisMapsLink = 'https://www.google.com/maps/search/?api=1&query=R.%20do%20Mercado%2051%20loja%202%2C%202785-630%20Sao%20Domingos%20de%20Rana'
const almadaMapsLink = 'https://www.google.com/maps/search/?api=1&query=Avenida%20da%20Fundacao%2008%20Loja7%2C%202805-180%20Almada'

function NavArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/>
    </svg>
  )
}

const heroImages = [
  new URL('../assets/interior/IMG-20251106-WA0017(2).jpg', import.meta.url).href,
  new URL('../assets/interior/IMG-20251106-WA0019(2).jpg', import.meta.url).href,
  new URL('../assets/interior/IMG-20251106-WA0021(2).jpg', import.meta.url).href,
  new URL('../assets/interior/IMG-20251106-WA0023(2).jpg', import.meta.url).href,
  new URL('../assets/interior/IMG-20251106-WA0025(2).jpg', import.meta.url).href,
  new URL('../assets/interior/IMG-20251106-WA0027(2).jpg', import.meta.url).href,
  new URL('../assets/interior/IMG-20251106-WA0029(2).jpg', import.meta.url).href,
  new URL('../assets/interior/IMG-20251106-WA0031(2).jpg', import.meta.url).href,
  new URL('../assets/interior/IMG-20251106-WA0033(2).jpg', import.meta.url).href,
]

function HouseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a.5.5 0 0 0 .5-.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
    </svg>
  )
}

function GeoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
      <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
    </svg>
  )
}

function CaretDownIcon({ isOpen }) {
  return (
    <span className={`client-caret${isOpen ? ' is-open' : ''}`} aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M3.204 5h9.592L8 10.481zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659" />
      </svg>
    </span>
  )
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.087 3.269.222 2.76.42a5.1 5.1 0 0 0-1.84 1.2A5.1 5.1 0 0 0 .42 3.46c-.198.509-.333 1.09-.372 1.943C.01 6.256 0 6.529 0 8.7c0 2.171.01 2.444.048 3.297.039.853.174 1.434.372 1.943.214.55.5 1.016.9 1.416.4.4.866.686 1.416.9.509.198 1.09.333 1.943.372C5.556 15.99 5.829 16 8 16s2.444-.01 3.297-.048c.853-.039 1.434-.174 1.943-.372a5.1 5.1 0 0 0 1.416-.9c.4-.4.686-.866.9-1.416.198-.509.333-1.09.372-1.943C15.99 11.144 16 10.871 16 8.7c0-2.171-.01-2.444-.048-3.297-.039-.853-.174-1.434-.372-1.943a5.1 5.1 0 0 0-.9-1.416 5.1 5.1 0 0 0-1.416-.9c-.509-.198-1.09-.333-1.943-.372C10.444.01 10.171 0 8 0m0 1.441c2.134 0 2.387.008 3.232.046.781.036 1.205.166 1.486.275.372.145.638.318.917.597.279.279.452.545.597.917.109.281.239.705.275 1.486.038.845.046 1.098.046 3.232s-.008 2.387-.046 3.232c-.036.781-.166 1.205-.275 1.486a3.66 3.66 0 0 1-.597.917 3.66 3.66 0 0 1-.917.597c-.281.109-.705.239-1.486.275-.845.038-1.098.046-3.232.046s-2.387-.008-3.232-.046c-.781-.036-1.205-.166-1.486-.275a3.66 3.66 0 0 1-.917-.597 3.66 3.66 0 0 1-.597-.917c-.109-.281-.239-.705-.275-1.486C1.449 10.387 1.441 10.134 1.441 8s.008-2.387.046-3.232c.036-.781.166-1.205.275-1.486.145-.372.318-.638.597-.917.279-.279.545-.452.917-.597.281-.109.705-.239 1.486-.275C5.613 1.449 5.866 1.441 8 1.441" />
      <path d="M8 3.892A4.108 4.108 0 1 0 8 12.108 4.108 4.108 0 0 0 8 3.892m0 6.775A2.667 2.667 0 1 1 8 5.333a2.667 2.667 0 0 1 0 5.334m4.271-6.938a.96.96 0 1 1-1.92 0 .96.96 0 0 1 1.92 0" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M16 8.049C16 3.604 12.418 0 8 0S0 3.604 0 8.049C0 12.067 2.925 15.397 6.75 16v-5.625H4.719V8.049H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.792.157 1.792.157V5.28h-1.01c-.995 0-1.304.621-1.304 1.258v1.51h2.218l-.354 2.326H9.25V16C13.075 15.397 16 12.067 16 8.049" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M13.601 2.326A7.85 7.85 0 0 0 8.002 0a7.94 7.94 0 0 0-6.88 11.9L0 16l4.216-1.102a7.94 7.94 0 0 0 3.786.965h.003a7.94 7.94 0 0 0 5.596-13.537M8.005 14.54a6.62 6.62 0 0 1-3.372-.922l-.242-.144-2.503.654.667-2.44-.157-.25a6.62 6.62 0 0 1 1.02-8.202 6.62 6.62 0 0 1 9.38 0 6.62 6.62 0 0 1-4.793 11.304m3.633-4.95c-.198-.099-1.17-.578-1.351-.644-.181-.066-.313-.099-.446.099-.132.198-.512.644-.628.776-.115.132-.231.149-.429.05-.198-.099-.836-.308-1.593-.983-.589-.525-.987-1.174-1.103-1.372-.115-.198-.012-.305.087-.404.089-.088.198-.231.297-.347.099-.116.132-.198.198-.33.066-.132.033-.248-.017-.347-.05-.099-.446-1.074-.61-1.471-.16-.387-.323-.335-.446-.341l-.38-.007a.73.73 0 0 0-.529.248c-.182.198-.694.677-.694 1.653s.71 1.917.81 2.049c.099.132 1.394 2.13 3.378 2.987.472.204.84.326 1.127.417.474.151.906.13 1.247.079.38-.057 1.17-.479 1.335-.941.165-.462.165-.859.116-.941-.05-.083-.182-.132-.38-.231" />
    </svg>
  )
}

function ClientLayout({ currentPage, onNavigate, onLogout, user }) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const [bookingService, setBookingService] = useState(null)

  useEffect(() => {
    document.body.classList.add('client-body')

    return () => {
      document.body.classList.remove('client-body')
    }
  }, [])

  useEffect(() => {
    if (heroImages.length <= 1) return undefined

    const interval = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  const isOpen = useMemo(() => {
    const day = now.getDay()
    const hour = now.getHours()
    const minute = now.getMinutes()

    if (day === 0) return false
    if (hour < 9 || hour > 19) return false
    if (hour === 19 && minute > 0) return false

    return true
  }, [now])

  const handleBookService = (service) => {
    setBookingService(service)
    onNavigate('client-agendamento')
  }

  const renderPage = () => {
    if (!user) {
      return <ClientServicos onNavigate={onNavigate} isGuest />
    }

    switch (currentPage) {
      case 'client-dashboard':
        return <ClientDashboard />
      case 'client-agendamentos':
        return <ClientAgendamentos />
      case 'client-notificacoes':
        return <ClientNotificacoes />
      case 'client-perfil':
        return <ClientPerfil user={user} />
      case 'client-config':
        return <ClientConfiguracoes />
      case 'client-agendamento':
        return <AgendamentoCliente service={bookingService} onNavigate={onNavigate} user={user} />
      case 'client-galeria':
        return <ClientGaleria />
      case 'client-servicos':
      default:
        return <ClientServicos onNavigate={onNavigate} onBookService={handleBookService} />
    }
  }

  const goTo = (page) => {
    setIsServicesOpen(false)
    setIsContactOpen(false)
    onNavigate(page)
  }

  const closeMenus = () => {
    setIsServicesOpen(false)
    setIsContactOpen(false)
    setIsUserMenuOpen(false)
  }

  const scrollToTop = () => {
    closeMenus()
    onNavigate('client-servicos')
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  const scrollToSection = (sectionId) => {
    closeMenus()
    onNavigate('client-servicos')
    window.requestAnimationFrame(() => {
      const section = document.getElementById(sectionId)
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  const openLogin = () => {
    closeMenus()
    onNavigate('login')
  }

  return (
    <div className="client-shell">
      <header className="client-hero">
        <div className="client-hero-slides" aria-hidden="true">
          {heroImages.map((image, index) => (
            <div
              key={image}
              className={`client-hero-slide${index === slideIndex ? ' active' : ''}`}
              style={{ backgroundImage: `url("${image}")` }}
            />
          ))}
        </div>

        <div className="client-hero-overlay">
          <nav className="client-topnav">
            <button className="client-logo-btn" type="button" onClick={() => goTo('client-servicos')}>
              <img src={logo} alt="Sobrancelha Express" className="client-logo" />
            </button>

            <div className="client-menu">
              <button type="button" className="client-menu-link" onClick={scrollToTop}>
                <HouseIcon />
                <span>Home</span>
              </button>
              <button type="button" className="client-menu-link" onClick={() => scrollToSection('sobre')}>
                <PeopleIcon />
                <span>Sobre nós</span>
              </button>

              <button type="button" className="client-menu-link" onClick={() => goTo('client-galeria')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.923 1.013-.928 0-1.61.044-2.188.103a4.56 4.56 0 0 0-2.288.892A4.58 4.58 0 0 0 .16 7.856C.077 8.399 0 9.62 0 11c0 1.38.077 2.601.16 3.144a4.58 4.58 0 0 0 .977 2.195 4.56 4.56 0 0 0 2.288.892c.578.059 1.26.103 2.188.103h4.774c.928 0 1.61-.044 2.188-.103a4.56 4.56 0 0 0 2.288-.892 4.58 4.58 0 0 0 .977-2.195C15.923 13.601 16 12.38 16 11c0-1.38-.077-2.601-.16-3.144a4.58 4.58 0 0 0-.977-2.195 4.56 4.56 0 0 0-2.288-.892c-.578-.059-1.26-.103-2.188-.103h-.068c-.498 0-.734-.05-.813-.133-.08-.082-.199-.264-.199-.734 0-.97-.063-1.77-.164-2.37C9.3 1.156 9.864.46 8.864.046M7.777 3c0 .487.154.827.34 1.023.186.197.548.42.883.42h.184C10.1 4.443 10.78 4.4 11.395 4.4a3.56 3.56 0 0 1 1.803.694 3.58 3.58 0 0 1 .768 1.722C14.066 7.451 14.143 8.618 14.143 11c0 1.382-.077 2.55-.177 3.184a3.58 3.58 0 0 1-.768 1.722 3.56 3.56 0 0 1-1.803.694c-.578.059-1.26.1-2.188.1H5.793c-.928 0-1.61-.041-2.188-.1a3.56 3.56 0 0 1-1.803-.694 3.58 3.58 0 0 1-.768-1.722C.923 13.55.846 12.382.846 11c0-1.382.077-2.549.188-3.184a3.58 3.58 0 0 1 .768-1.722 3.56 3.56 0 0 1 1.803-.694C4.183 5.341 4.865 5.3 5.793 5.3h.087c.28 0 .53-.024.763-.124.464-.2.684-.582.684-1.051C7.327 3.755 7.492 3 7.777 3"/>
                  <path d="M6.5 11a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"/>
                </svg>
                <span>Galeria</span>
              </button>

              <div className="client-menu-dropdown">
                <button
                  type="button"
                  className="client-menu-link"
                  onClick={() => {
                    setIsServicesOpen((prev) => !prev)
                    setIsContactOpen(false)
                  }}
                >
                  <GeoIcon />
                  <span>Localização</span>
                  <CaretDownIcon isOpen={isServicesOpen} />
                </button>

                {isServicesOpen && (
                  <div className="client-dropdown-panel">
                    <button type="button" className="client-dropdown-item" onClick={() => scrollToSection('localizacao-cascais')}>
                      <GeoIcon />
                      <span>Cascais</span>
                    </button>
                    <button type="button" className="client-dropdown-item" onClick={() => scrollToSection('localizacao-almada')}>
                      <GeoIcon />
                      <span>Almada</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="client-menu-dropdown">
                <button
                  type="button"
                  className="client-menu-link"
                  onClick={() => {
                    setIsContactOpen((prev) => !prev)
                    setIsServicesOpen(false)
                  }}
                >
                  <PhoneIcon />
                  <span>Contato</span>
                  <CaretDownIcon isOpen={isContactOpen} />
                </button>

                {isContactOpen && (
                  <div className="client-dropdown-panel contact">
                    <a className="client-contact-item client-contact-link" href="tel:+351938332778">
                      <strong>Cascais</strong>
                      <span>938 332 778</span>
                    </a>
                    <a className="client-contact-item client-contact-link" href="tel:+351964045871">
                      <strong>Almada</strong>
                      <span>964 045 871</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="client-topnav-actions">
              {!user && (
                <button
                  className="client-schedule-btn"
                  type="button"
                  onClick={openLogin}
                >
                  Agendar horário
                </button>
              )}

              {user ? (
                <div className="client-user-chip">
                  <button
                    type="button"
                    className="client-user-chip-btn"
                    onClick={() => { setIsUserMenuOpen((p) => !p); setIsServicesOpen(false); setIsContactOpen(false) }}
                    aria-label="Menu do utilizador"
                  >
                    <span className="client-user-avatar">
                      {(user.name || user.email || 'U')[0].toUpperCase()}
                    </span>
                    <span className="client-user-chip-name">
                      {(user.name || user.email || '').split(' ')[0]}
                    </span>
                    <CaretDownIcon isOpen={isUserMenuOpen} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="client-user-dropdown">
                      <div className="client-user-dropdown-header">
                        <span className="client-user-dropdown-avatar">
                          {(user.name || user.email || 'U')[0].toUpperCase()}
                        </span>
                        <div>
                          <strong>{user.name || 'Utilizador'}</strong>
                          <small>{user.email}</small>
                        </div>
                      </div>
                      <div className="client-user-dropdown-divider" />
                      <button type="button" className="client-user-dropdown-item" onClick={() => { goTo('client-perfil'); setIsUserMenuOpen(false) }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                        Meu perfil
                      </button>
                      <button type="button" className="client-user-dropdown-item" onClick={() => { goTo('client-agendamentos'); setIsUserMenuOpen(false) }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Meus agendamentos
                      </button>
                      <div className="client-user-dropdown-divider" />
                      <button type="button" className="client-user-dropdown-item client-user-dropdown-item--logout" onClick={() => { setIsUserMenuOpen(false); onLogout() }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Botão mobile (mantém só para ecrãs muito pequenos) */}
            <button
              type="button"
              className="client-mobile-header-btn"
              onClick={() => (user ? goTo('client-perfil') : openLogin())}
              aria-label={user ? 'Ver perfil' : 'Entrar'}
            >
              {user ? (
                <span className="client-user-avatar client-user-avatar--sm">
                  {(user.name || user.email || 'U')[0].toUpperCase()}
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </nav>

          <div className={`client-salon-status${isOpen ? ' is-open' : ' is-closed'}`}>
            {isOpen ? 'Aberto' : 'Fechado'}
          </div>
        </div>
      </header>

      <nav className="client-mobile-subnav" aria-label="Navegação principal">
        <button type="button" className="client-bottom-nav-item" onClick={() => scrollToSection('sobre')}>
          <PeopleIcon />
          <span>Sobre</span>
        </button>

        <div className="client-mobile-subnav-item-wrap">
          <button
            type="button"
            className="client-bottom-nav-item"
            onClick={() => { setIsServicesOpen((p) => !p); setIsContactOpen(false) }}
          >
            <GeoIcon />
            <span className="client-subnav-label">
              Local
              <CaretDownIcon isOpen={isServicesOpen} />
            </span>
          </button>
          {isServicesOpen && (
            <div className="client-mobile-subnav-panel">
              <a
                className="client-mobile-subnav-option"
                href={cascaisMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenus}
              >
                <GeoIcon />
                <span>Cascais</span>
                <NavArrowIcon />
              </a>
              <a
                className="client-mobile-subnav-option"
                href={almadaMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenus}
              >
                <GeoIcon />
                <span>Almada</span>
                <NavArrowIcon />
              </a>
            </div>
          )}
        </div>

        <div className="client-mobile-subnav-item-wrap">
          <button
            type="button"
            className="client-bottom-nav-item"
            onClick={() => { setIsContactOpen((p) => !p); setIsServicesOpen(false) }}
          >
            <PhoneIcon />
            <span className="client-subnav-label">
              Contato
              <CaretDownIcon isOpen={isContactOpen} />
            </span>
          </button>
          {isContactOpen && (
            <div className="client-mobile-subnav-panel">
              <a className="client-mobile-subnav-option" href="tel:+351938332778" onClick={closeMenus}>
                <PhoneIcon />
                <span className="client-subnav-option-info">
                  <strong>Cascais</strong>
                  <small>938 332 778</small>
                </span>
              </a>
              <a className="client-mobile-subnav-option" href="tel:+351964045871" onClick={closeMenus}>
                <PhoneIcon />
                <span className="client-subnav-option-info">
                  <strong>Almada</strong>
                  <small>964 045 871</small>
                </span>
              </a>
            </div>
          )}
        </div>
      </nav>

      <main className="client-main">
        {renderPage()}
      </main>

      <footer className="client-footer">
        <p>Sobrancelhas Express</p>
        <span>Atendimento de segunda a sábado</span>
        <div className="client-footer-socials">
          <a
            href="https://www.facebook.com/SobrancelhasExpresspt/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-facebook"
            aria-label="Facebook da Sobrancelhas Express"
            title="Facebook"
          >
            <FacebookIcon />
          </a>
          <a
            href="https://www.instagram.com/sobrancelhasexpress/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-instagram"
            aria-label="Instagram da Sobrancelhas Express"
            title="Instagram"
          >
            <InstagramIcon />
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=351938332778"
            target="_blank"
            rel="noopener noreferrer"
            className="social-whatsapp"
            aria-label="WhatsApp da unidade Cascais"
            title="WhatsApp Cascais"
          >
            <WhatsAppIcon />
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=351964045871&text=Loja%20Almada%20"
            target="_blank"
            rel="noopener noreferrer"
            className="social-whatsapp"
            aria-label="WhatsApp da unidade Almada"
            title="WhatsApp Almada"
          >
            <WhatsAppIcon />
          </a>
        </div>
        <span>Facebook, Instagram, WhatsApp Cascais e WhatsApp Almada</span>
      </footer>
    </div>
  )
}

export default ClientLayout
