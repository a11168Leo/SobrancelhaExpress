import { useState } from 'react';
import { Plus, Scissors, ChevronRight } from 'lucide-react';

export default function Services() {
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedSub, setSelectedSub] = useState('');

  const estrutura = {
    "Sobrancelha": {
      "Design": ["Pinça", "Linha", "Henna"],
      "Micro": ["Fio a Fio", "Shadow", "Ombré"]
    },
    "Cílios": {
      "Extensão": ["Volume Russo", "Fio a Fio", "Híbrido"],
      "Lifting": ["Nutrição", "Tintura"]
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Serviços</h1>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Novo Serviço
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-700 mb-4">Categorização do Serviço</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Categoria</label>
            <select className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-purple-200 outline-none transition-all" 
              onChange={(e) => {setSelectedCat(e.target.value); setSelectedSub('')}}>
              <option value="">Selecione...</option>
              {Object.keys(estrutura).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Subcategoria</label>
            <select className="w-full border rounded-xl p-3 bg-gray-50 outline-none" 
              disabled={!selectedCat}
              onChange={(e) => setSelectedSub(e.target.value)}>
              <option value="">Selecione...</option>
              {selectedCat && Object.keys(estrutura[selectedCat]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Especificação (Sub2)</label>
            <select className="w-full border rounded-xl p-3 bg-gray-50 outline-none" disabled={!selectedSub}>
              <option value="">Selecione...</option>
              {selectedSub && estrutura[selectedCat][selectedSub].map(s2 => <option key={s2} value={s2}>{s2}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}