import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardCards from "../components/DashboardCards";

export default function Dashboard() {
  const [stats, setStats] = useState({
    appointments: 0,
    revenue: 0,
    clients: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/professional/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="dashboard-cards">
        <DashboardCards title="Atendimentos" value={stats.appointments} />
        <DashboardCards title="Receita Total" value={`R$ ${stats.revenue}`} />
        <DashboardCards title="Clientes" value={stats.clients} />
        <DashboardCards title="Taxa de Conversão" value={`${stats.conversionRate}%`} />
      </div>
    </div>
  );
}
