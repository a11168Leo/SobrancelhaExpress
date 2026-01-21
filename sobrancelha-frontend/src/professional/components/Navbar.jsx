import { Bell } from "lucide-react";
import "../css/profissional.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <h3>Dashboard</h3>

      <button className="notification-btn">
        <Bell size={22} />
      </button>
    </header>
  );
}
