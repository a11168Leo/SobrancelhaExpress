import { User, Bell, Shield, LogOut } from 'lucide-react';

export default function Account() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Minha Conta</h1>
      
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <div className="p-6 flex items-center gap-4 border-b">
          <div className="h-20 w-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-3xl font-bold">P</div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Perfil do Profissional</h2>
            <p className="text-gray-500">Membro desde Janeiro 2024</p>
          </div>
        </div>

        <div className="p-2">
          {[
            { icon: User, label: "Editar Perfil", desc: "Nome, e-mail e foto" },
            { icon: Bell, label: "Notificações", desc: "Alertas de novos agendamentos" },
            { icon: Shield, label: "Segurança", desc: "Alterar senha e privacidade" },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-4 text-left">
                <div className="text-gray-400"><item.icon size={20}/></div>
                <div>
                  <p className="font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
              <div className="text-gray-300">→</div>
            </button>
          ))}
          <button className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-2">
            <LogOut size={20}/>
            <span className="font-semibold">Sair da Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
}