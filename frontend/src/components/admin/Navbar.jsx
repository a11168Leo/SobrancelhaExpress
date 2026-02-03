import { Bell, Search } from "lucide-react";
import "../../styles/profissional.css";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('@SobrancelhaExpress:user'));

  return (
    <header className="navbar">
      <div className="search-wrapper">
        <Search size={18} color="#888" />
        <input type="text" placeholder="Buscar agendamento ou cliente..." />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Bell size={22} color="#D988B3" style={{ cursor: 'pointer' }} />
        <span style={{ fontWeight: '500' }}>Olá, {user?.name.split(' ')[0]}</span>
      </div>
    </header>
  );
}