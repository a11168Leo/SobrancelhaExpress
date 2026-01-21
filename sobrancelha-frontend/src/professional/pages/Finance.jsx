import { TrendingUp, Users, Ticket, CreditCard } from 'lucide-react';

export default function Finance() {
  const cards = [
    { label: "Receita Total", val: "R$ 8.450,00", icon: CreditCard, color: "bg-green-100 text-green-700" },
    { label: "Ticket Médio", val: "R$ 120,00", icon: Ticket, color: "bg-blue-100 text-blue-700" },
    { label: "Atendimentos", val: "74", icon: Users, color: "bg-purple-100 text-purple-700" },
    { label: "Taxa de Conversão", val: "88%", icon: TrendingUp, color: "bg-orange-100 text-orange-700" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`p-3 w-fit rounded-xl mb-4 ${c.color}`}><c.icon size={24}/></div>
            <p className="text-gray-500 text-sm font-medium">{c.label}</p>
            <h3 className="text-2xl font-bold text-gray-800">{c.val}</h3>
          </div>
        ))}
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-64 flex items-center justify-center">
        <p className="text-gray-400 font-medium">Gráfico de Receita Mensal (Integração com Chart.js/Recharts)</p>
      </div>
    </div>
  );
}