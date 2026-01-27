import { useEffect, useState } from "react";
import { User, Phone, Calendar, Search, MoreHorizontal, Filter, MessageCircle, Loader2 } from "lucide-react";
import api from "../../services/api";
import "../css/profissional.css";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const res = await api.get("/professional/clients");
        setClients(res.data);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  // FILTRO: Busca por nome ou por número de telefone
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, ""))
  );

  // Função para abrir o WhatsApp com mensagem automática
  const handleWhatsApp = (phone, name) => {
    const cleanPhone = phone.replace(/\D/g, ""); // Remove parênteses e traços
    const message = encodeURIComponent(`Olá ${name}, tudo bem? Aqui é do salão! Gostaria de conversar sobre seu próximo agendamento.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  return (
    <div className="cli-container acc-fade-in">
      <div className="cli-header">
        <div>
          <h1 className="acc-main-title">Meus Clientes</h1>
          <p className="calendar-subtitle">Busque por nome ou telefone para contato rápido</p>
        </div>
        
        <div className="cli-actions">
          <div className="cli-search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Nome ou telefone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="cli-filter-btn"><Filter size={18} /></button>
        </div>
      </div>

      <div className="cli-card-table">
        {loading ? (
          <div className="cli-loading">
            <Loader2 className="animate-spin" size={30} color="#D988B3" />
            <p>Sincronizando base de dados...</p>
          </div>
        ) : (
          <table className="cli-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contato</th>
                <th>Última Visita</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((c) => (
                <tr key={c._id} className="cli-row">
                  <td>
                    <div className="cli-user-info">
                      <div className="cli-avatar-mini">{c.name.charAt(0)}</div>
                      <span className="cli-name">{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="cli-phone">
                      <Phone size={14} /> {c.phone}
                    </div>
                  </td>
                  <td>
                    <div className="cli-date">
                      <Calendar size={14} /> 
                      {c.lastAppointment ? new Date(c.lastAppointment).toLocaleDateString() : "Novo Cliente"}
                    </div>
                  </td>
                  <td>
                    <span className={`cli-status-badge ${c.status?.toLowerCase() || 'ativo'}`}>
                      {c.status || "Ativo"}
                    </span>
                  </td>
                  <td>
                    <div className="cli-actions-cell">
                      <button 
                        className="cli-whatsapp-btn"
                        onClick={() => handleWhatsApp(c.phone, c.name)}
                        title="Enviar mensagem"
                      >
                        <MessageCircle size={18} />
                        <span>WhatsApp</span>
                      </button>
                      <button className="cli-more-btn"><MoreHorizontal size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && filteredClients.length === 0 && (
          <div className="cli-empty">Ops! Nenhum cliente encontrado com esse termo.</div>
        )}
      </div>
    </div>
  );
}