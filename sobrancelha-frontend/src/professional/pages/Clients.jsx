import { useState } from 'react';
import { Search, MoreVertical, Phone, Calendar, Star } from 'lucide-react';

const Clients = () => {
  // Dados de exemplo (Mock)
  const [clientes] = useState([
    { 
      id: 1, 
      nome: "Juliana Andrade", 
      telefone: "(11) 98888-7777", 
      ultimoAgendamento: "15/01/2024", 
      servicoFrequente: "Design com Henna", 
      status: "Ativo" 
    },
    { 
      id: 2, 
      nome: "Roberta Lima", 
      telefone: "(11) 97777-6666", 
      ultimoAgendamento: "02/12/2023", 
      servicoFrequente: "Micropigmentação", 
      status: "Inativo" 
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Clientes</h1>
        <div className="relative w-64">
          <input 
            type="text" 
            placeholder="Buscar cliente..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Cliente</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contato</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Serviço Frequente</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Último Agend.</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{cliente.nome}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone size={14} /> {cliente.telefone}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                   <div className="flex items-center gap-2">
                    <Star size={14} className="text-yellow-500" /> {cliente.servicoFrequente}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} /> {cliente.ultimoAgendamento}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    cliente.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {cliente.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients;