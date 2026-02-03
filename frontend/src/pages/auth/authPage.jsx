import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, Scissors, DollarSign, BarChart2, User, Bell, Settings, LogOut } from "lucide-react";
import "../../styles/profissional.css";

// Funções simples de auth (sem precisar da pasta services por enquanto)
const getCurrentUser = () => {
  const userStr = localStorage.getItem('@SobrancelhaExpress:user');
  return userStr ? JSON.parse(userStr) : null;
};

const logout = () => {
  localStorage.removeItem('@SobrancelhaExpress:token');
  localStorage.removeItem('@SobrancelhaExpress:user');
};

export default function Aside() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { to: "/professional/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/professional/appointments", icon: Calendar, label: "Agendamentos" },
    { to: "/professional/clients", icon: Users, label: "Clientes" },
    { to: "/professional/services", icon: Scissors, label: "Serviços" },
    { separator: true },
    { to: "/professional/finance", icon: DollarSign, label: "Financeiro" },
    { to: "/professional/reports", icon: BarChart2, label: "Relatório" },
    { separator: true },
    { to: "/professional/account", icon: User, label: "Perfil" },
    { to: "/professional/notifications", icon: Bell, label: "Notificações" },
    { to: "/professional/settings", icon: Settings, label: "Configuração" },
  ];

  return (
    <aside className="aside">
      {/* Perfil */}
      <div className="aside-profile">
        <img
          src={user?.profileImage || "https://via.placeholder.com/80?text=👤"}
          alt="Perfil"
          style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid white' }}
        />
        <h3 style={{ marginTop: '10px', fontSize: '1rem' }}>
          {user?.name?.split(" ")[0] || "Profissional"}
        </h3>
      </div>

      <nav className="menu-nav">
        {/* Seção Principal */}
        <span className="menu-section-label">Principal</span>
        {menuItems.map((item, index) => {
          if (item.separator) {
            return <div key={index} className="menu-separator" style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />;
          }
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`menu-item ${isActive(item.to) ? 'active' : ''}`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}

        {/* Botão Sair */}
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="menu-item logout-btn"
          style={{ marginTop: 'auto', color: '#ff6b6b' }}
        >
          <LogOut size={18} />
          Sair
        </button>
      </nav>
    </aside>
  );
}