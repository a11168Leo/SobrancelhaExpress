import React, { useState, useEffect } from 'react';

export default function AgendaTable() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        setLoading(true);

        // 1. Faz a chamada real para o seu servidor
        const response = await fetch('http://localhost:5000/api/clients');

        if (!response.ok) {
          throw new Error('Falha ao conectar com o servidor');
        }

        const data = await response.json();

        // 2. AQUI ESTÁ A MUDANÇA: 
        // Em vez de usar dataReal, usamos 'data' que veio do fetch
        setAgendamentos(data);

      } catch (err) {
        setError("Erro ao carregar dados da base de dados.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamentos();
  }, []);

  if (loading) return <div style={{ padding: '20px', color: '#D988B3' }}>Carregando agenda...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div className="list-container" style={{ margin: 0, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontWeight: '600', color: '#333' }}>Agenda do Dia</h3>
        <span style={{ fontSize: '12px', color: '#888' }}>{agendamentos.length} atendimentos hoje</span>
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
            <tr key={item.id} style={{ borderBottom: '1px solid #FFF6FB' }}>
              <td style={{ padding: '15px 5px', fontWeight: '700', color: '#D988B3' }}>
                {item.hora}
              </td>
              <td style={{ fontWeight: '500' }}>{item.cliente}</td>
              <td style={{ color: '#666' }}>{item.servico}</td>
              <td>
                <span className={`status-badge ${item.status}`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}