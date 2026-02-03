import { Outlet } from "react-router-dom";
import Aside from "../components/admin/Aside";
import Navbar from "../components/admin/Navbar";
import "../styles/profissional.css";

export default function ProfessionalLayout() {
  return (
    <div className="professional-layout">
      <Aside />
      <div className="main-area">
        <Navbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}