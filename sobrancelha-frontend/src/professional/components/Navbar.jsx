import { Bell } from "lucide-react";
import "../css/profissional.css";
import { getCurrentUser, logout } from "../../services/authGuard";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // volta para login
  };

  return (
    <header className="navbar">
      <h3>Olá, {user.name}!</h3>

      <div className="navbar-right">
        <button className="notification-btn">
          <Bell size={22} />
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  );
}
