import { User, TrendingUp, DollarSign, Calendar as CalIcon } from "lucide-react";
import DashboardCards from "../components/DashboardCards";
import api from "../../services/api";
import { getProfessionalId } from "../../services/authGuard";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const professionalId = getProfessionalId();
        const res = await api.get(`/finance/${professionalId}`);
        const data = res.data;

        setStats([
          { title: "Receita Total", value: `R$ ${data.receitaTotal}`, icon: DollarSign, color: "bg-yellow-100 text-yellow-700" },
          { title: "Atendimentos", value: data.atendimentos, icon: CalIcon, color: "bg-purple-100 text-purple-700" },
          { title: "Ticket Médio", value: `R$ ${data.ticketMedio.toFixed(2)}`, icon: TrendingUp, color: "bg-green-100 text-green-700" },
          { title: "Clientes", value: data.clients || 0, icon: User, color: "bg-blue-100 text-blue-700" }
        ]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <DashboardCard key={i} {...s} />)}
      </div>
    </div>
  );
}
