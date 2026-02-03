import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, Scissors, DollarSign, BarChart2, User, Bell, Settings, LogOut } from "lucide-react";
import { logout, getCurrentUser } from "../../services/authGuard";
import "../../styles/profissional.css"; // Certifique-se que o CSS abaixo está nesse arquivo

export default function Aside() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { to: "/professional/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/professional/appointments", icon: Calendar, label: "Agendamentos" },
    { to: "/professional/clients", icon: Users, label: "Clientes" },
    { to: "/professional/services", icon: Scissors, label: "Serviços" },
    { separator: true },
    { to: "/professional/finance", icon: DollarSign, label: "Financeiro" },
    { to: "/professional/reports", icon: BarChart2, label: "Relatórios" },
    { separator: true },
    { to: "/professional/account", icon: User, label: "Perfil" },
    { to: "/professional/notifications", icon: Bell, label: "Notificações" },
    { to: "/professional/settings", icon: Settings, label: "Configurações" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="aside">
      {/* Perfil no topo */}
      <div className="aside-profile">
        <img
          src={user?.photo || "https://via.placeholder.com/80?text=👤"}
          alt="Perfil"
          className="profile-img"
        />
        <h3>{user?.name?.split(" ")[0] || "Profissional"}</h3>
        <p className="role-text">{user?.role === "admin" ? "Administrador" : "Profissional"}</p>
      </div>

      {/* Navegação */}
      <nav className="menu-nav">
        {menuItems.map((item, index) => {
          if (item.separator) {
            return <div key={index} className="menu-separator" />;
          }
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`menu-item ${isActive(item.to) ? "active" : ""}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Botão Sair no final */}
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="menu-item logout-btn"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </nav>
    </aside>
  );
}