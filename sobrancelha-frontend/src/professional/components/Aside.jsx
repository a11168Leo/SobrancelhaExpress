import { Link } from "react-router-dom";
import "../css/profissional.css";

export default function Aside() {
  return (
    <aside className="aside">
      <h2 className="logo">Salão</h2>

      <nav className="menu">
        <Link to="/professional/dashboard">Dashboard</Link>
        <Link to="/professional/services">Serviços</Link>
        <Link to="/professional/appointments">Agendamentos</Link>
        <Link to="/professional/clients">Clientes</Link>
        <Link to="/professional/finance">Financeiro</Link>
        <Link to="/professional/reports">Relatórios</Link>
        <Link to="/professional/account">Conta</Link>
      </nav>
    </aside>
  );
}
