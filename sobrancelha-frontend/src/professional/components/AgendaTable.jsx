import React, { useState, useEffect } from 'react';
import { Clock, CalendarX, Plus, CheckCircle, Trash2, X } from 'lucide-react';

export default function AgendaTable() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [novoAgendamento, setNovoAgendamento] = useState({ cliente: '', servico: '', hora: '', status: 'pendente' });

  const API_URL = 'http://localhost:5000/api/clients';

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setAgendamentos(data.sort((a, b) => a.hora.localeCompare(b.hora)));
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgendamentos(); }, []);

  // FUNÇÃO: Concluir Atendimento
  const concluirAtendimento = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmado' })
      });
      fetchAgendamentos();
    } catch (err) { console.error(err); }
  };

  // FUNÇÃO: Excluir Agendamento
  const excluirAgendamento = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este agendamento?")) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchAgendamentos();
      } catch (err) { console.error(err); }
    }
  };

  // FUNÇÃO: Salvar Novo com verificação de conflito
  const salvarAgendamento = async (e) => {
    e.preventDefault();
    if (agendamentos.some(a => a.hora === novoAgendamento.hora)) {
      alert("Este horário já está ocupado!");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoAgendamento)
      });
      if (response.ok) {
        setShowModal(false);
        setNovoAgendamento({ cliente: '', servico: '', hora: '', status: 'pendente' });
        fetchAgendamentos();
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#D988B3' }}>Sincronizando...</div>;

  return (
    <div className="list-container" style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h3 style={{ fontWeight: '700', color: '#333', margin: 0 }}>Agenda do Dia</h3>
        <button onClick={() => setShowModal(true)} className="btn-novo" style={{ 
          background: '#D988B3', color: 'white', border: 'none', padding: '10px 20px', 
          borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600'
        }}>
          <Plus size={18} /> Novo Agendamento
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #f8f9fa' }}>
            <th style={{ padding: '12px', color: '#aaa', fontSize: '12px' }}>HORA</th>
            <th style={{ padding: '12px', color: '#aaa', fontSize: '12px' }}>CLIENTE</th>
            <th style={{ padding: '12px', color: '#aaa', fontSize: '12px' }}>SERVIÇO</th>
            <th style={{ padding: '12px', color: '#aaa', fontSize: '12px' }}>STATUS</th>
            <th style={{ padding: '12px', color: '#aaa', fontSize: '12px', textAlign: 'right' }}>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {agendamentos.length > 0 ? (
            agendamentos.map((item) => (
              <tr key={item.id} className="table-row" style={{ borderBottom: '1px solid #f8f9fa' }}>
                <td style={{ padding: '15px 12px', color: '#D988B3', fontWeight: '700' }}>{item.hora}</td>
                <td style={{ padding: '15px 12px', fontWeight: '600' }}>{item.cliente}</td>
                <td style={{ padding: '15px 12px', color: '#666' }}>{item.servico}</td>
                <td><span className={`status-badge ${item.status?.toLowerCase()}`}>{item.status}</span></td>
                <td style={{ textAlign: 'right', padding: '15px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    {item.status !== 'confirmado' && (
                      <button onClick={() => concluirAtendimento(item.id)} style={{ background: 'none', border: 'none', color: '#2ecc71', cursor: 'pointer' }} title="Concluir">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button onClick={() => excluirAgendamento(item.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }} title="Excluir">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#ccc' }}>Nenhum agendamento encontrado.</td></tr>
          )}
        </tbody>
      </table>

      {/* MODAL - Usando sua animação fadeIn */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '400px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ color: '#D988B3', margin: 0 }}>Novo Agendamento</h3>
              <X size={20} onClick={() => setShowModal(false)} style={{ cursor: 'pointer', color: '#888' }} />
            </div>
            <form onSubmit={salvarAgendamento}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Cliente</label>
                <input required type="text" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eee' }} 
                  onChange={e => setNovoAgendamento({...novoAgendamento, cliente: e.target.value})} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Serviço</label>
                <input required type="text" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eee' }} 
                  onChange={e => setNovoAgendamento({...novoAgendamento, servico: e.target.value})} />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Horário</label>
                <input required type="time" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eee' }} 
                  onChange={e => setNovoAgendamento({...novoAgendamento, hora: e.target.value})} />
              </div>
              <button type="submit" style={{ width: '100%', background: '#D988B3', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                Agendar Horário
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}