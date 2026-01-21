import { BarChart, PieChart, TrendingUp } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Relatórios e Estatísticas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm h-80 flex flex-col items-center justify-center text-gray-400">
          <BarChart size={48} className="mb-4 opacity-20" />
          <p>Comparativo Mensal (Gráfico)</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border shadow-sm h-80 flex flex-col items-center justify-center text-gray-400">
          <PieChart size={48} className="mb-4 opacity-20" />
          <p>Distribuição de Serviços</p>
        </div>
      </div>

      <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
        <div className="flex items-center gap-3 text-purple-700 mb-2">
          <TrendingUp size={20} />
          <h3 className="font-bold">Análise de Performance</h3>
        </div>
        <p className="text-sm text-purple-600">Seu faturamento cresceu 15% em relação ao mês passado!</p>
      </div>
    </div>
  );
}