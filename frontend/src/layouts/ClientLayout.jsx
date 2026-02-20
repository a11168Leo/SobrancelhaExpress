import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  FiChevronDown,
  FiFacebook,
  FiHome,
  FiInfo,
  FiInstagram,
  FiMapPin,
  FiPhone,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import api from '../api/api.js'
import '../css/client.css'
import logo from '../assets/Logo2.svg'

const heroImages = Object.values(
  import.meta.glob('../assets/interior/*.{jpg,jpeg,png,webp}', {
    eager: true,
    import: 'default',
  })
)

const salonUnits = [
  { name: 'Sobrancelhas Express Almada', phone: '+351 964 045 871' },
  { name: 'Sobrancelhas Express Cascais', phone: '+351 938 332 778' },
]

function ClientLayout() {
  const navigate = useNavigate()
  const [slideIndex, setSlideIndex] = useState(0)
  const [serviceCategories, setServiceCategories] = useState([])
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  useEffect(() => {
    document.body.classList.add('client-body')
    return () => document.body.classList.remove('client-body')
  }, [])

  useEffect(() => {
    if (heroImages.length <= 1) return
    const interval = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadCategories = async () => {
      const res = await api.get('/services')
      const categories = Array.from(
        new Set((res.data.services || []).map((item) => item.category).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, 'pt-BR'))
      setServiceCategories(categories)
    }
    loadCategories().catch(() => {})
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  const currentHero = useMemo(() => {
    if (heroImages.length === 0) return ''
    return heroImages[slideIndex] || heroImages[0]
  }, [slideIndex])

  const isOpen = useMemo(() => {
    const day = now.getDay()
    const hour = now.getHours()
    const minute = now.getMinutes()
    const isSunday = day === 0
    if (isSunday) return false
    if (hour < 9) return false
    if (hour > 19) return false
    if (hour === 19 && minute > 0) return false
    return true
  }, [now])

  return (
    <div className="client-shell">
      <header className="client-hero">
        <div className="client-hero-slides" aria-hidden="true">
          {heroImages.map((image, index) => (
            <div
              key={image}
              className={`client-hero-slide${index === slideIndex ? ' active' : ''}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          {heroImages.length === 0 && currentHero && (
            <div className="client-hero-slide active" style={{ backgroundImage: `url(${currentHero})` }} />
          )}
        </div>
        <div className="client-hero-overlay">
          <nav className="client-topnav">
            <button className="client-logo-btn" type="button" onClick={() => navigate('/cliente/servicos')}>
              <img src={logo} alt="Logo" className="client-logo" />
            </button>

            <div className="client-menu">
              <button type="button" className="client-menu-link" onClick={() => navigate('/cliente/servicos')}>
                <FiHome size={16} />
                Home
              </button>

              <div className="client-menu-dropdown">
                <button
                  type="button"
                  className="client-menu-link"
                  onClick={() => setIsServicesOpen((prev) => !prev)}
                >
                  Servicos
                  <FiChevronDown className={`client-chevron${isServicesOpen ? ' is-open' : ''}`} size={16} />
                </button>
                {isServicesOpen && (
                  <div className="client-dropdown-panel">
                    {serviceCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        className="client-dropdown-item"
                        onClick={() => {
                          setIsServicesOpen(false)
                          navigate(`/cliente/servicos?categoria=${encodeURIComponent(category)}`)
                        }}
                      >
                        {category}
                      </button>
                    ))}
                    {serviceCategories.length === 0 && (
                      <span className="client-dropdown-empty">Sem categorias no momento</span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="client-menu-link"
                onClick={() => navigate('/cliente/servicos#sobre')}
              >
                <FiInfo size={16} />
                Sobre nos
              </button>

              <div className="client-menu-dropdown">
                <button
                  type="button"
                  className="client-menu-link"
                  onClick={() => setIsLocationOpen((prev) => !prev)}
                >
                  <FiMapPin size={16} />
                  Localizacao
                  <FiChevronDown className={`client-chevron${isLocationOpen ? ' is-open' : ''}`} size={16} />
                </button>
                {isLocationOpen && (
                  <div className="client-dropdown-panel">
                    <button
                      type="button"
                      className="client-dropdown-item"
                      onClick={() => {
                        setIsLocationOpen(false)
                        navigate('/cliente/servicos#localizacao-almada')
                      }}
                    >
                      Almada
                    </button>
                    <button
                      type="button"
                      className="client-dropdown-item"
                      onClick={() => {
                        setIsLocationOpen(false)
                        navigate('/cliente/servicos#localizacao-cascais')
                      }}
                    >
                      Cascais
                    </button>
                  </div>
                )}
              </div>

              <div className="client-menu-dropdown">
                <button
                  type="button"
                  className="client-menu-link"
                  onClick={() => setIsContactOpen((prev) => !prev)}
                >
                  <FiPhone size={16} />
                  Contato
                  <FiChevronDown className={`client-chevron${isContactOpen ? ' is-open' : ''}`} size={16} />
                </button>
                {isContactOpen && (
                  <div className="client-dropdown-panel contact">
                    {salonUnits.map((unit) => (
                      <div key={unit.name} className="client-contact-item">
                        <strong>{unit.name}</strong>
                        <span>{unit.phone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              className="client-schedule-btn"
              type="button"
              onClick={() => {
                if (!token) {
                  navigate('/login')
                  return
                }
                navigate('/cliente/agendamentos')
              }}
            >
              Agendar Horario
            </button>
          </nav>

          <div className="client-salon-status">
            {isOpen ? 'Aberto' : 'Fechado'}
          </div>
        </div>
      </header>

      <main className="client-main">
        <Outlet />
      </main>

      <footer className="client-footer">
        <div className="client-footer-socials" aria-label="Redes sociais do salao">
          <a
            className="social-instagram"
            href="https://www.instagram.com/sobrancelhasexpress/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram do salao"
          >
            <FiInstagram size={20} />
          </a>
          <a
            className="social-facebook"
            href="https://www.facebook.com/SobrancelhasExpresspt/?locale=pt_PT"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook do salao"
          >
            <FiFacebook size={20} />
          </a>
          <a
            className="social-whatsapp"
            href="https://wa.me/351938332778"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp do salao"
          >
            <FaWhatsapp size={20} />
          </a>
        </div>
        <p>Sobrancelhas Express</p>
        <span>Atendimento de segunda a sabado | WhatsApp: +351 938 332 778</span>
      </footer>
    </div>
  )
}

export default ClientLayout
