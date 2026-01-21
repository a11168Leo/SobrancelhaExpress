import { Link } from "react-router-dom";
import "../css/profissional.css";
import logo from "../assets/Logo2.svg"; // coloque seu logo nesta pasta

export default function Aside() {
  return (
    <aside className="aside">
      <div className="aside-logo">
        <img src={logo} alt="Logo" className="logo-img" />
        <h2 className="logo-text">Salão</h2>
      </div>

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
