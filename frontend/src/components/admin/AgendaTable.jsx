import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import "../../styles/profissional.css";

export default function AgendaTable() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/appointments/agenda'); // Rota que criamos no backend
        setAgendamentos(data);
      } catch (err) {
        console.error("Erro ao carregar agenda:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgendamentos();
  }, []);

  if (loading) return <div style={{ padding: '20px', color: '#D988B3' }}>Carregando agenda...</div>;

  return (
    <div className="list-container" style={{ margin: 0, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontWeight: '600', color: '#333' }}>Agenda do Dia</h3>
        <span style={{ fontSize: '12px', color: '#888' }}>{agendamentos.length} atendimentos</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #FFF6FB' }}>
            <th style={{ padding: '12px 5px' }}>Hora</th>
            <th>Cliente</th>
            <th>Serviço</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {agendamentos.map((item) => (
            <tr key={item._id} style={{ borderBottom: '1px solid #FFF6FB' }}>
              <td style={{ padding: '15px 5px', fontWeight: '700', color: '#D988B3' }}>{item.startTime}</td>
              <td style={{ fontWeight: '500' }}>{item.clientId?.name}</td>
              <td style={{ color: '#666' }}>{item.serviceId?.name}</td>
              <td><span className={`status-badge ${item.status || 'confirmado'}`}>{item.status || 'Confirmado'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}