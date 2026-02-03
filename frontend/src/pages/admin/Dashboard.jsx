import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, Scissors, DollarSign, BarChart2, User, Bell, Settings, LogOut } from "lucide-react";
import { logout, getCurrentUser } from "../../services/authGuard";

export default function Aside() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  return (
    <aside className="aside">
      {/* Perfil */}
      <div className="aside-profile" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img 
          src={user?.photo || ""} 
          alt="Perfil" 
          style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid white' }}
        />
        <h3 style={{ marginTop: '10px', fontSize: '1rem' }}>{user?.name || "Profissional"}</h3>
      </div>

      <nav className="menu-nav">
        {/* Seção Principal */}
        <span className="menu-section-label">Principal</span>
        <Link to="/professional/dashboard" className="menu-item"><LayoutDashboard size={18}/> Dashboard</Link>
        <Link to="/professional/appointments" className="menu-item"><Calendar size={18}/> Agendamentos</Link>
        <Link to="/professional/clients" className="menu-item"><Users size={18}/> Clientes</Link>
        <Link to="/professional/services" className="menu-item"><Scissors size={18}/> Serviços</Link>

        {/* Seção Gestão */}
        <span className="menu-section-label">Gestão</span>
        <Link to="/professional/finance" className="menu-item"><DollarSign size={18}/> Financeiro</Link>
        <Link to="/professional/reports" className="menu-item"><BarChart2 size={18}/> Relatório</Link>

        {/* Seção Conta */}
        <span className="menu-section-label">Conta</span>
        <Link to="/professional/account" className="menu-item"><User size={18}/> Perfil</Link>
        <Link to="/professional/notifications" className="menu-item"><Bell size={18}/> Notificações</Link>
        <Link to="/professional/settings" className="menu-item"><Settings size={18}/> Configuração</Link>

        {/* Botão Sair - MANTENHA DENTRO DO ASIDE */}
        <button onClick={() => { logout(); navigate("/"); }} className="logout-btn">
          <LogOut size={18}/> Sair
        </button>
      </nav>
    </aside>
  );
}