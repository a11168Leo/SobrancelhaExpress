import { Plus, User, TrendingUp, DollarSign, Calendar as CalIcon } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: "Agendamentos", val: "12", icon: CalIcon, color: "text-blue-600" },
    { label: "Faturamento", val: "R$ 1.250", icon: DollarSign, color: "text-green-600" },
    { label: "Clientes", val: "154", icon: User, color: "text-purple-600" },
    { label: "Conversão", val: "92%", icon: TrendingUp, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Olá, Profissional!</h1>
          <p className="text-gray-500">Aqui está o que está acontecendo hoje.</p>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all">
          <Plus size={20} /> Novo Agendamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`p-2 w-fit rounded-lg bg-gray-50 mb-3 ${s.color}`}><s.icon size={24}/></div>
            <p className="text-gray-500 text-sm font-medium">{s.label}</p>
            <h3 className="text-2xl font-bold mt-1">{s.val}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="font-bold text-gray-800">Próximos Agendamentos</h2>
        </div>
        <div className="divide-y">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">A</div>
                <div>
                  <p className="font-semibold text-gray-800">Ana Clara</p>
                  <p className="text-xs text-gray-500">Design de Sobrancelha • 14:00</p>
                </div>
              </div>
              <button className="text-purple-600 text-sm font-medium">Ver Detalhes</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}