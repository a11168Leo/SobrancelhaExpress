/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/APP.JSX */
/* ======================================== */

// Importacoes
import { useEffect, useState } from 'react'
import './styles/core/App.css'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import Dashboard from './pages/Admin/Dashboard'
import GerirEquipe from './pages/Admin/GerirEquipe'
import Clientes from './pages/Admin/Clientes'
import Calendario from './pages/Admin/Calendario'
import AdicionarProfissional from './pages/Admin/AdicionarProfissional'
import CatalogoServicos from './pages/Admin/CatalogoServicos'
import Configuracoes from './pages/Admin/Configuracoes'
import Perfil from './pages/Admin/Perfil'
import Relatorio from './pages/Admin/Relatorio'
import Financeiro from './pages/Admin/Financeiro'
import Login from './pages/Login/Login'
import ClientLayout from './layout/ClientLayout'

const defaultPageByRole = {
  admin: 'dashboard',
  profissional: 'dashboard',
  cliente: 'client-servicos',
}

// Funcao: App
function App() {

// Estado do componente
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [reloadProfessionals, setReloadProfessionals] = useState(0)
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null

    const savedUser = window.localStorage.getItem('sobrancelha-user')
    if (!savedUser) return null

    try {
      return JSON.parse(savedUser)
    } catch {
      return null
    }
  })
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem('sobrancelha-theme') === 'dark'
  })

// Efeito: persistencia do tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    window.localStorage.setItem('sobrancelha-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    if (user && user.role === 'cliente' && currentPage === 'dashboard') {
      setCurrentPage(defaultPageByRole[user.role])
    }
  }, [user, currentPage])

  useEffect(() => {
    if (!user && currentPage === 'dashboard') {
      setCurrentPage('client-servicos')
    }
  }, [user, currentPage])

  const navigate = (page, options = {}) => {
    if (page === 'gerir-equipe' && options.refresh) {
      setReloadProfessionals((prev) => prev + 1)
    }
    setCurrentPage(page)
  }

  const handleLoginSuccess = (newUser, token) => {
    setUser(newUser)
    setCurrentPage(defaultPageByRole[newUser.role] || 'dashboard')

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sobrancelha-user', JSON.stringify(newUser))
      window.localStorage.setItem('sobrancelha-token', token)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentPage('client-servicos')

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('sobrancelha-user')
      window.localStorage.removeItem('sobrancelha-token')
    }
  }

// Renderizadores auxiliares
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />
      case 'agenda':
        return <Calendario onNavigate={navigate} user={user} />
      case 'cliente':
        return user?.role === 'admin' ? <Clientes onNavigate={navigate} /> : null
      case 'gerir-equipe':
        return user?.role === 'admin' ? <GerirEquipe onNavigate={navigate} reloadKey={reloadProfessionals} /> : null
      case 'adicionar-profissional':
        return user?.role === 'admin' ? <AdicionarProfissional onNavigate={navigate} /> : null
      case 'catalogo-servicos':
        return <CatalogoServicos onNavigate={navigate} user={user} />
      case 'config':
        return <Configuracoes darkMode={darkMode} setDarkMode={setDarkMode} />
      case 'perfil':
        return <Perfil user={user} />
      case 'financeiro':
        return user?.role === 'admin' ? <Financeiro user={user} /> : null
      case 'relatorio':
        return <Relatorio onNavigate={navigate} user={user} />
      default:
        return <Dashboard onNavigate={navigate} />
    }
  }

// Renderizacao principal
  if (!user && currentPage === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  if (!user) {
    return (
      <ClientLayout
        currentPage={currentPage}
        onNavigate={navigate}
        onLogout={handleLogout}
        user={null}
      />
    )
  }

  if (user.role === 'cliente') {
    return (
      <ClientLayout
        currentPage={currentPage}
        onNavigate={navigate}
        onLogout={handleLogout}
        user={user}
      />
    )
  }

  return (
    <div className="app">
      <Header onNavigate={navigate} user={user} onLogout={handleLogout} />
      <div className="layout">
        <Sidebar onNavigate={navigate} currentPage={currentPage} user={user} />
        <main className="page">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

// Exportacao principal
export default App
