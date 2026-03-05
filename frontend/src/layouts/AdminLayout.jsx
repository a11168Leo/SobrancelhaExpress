/*
====================
SEÇÃO INTERNA PADRÃO (AdminLayout)
====================
*/

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../css/admin.css';
import { useEffect, useState } from 'react';
import {
  FiBell,
  FiCalendar,
  FiDollarSign,
  FiGrid,
  FiLogOut,
  FiPlus,
  FiScissors,
  FiSettings,
  FiUser,
  FiUsers,
  FiBarChart2,
  FiMenu,
  FiSearch
} from 'react-icons/fi';
import { Offcanvas, Toast } from 'bootstrap';
import api, { API_BASE_URL } from '../api/api.js';
import logo from '../assets/Logo2.svg'; // Confirme se o caminho do logo está correto

/* --- Menus de Navegação --- */
const menuPrincipal = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: FiGrid },
  { label: 'Agendamentos', to: '/admin/agendamentos', icon: FiCalendar },
  { label: 'Clientes', to: '/admin/clientes', icon: FiUsers },
  { label: 'Serviços', to: '/admin/servicos', icon: FiScissors },
];

const menuGestao = [
  { label: 'Financeiro', to: '/admin/financeiro', icon: FiDollarSign },
  { label: 'Relatório', to: '/admin/relatorio', icon: FiBarChart2 },
  { label: 'Gerir equipe', to: '/admin/equipe', icon: FiUsers },
];

const menuConta = [
  { label: 'Perfil', to: '/admin/perfil', icon: FiUser },
  { label: 'Notificações', to: '/admin/notificacoes', icon: FiBell },
  { label: 'Configurações', to: '/admin/configuracoes', icon: FiSettings },
];

function AdminLayout() {
  /* --- Estados --- */
  const [adminName, setAdminName] = useState('Admin');
  const [notifications, setNotifications] = useState([]);
  const [adminAvatar, setAdminAvatar] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastData, setToastData] = useState({
    title: 'Notificações',
    time: 'Agora',
    message: 'Sem notificações.',
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  /* --- Efeitos (Carregar Dados Iniciais) --- */
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/auth/me');
        setAdminName(res.data.user?.name || 'Admin');
        setAdminAvatar(res.data.user?.avatar || '');
      } catch (error) {
        console.error("Erro ao carregar usuário", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await api.get('/notifications/me');
        setNotifications(res.data.notifications || []);
      } catch (error) {
        console.error("Erro ao carregar notificações", error);
      }
    };
    loadNotifications();
  }, []);

  /* --- Funções de Ação (Handlers) --- */
  
  // Função para lidar com a busca sem recarregar a página
  const handleSearch = (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    if (searchQuery.trim() === '') return;
    
    // Aqui você pode redirecionar para uma página de busca ou filtrar dados globais
    console.log("Buscando por:", searchQuery);
    // Exemplo: navigate(`/admin/busca?q=${searchQuery}`);
  };

  const showNotificationToast = () => {
    const latest = notifications[0];
    setToastData({
      title: latest?.title || 'Notificações',
      time: 'Agora',
      message: latest?.message || 'Você não tem novas notificações.',
    });
    
    const el = document.getElementById('notifyToast');
    if (el) {
      const toast = Toast.getOrCreateInstance(el);
      toast.show();
    }
  };

  const closeOffcanvas = () => {
    const el = document.getElementById('adminOffcanvas');
    if (el) {
      const instance = Offcanvas.getInstance(el) || new Offcanvas(el);
      instance.hide();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  /* --- Renderização da Interface --- */
  return (
    <div className="app-shell">
      
      {/* ===== HEADER / NAVBAR ===== */}
      <header className="salon-header">
        <div className="salon-header-container">
          
          {/* Lado Esquerdo: Botão Menu e Logo */}
          <div className="salon-header-brand">
            <button
              className="salon-btn-icon menu-toggle"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#adminOffcanvas"
              aria-controls="adminOffcanvas"
            >
              <FiMenu size={24} />
            </button>
            <div className="brand-info">
              <img src={logo} alt="Logo" className="brand-logo-small" />
              <div className="brand-text">
                <span className="brand-title">Painel Admin</span>
                <span className="brand-greeting">Olá, {adminName}</span>
              </div>
            </div>
          </div>

          {/* Centro: Barra de Pesquisa */}
          <form className="salon-search-form" onSubmit={handleSearch}>
            <FiSearch className="search-icon" size={18} />
            <input
              type="search"
              className="salon-search-input"
              placeholder="Pesquisar cliente, serviço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Lado Direito: Ações rápidas */}
          <div className="salon-header-actions">
            <button
              className="salon-btn-icon notification-btn"
              type="button"
              onClick={showNotificationToast}
              aria-label="Notificações"
            >
              <FiBell size={20} />
              {notifications.length > 0 && <span className="notification-badge"></span>}
            </button>
            <button
              className="salon-btn-primary"
              type="button"
              onClick={() => navigate('/admin/agendamentos?novo=1')}
            >
              <FiPlus size={18} />
              <span className="hide-mobile">Novo Agendamento</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== OFFCANVAS (MENU LATERAL) ===== */}
      <div className="offcanvas offcanvas-start salon-offcanvas" tabIndex="-1" id="adminOffcanvas">
        <div className="offcanvas-header salon-offcanvas-header">
          <img src={logo} alt="Logo" className="offcanvas-logo" />
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        
        <div className="offcanvas-body salon-offcanvas-body">
          {/* Perfil Mini no Menu */}
          <div className="offcanvas-profile">
            {adminAvatar ? (
              <img src={adminAvatar.startsWith('http') ? adminAvatar : `${API_BASE_URL}${adminAvatar}`} alt="Avatar" />
            ) : (
              <div className="avatar-fallback">{adminName.charAt(0)}</div>
            )}
            <div className="profile-info">
              <strong>{adminName}</strong>
              <small>Administrador</small>
            </div>
          </div>

          {/* Seções de Menu */}
          <div className="offcanvas-menu-section">
            <h6>Menu Principal</h6>
            <nav className="offcanvas-nav">
              {menuPrincipal.map((item) => (
                <button
                  key={item.to}
                  className={`offcanvas-link ${location.pathname.startsWith(item.to) ? 'active' : ''}`}
                  onClick={() => { navigate(item.to); closeOffcanvas(); }}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="offcanvas-menu-section">
            <h6>Gestão</h6>
            <nav className="offcanvas-nav">
              {menuGestao.map((item) => (
                <button
                  key={item.to}
                  className={`offcanvas-link ${location.pathname.startsWith(item.to) ? 'active' : ''}`}
                  onClick={() => { navigate(item.to); closeOffcanvas(); }}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="offcanvas-menu-section">
            <h6>Conta</h6>
            <nav className="offcanvas-nav">
              {menuConta.map((item) => (
                <button
                  key={item.to}
                  className={`offcanvas-link ${location.pathname.startsWith(item.to) ? 'active' : ''}`}
                  onClick={() => { navigate(item.to); closeOffcanvas(); }}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Botão de Sair */}
          <div className="offcanvas-footer">
            <button className="offcanvas-logout" onClick={handleLogout}>
              <FiLogOut size={20} />
              <span>Sair do sistema</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== CONTEÚDO PRINCIPAL (OUTLET) ===== */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* ===== TOAST (NOTIFICAÇÃO) ===== */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
        <div className="toast salon-toast" role="alert" aria-live="assertive" aria-atomic="true" id="notifyToast">
          <div className="toast-header">
            <strong className="me-auto text-pink">{toastData.title}</strong>
            <small className="text-muted">{toastData.time}</small>
            <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div className="toast-body">
            {toastData.message}
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default AdminLayout;