import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar as CalIcon, Users, Scissors, DollarSign, LogOut } from "lucide-react";
import "../../styles/profissional.css";

export default function Aside() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('@SobrancelhaExpress:user'));

  const handleLogout = () => {
    localStorage.removeItem('@SobrancelhaExpress:token');
    localStorage.removeItem('@SobrancelhaExpress:user');
    navigate("/");
  };

  return (
    <aside className="aside">
      <div className="aside-profile">
        <img src={user?.profileImage || "https://via.placeholder.com/80"} alt="Perfil" />
        <h3>{user?.name || "Leonardo"}</h3>
      </div>
      <nav className="menu-nav">
        <span className="menu-label">Principal</span>
        <Link to="/professional/dashboard" className="menu-item"><LayoutDashboard size={18}/> Dashboard</Link>
        <Link to="/professional/dashboard" className="menu-item"><CalIcon size={18}/> Agenda</Link>
        <Link to="#" className="menu-item"><Users size={18}/> Clientes</Link>
        <Link to="#" className="menu-item"><Scissors size={18}/> Serviços</Link>
        
        <button onClick={handleLogout} className="menu-item" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', marginTop: 'auto' }}>
          <LogOut size={18}/> Sair
        </button>
      </nav>
    </aside>
  );
}