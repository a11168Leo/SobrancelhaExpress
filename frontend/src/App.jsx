/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/APP.JSX */
/* ======================================== */

// Importacoes
import { useEffect, useState } from 'react'
import './styles/core/App.css'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import Dashboard from './pages/Dashboard'
import GerirEquipe from './pages/GerirEquipe'
import Clientes from './pages/Clientes'
import Calendario from './pages/Calendario'
import AdicionarProfissional from './pages/AdicionarProfissional'
import CatalogoServicos from './pages/CatalogoServicos'
import Configuracoes from './pages/Configuracoes'

// Funcao: App
function App() {

// Estado do componente
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [reloadProfessionals, setReloadProfessionals] = useState(0)
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

  const navigate = (page, options = {}) => {
    if (page === 'gerir-equipe' && options.refresh) {
      setReloadProfessionals((prev) => prev + 1)
    }
    setCurrentPage(page)
  }

// Renderizadores auxiliares
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />
      case 'agenda':
        return <Calendario onNavigate={navigate} />
      case 'cliente':
        return <Clientes onNavigate={navigate} />
      case 'gerir-equipe':
        return <GerirEquipe onNavigate={navigate} reloadKey={reloadProfessionals} />
      case 'adicionar-profissional':
        return <AdicionarProfissional onNavigate={navigate} />
      case 'catalogo-servicos':
        return <CatalogoServicos onNavigate={navigate} />
      case 'config':
        return <Configuracoes darkMode={darkMode} setDarkMode={setDarkMode} />
      default:
        return <Dashboard onNavigate={navigate} />
    }
  }

// Renderizacao principal
  return (
    <div className="app">
      <Header onNavigate={navigate} />
      <div className="layout">
        <Sidebar onNavigate={navigate} currentPage={currentPage} />
        <main className="page">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

// Exportacao principal
export default App
