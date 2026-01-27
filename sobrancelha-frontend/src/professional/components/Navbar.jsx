import { useState, useEffect, useRef } from "react";
import { Bell, Search, LogOut, Calendar, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../services/authGuard";
import '../css/profissional.css'; 

export default function Navbar() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const notifications = [
    { id: 1, title: "Novo Agendamento", desc: "Larissa para Design", time: "5 min", type: "calendar" },
    { id: 2, title: "Pagamento", desc: "Recebido via Pix", time: "1h", type: "check" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const paginas = [
      { nome: "Agenda", path: "/professional/appointments" },
      { nome: "Financeiro", path: "/professional/finance" },
      { nome: "Dashboard", path: "/professional/dashboard" }
    ];
    const destino = paginas.find(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    if (destino) navigate(destino.path);
    setSearchTerm("");
  };

  return (
    <header className="navbar">
      {/* LADO ESQUERDO */}
      <div className="user-greeting-nav">
        <span>Bem-vinda,</span>
        <h3>{user?.name || "Profissional"}</h3>
      </div>

      {/* CENTRO */}
      <form className="search-wrapper" onSubmit={handleSearch}>
        <Search size={18} color="#D988B3" />
        <input 
          type="text" 
          placeholder="Para onde deseja ir?" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      {/* DIREITA */}
      <div className="navbar-right">
        <div className="notification-container" ref={dropdownRef}>
          <button 
            className="notification-btn-modern" 
            onClick={() => setShowNotifications(!showNotifications)}
            type="button"
          >
            <Bell size={22} />
            <span className="notification-badge">{notifications.length}</span>
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="dropdown-header">
                <h4>Notificações</h4>
                <button className="clear-btn" onClick={() => setShowNotifications(false)}>Limpar</button>
              </div>
              <div className="dropdown-body">
                {notifications.map(n => (
                  <div key={n.id} className="notification-item">
                    <div className="notif-icon">
                      {n.type === "calendar" ? <Calendar size={16} /> : <Check size={16} />}
                    </div>
                    <div className="notif-content">
                      <p className="notif-title">{n.title}</p>
                      <p className="notif-desc">{n.desc}</p>
                      <span className="notif-time">{n.time} atrás</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">Ver todas as notificações</div>
            </div>
          )}
        </div>

        <div className="nav-divider"></div>

        <button className="logout-btn-modern" onClick={() => { logout(); navigate("/"); }}>
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}